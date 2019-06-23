import React, { Component } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, FlatList, Dimensions } from 'react-native'
import { Toolbar, Button } from 'react-native-material-ui'
import LinearGradient from 'react-native-linear-gradient'
// testing with events because my lazy crew members didn't write a single news story yet!!
// talk about lame people
import { EventsSchema as NewsSchema } from './../../util/db'

const ScreenDimensions = Dimensions.get('window')

export default class News extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      categories: null, news: null, category: null, search: null, page: null
    }

    this.ABORT_CONTROLLER = new AbortController
    this.LISTVIEW_REF = null
  }

  componentDidMount()
  {
    setTimeout(this.loadQueryItems.bind(this), 400)

    // @todo maybe check on dataLoader.background initial data sync, if failed or delayed then abort and make subsequent query here
    // due to the fact that this is free work, and having 7 days to finish up, let's forget about all of the extra premium features
  }

  loadQueryItems()
  {
    const { category, search, page=1 } = this.state

    this.props.db.open().then(realm =>
    {
      let res = realm.objects(NewsSchema.name).filtered('TRUEPREDICATE DISTINCT(category)')
        , categories = res.map(item => Object.assign({}, item)).map(c => c.category)
      this.setState({ categories })

      const per_page = environ.posts_per_page || 10, page = Math.max(1, +this.state.page)
      res = realm.objects(NewsSchema.name).filtered('TRUEPREDICATE SORT(originId ASC)')

      if ( category ) {
        res = res.filtered('category=$0', category)
      }

      if ( search ) {
        res = res.filtered('content contains[c] $0 or title contains[c] $0', search)
      }

      res = res.slice(0, per_page*page)
      this.setState({ news: res.map(item => Object.assign({}, item)).map(this.parseImages) })
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  parseImages(item)
  {
    item.images = item.images.map(name => `https://firebasestorage.googleapis.com/v0/b/${environ.firebase_bucket}/o/${encodeURIComponent(name)}?alt=media&token=${environ.firebase_storage_download_token}`)
    return item
  }

  switchCategory(category)
  {
    category = this.state.category === category ? null : category
    return this.setState({ category, news: null, end_results: null }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  applySearch()
  {
    const { search } = this.state
    return this.setState({ search, news: null, end_results: null }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  onItemsListScroll({ layoutMeasurement, contentOffset, contentSize })
  {
    const paddingToBottom = ScreenDimensions.height * .70
        , { loading_more, end_results } = this.state
        , load_more = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

    if ( ! loading_more && ! end_results && load_more ) {
      this.setState({loading_more: true}, _ =>
      {
        const { category, search, page=1, news=[] } = this.state

        this.props.db.open().then(realm =>
        {
          const per_page = environ.posts_per_page || 10, page = Math.max(1, +this.state.page) +1
          let res = realm.objects(NewsSchema.name).filtered('TRUEPREDICATE SORT(originId ASC)')

          if ( category ) {
            res = res.filtered('category=$0', category)
          }

          if ( search ) {
            res = res.filtered('content contains[c] $0 or title contains[c] $0', search)
          }

          res = res.slice(per_page*(page-1), per_page*page)

          const newItems = res.map(item => Object.assign({}, item)).map(this.parseImages)

          setTimeout(_ => this.setState({ page, loading_more: false, end_results: !newItems.length, news: news.concat(newItems) }), 6000)
        }).catch(err => (environ.dev && console.log('err', err), undefined))
      })
    }

    // attempt 1
    // const { y } = e.contentOffset, pre = +this.state.scroll_y||0, diff = y - pre, state = {
    //   scroll_y: y
    // }

    // if ( diff > 0 ) {
    //   state.header_pad_y = diff

    //   console.log('deduct pad to', 15 - 1)
    // }

    // this.setState(state)


    // attempt 0
    // // if ( this.TRIGGERED_SCROLL )
    // //   return this.TRIGGERED_SCROLL = null

    // // this.TRIGGERED_SCROLL = true

    // const { y } = e.contentOffset, pre = this.getHeaderYPadding()

    // this.setState({ header_pad_y: y }, _ =>
    // {
    //   return

    //   const post = this.getHeaderYPadding()
    //       , diff = Math.floor(Math.max(0, post - pre))

    //   console.log( y, diff, y + diff )

    //   this.LISTVIEW_REF.scrollToOffset({ offset: y + post - pre })
    // })

    // // this.LISTVIEW_REF.scrollToOffset({ offset: 0 })
  }

  getHeaderYPadding()
  {
    const padYstate = +this.state.header_pad_y
    return padYstate > 0 ? Math.floor(Math.max(0, 15 - Math.min(15, padYstate))) : 15
  }

  render()
  {
    const padY = this.getHeaderYPadding()

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']}>
          <View style={{ paddingTop: 15||padY, paddingBottom: 15||padY, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement="Actualités"
              searchable={{
                autoFocus: true,
                placeholder: 'Recherche',
                onChangeText: text => this.setState({ searchable_text: text }),                
                onSubmitEditing: _ => this.setState({ search: this.state.searchable_text }, _ => this.applySearch()),
                onSearchClosed: _ => this.setState({ search: null }, _ => this.applySearch()),
              }}
              onLeftElementPress={e => this.props.state.set({ isMenuOpen: true })}
              style={{
                container: { backgroundColor: 'transparent' }
              }}
            />
          </View>

          <ScrollView horizontal={true} style={{}}>
            
            {(this.state.categories||[]).map((cat,i) => <Button accent key={i}
              style={{text: {
                color: '#fff', fontWeight: '600'
              }, container: {
                borderBottomWidth: 3,
                borderBottomColor: this.state.category == cat ? '#fff' : 'transparent',
                borderRadius: 0
              }}}
              text={cat} upperCase={false}
              onPress={e => this.switchCategory(cat)} />)}

          </ScrollView>
        </LinearGradient>

        { (null === this.state.categories || null === this.state.news)
          && <ActivityIndicator size="large" color="#55d1f3" style={{ flex: 1 }} /> }
        
        {this.state.news && !!this.state.news.length && <FlatList style={{ flex: 1, backgroundColor: '#f1f1f1' }}
          data={ (this.state.news || [])
            .concat( ...(this.state.loading_more ? [{ ActivityIndicator: true, id: Number.MAX_SAFE_INTEGER }] : []) )
            .map(data => (data.key=`${data.id}`, data))
          }
          ref={r => this.LISTVIEW_REF = r}
          onScroll={e => this.onItemsListScroll(e.nativeEvent)}
          onChangeVisibleRows={e => console.log('onChangeVisibleRows', e)}
          renderItem={({item}) => <View>
            { item.ActivityIndicator ? <ActivityIndicator size="small" color="#55d1f3" style={{ height: 50 }} /> : <React.Fragment>
              <Image source={{uri: item.images[0]}} style={{ flex: 1, height: 200, width: 200 }} onError={e => console.log('load error', e)} />
              <Text>{ item.title }</Text>
            </React.Fragment>}
          </View>}>
        </FlatList>}

        {this.state.news && this.state.news.length === 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{i18n('Nothing found.')}</Text>
        </View>}        
      </View>
    )
  }
}
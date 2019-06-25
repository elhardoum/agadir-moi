import React, { Component } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, FlatList, Dimensions, StatusBar } from 'react-native'
import { Toolbar, Button } from 'react-native-material-ui'
import LinearGradient from 'react-native-linear-gradient'
import { NewsSchema } from './../../util/db'
import { CachedImage, ImageCacheProvider } from 'react-native-cached-image'
import Story from './item'
import moment from 'moment'
import 'moment/locale/fr'

moment.locale('fr')

const ScreenDimensions = Dimensions.get('window')

export const imageOverlayGradients = [
  'rgba(0, 0, 0, 0.12156862745098039)',
  'rgba(0, 0, 0, 0.32941176470588235)',
  'rgba(0, 0, 0, 0.6392156862745098)',
]

export const PARSE_IMAGES = (item) =>
{
  item.images = item.images.map(name => `https://firebasestorage.googleapis.com/v0/b/${environ.firebase_bucket}/o/${encodeURIComponent(name)}?alt=media&token=${environ.firebase_storage_download_token}`)
  return item
}

export default class News extends Component
{
  constructor(props)
  {
    super(props)
    this.DB_SCHEMA = NewsSchema
    this.Single = Story

    this.state = {
      categories: null, news: null, category: null, search: null, page: null
    }

    this.LISTVIEW_REF = null
    this.componentId = 'news'
    this.INTERVAL_ID = null
    this.LISTVIEW_SCROLL = null
  }

  async componentDidMount()
  {
    const start = +new Date

    await new Promise(resolve => this.INTERVAL_ID=setInterval(_ =>
    {
      const { menuClosed=true } = this.props.state

      if ( menuClosed ) // resolve when the menu is closed
        return clearInterval(this.INTERVAL_ID), resolve()

      if ( +new Date - start > 1200 ) // can't afford having users wait more than a second
        return clearInterval(this.INTERVAL_ID), resolve()
    }, 50))

    setTimeout(this.loadQueryItems.bind(this), 300)

    // @todo maybe check on dataLoader.background initial data sync, if failed or delayed then abort and make subsequent query here
    // due to the fact that this is free work, and having 7 days to finish up, let's forget about all of the extra premium features
  }

  componentWillReceiveProps(props)
  {
    const { post_id } = this.state

    let id
    try { id = +(this.props.history.location.hash||'').match(/id\=(\d+)/i)[1] } catch(e) {}
    this.setState({ post_id: id || null }, _ =>
    {
      if ( post_id && ! id ) {
        let { contentOffset: { y=undefined }={} } = this.LISTVIEW_SCROLL || {}
        y !== undefined && setTimeout(_ => this.LISTVIEW_REF.scrollToOffset({ animated: false, offset: y }))
      }
    })
  }

  componentWillUnmount()
  {
    this.INTERVAL_ID && clearInterval(this.INTERVAL_ID)
  }

  getSortBy = () => this.selectValue({ news: 'originId ASC', events: this.state.event_sort_start_date ? 'date_from DESC' : 'originId ASC' })

  loadQueryItems()
  {
    const { category, search, page=1 } = this.state

    this.props.db.open().then(realm =>
    {
      let res = realm.objects(this.DB_SCHEMA.name).filtered('TRUEPREDICATE DISTINCT(category)')
        , categories = res.map(item => objPluck(item)).map(c => c.category)
      this.setState({ categories })

      const per_page = environ.posts_per_page || 10, page = Math.max(1, +this.state.page||1)
      res = realm.objects(this.DB_SCHEMA.name).filtered(`TRUEPREDICATE SORT(${this.getSortBy()})`)

      if ( category ) {
        res = res.filtered('category=$0', category)
      }

      if ( search ) {
        res = res.filtered('content contains[c] $0 or title contains[c] $0', search)
      }

      res = res.slice(0, per_page*page)
      this.setState({ news: res.map(item => objPluck(item)).map(PARSE_IMAGES) })
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  switchCategory(category)
  {
    category = this.state.category === category ? null : category
    return this.setState({ category, news: null, end_results: null, page: undefined }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  applySearch()
  {
    const { search } = this.state
    return this.setState({ search, news: null, end_results: null, post: null, page: undefined }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  applySort()
  {
    return this.setState({ news: null, end_results: null, post: null, page: undefined }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
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
          const per_page = environ.posts_per_page || 10, page = Math.max(1, +this.state.page||1) +1
          let res = realm.objects(this.DB_SCHEMA.name).filtered(`TRUEPREDICATE SORT(${this.getSortBy()})`)

          if ( category ) {
            res = res.filtered('category=$0', category)
          }

          if ( search ) {
            res = res.filtered('content contains[c] $0 or title contains[c] $0', search)
          }

          res = res.slice(per_page*(page-1), per_page*page)

          const newItems = res.map(item => objPluck(item)).map(PARSE_IMAGES)

          this.setState({ page, loading_more: false, end_results: !newItems.length, news: news.concat(newItems) })
        }).catch(err => (environ.dev && console.log('err', err), undefined))
      })
    }
  }

  selectValue = ({ news, events }) => ({news, events}[this.componentId])

  render()
  {
    const { statusBarHeight=24 } = this.props.state
        , { post_id } = this.state
        , post = post_id ? (this.state.news||[]).find(x => x.id == post_id) : null


    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
          paddingTop: statusBarHeight
        }}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement={ this.selectValue({ news: post ? 'Actualité' : 'Actualités', events: post ? 'Événement' : 'Événements' }) }
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
              { ...this.selectValue({news: {}, events: {
                rightElement: {
                  menu: {
                    icon: 'more-vert',
                    labels: [
                      `${!this.state.event_sort_start_date ? '✓ ' : ''}Trier par date publié`,
                      `${this.state.event_sort_start_date ? '✓ ' : ''}Trier par date événements`,
                    ]
                  }
                },
                onRightElementPress: ({index}) =>
                {
                  !!this.state.event_sort_start_date !== !!index && this.setState({ event_sort_start_date: !!index }, _ => this.applySort())
                },
              }}) }
            />
          </View>

          { ! post && <ScrollView horizontal={true} style={{}}>
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
          </ScrollView> }
        </LinearGradient>

        { (null === this.state.categories || null === this.state.news)
          && <ActivityIndicator size="large" color="#55d1f3" style={{ flex: 1 }} /> }
        
        {this.state.news && !!this.state.news.length && <FlatList style={{ flex: 1, backgroundColor: '#f1f1f1', ...(post && {
          display: 'none'
        }) }}
          data={ (this.state.news || [])
            .concat( ...(this.state.loading_more ? [{ ActivityIndicator: true, id: Number.MAX_SAFE_INTEGER }] : []) )
            .map(data => (data.key=`${data.id}`, data))
          }
          ref={r => this.LISTVIEW_REF = r}
          onScroll={({nativeEvent}) => (!post && (this.LISTVIEW_SCROLL=nativeEvent), this.onItemsListScroll(nativeEvent))}
          renderItem={({item, index}) => <View>
            { item.ActivityIndicator ? <ActivityIndicator size="small" color="#55d1f3" style={{ height: 50 }} /> : <View
              style={{ margin: 20, marginTop: index ? 5 : 20, height: 200, flexDirection: 'column' }}>
              
              <ImageCacheProvider
                urlsToPreload={item.images}>
                <CachedImage
                  source={item.images[0] && {uri: item.images[0]} || require('./../../images/newspaper-default.jpg')}
                  style={{ width: '100%', height: 200, borderRadius: 15, position: 'absolute', left: 0 }} />
              </ImageCacheProvider>

              <LinearGradient colors={imageOverlayGradients} style={{
                position: 'absolute', bottom: 0, width: '100%', height: '100%', left: 0, borderRadius: 15,
              }}></LinearGradient>

              <View style={{
                position: 'absolute', bottom: 0, width: '100%',
                borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
              }}>
                <Text style={{
                  color: '#fff',
                  fontFamily: 'AvantGardeBookBT',
                  fontSize: 16,

                  paddingLeft: 20, paddingRight: 20,
                  paddingBottom: 5, paddingTop: 10,

                  textShadowColor: '#000',
                  textShadowOffset: {width: -1, height: 1},
                  textShadowRadius: 10,
                }}>{item.title}</Text>

                { <Text style={{
                  color: '#fff', fontSize: 13,
                  paddingLeft: 20, paddingRight: 20,
                  paddingBottom: 10,
                  fontFamily: 'AvantGardeBookBT',

                  textShadowColor: '#000',
                  textShadowOffset: {width: -1, height: 1},
                  textShadowRadius: 10,
                }}>{this.selectValue({news: moment(item.timeCreated).format('DD MMMM YYYY HH:mm'), events: (() =>
                  {
                    let date_from = moment(item.date_from)
                      , date_to = moment(item.date_to)
                      , from_m = date_from.format('MMM')
                      , to_m = date_to.format('MMM')
                      , from_dm = date_from.format('DD MMM')
                      , to_dm = date_to.format('DD MMM')
                      , from_y = date_from.format('YYYY')
                      , to_y = date_to.format('YYYY')
                      , date_display

                    switch ( true ) {
                      case from_dm === to_dm && from_y === to_y:
                        date_display = `${date_from.format('DD')} ${date_from.format('MMM')} ${date_from.format('YYYY')}`
                        break

                      case from_m === to_m && from_y === to_y:
                        date_display = `${date_from.format('DD')}-${date_to.format('DD')} ${date_from.format('MMM')} ${date_from.format('YYYY')}`
                        break

                      case from_y === to_y:
                        date_display = `${date_from.format('DD')} ${date_from.format('MMM')} - ${date_to.format('DD')} ${date_to.format('MMM')} ${date_from.format('YYYY')}`
                        break

                      default:
                        date_display = `${date_from.format('DD')} ${date_from.format('MMM')} ${date_from.format('YYYY')} - ${date_to.format('DD')} ${date_to.format('MMM')} ${date_to.format('YYYY')}`
                        break
                    }

                    return `${date_display} ${date_from.format('HH:mm')}-${date_to.format('HH:mm')}`
                  })()})}</Text>}

              </View>

              <Button accent text={''} upperCase={false}
                style={{container: {
                  position: 'absolute', top: 0, width: '100%', height: '100%', backgroundColor: 'transparent', borderRadius: 15,
                }}}
                onPress={e => this.props.pushState(`/${this.selectValue({news: 'news', events: 'events'})}#id=${item.id}`)} />
            </View>}
          </View>}>
        </FlatList>}

        { post && <this.Single {...this.props} post={post} overlayGradients={imageOverlayGradients} /> }

        {this.state.news && this.state.news.length === 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{i18n('Nothing found.')}</Text>
        </View>}
      </View>
    )
  }
}
import React, { Component } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, FlatList, Dimensions, StatusBar, Linking, RefreshControl } from 'react-native'
import { Toolbar, Button } from 'react-native-material-ui'
import LinearGradient from 'react-native-linear-gradient'
import { PhonesSchema } from './../../util/db'

const ScreenDimensions = Dimensions.get('window')

export default class Phones extends Component
{
  constructor(props)
  {
    super(props)
    this.DB_SCHEMA = PhonesSchema

    this.state = {
      categories: null, phones: null, category: null, search: null, page: null
    }

    this.LISTVIEW_REF = null
    this.INTERVAL_ID = null
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
  }

  componentWillUnmount()
  {
    this.INTERVAL_ID && clearInterval(this.INTERVAL_ID)
  }

  getSortBy = () => 'id ASC'

  loadQueryItems()
  {
    const { category, search, page=1 } = this.state

    this.props.db.open().then(realm =>
    {
      let res = realm.objects(this.DB_SCHEMA.name).filtered('TRUEPREDICATE DISTINCT(category)')
        , categories = res.map(item => objPluck(item)).map(c => c.category)
      this.setState({ categories })

      const per_page = +environ.phones_per_page || +environ.posts_per_page || 10, page = Math.max(1, +this.state.page||1)
      res = realm.objects(this.DB_SCHEMA.name).filtered(`TRUEPREDICATE SORT(${this.getSortBy()})`)

      if ( category ) {
        res = res.filtered('category=$0', category)
      }

      if ( search ) {
        res = res.filtered('group contains[c] $0 or number contains[c] $0', search)
      }

      res = res.slice(0, per_page*page)
      this.setState({ phones: res.map(item => objPluck(item)), refreshing: false })
    }).catch(err => (environ.dev && console.log('err', err), this.setState({refreshing: false}), undefined))
  }

  switchCategory(category)
  {
    category = this.state.category === category ? null : category
    return this.setState({ category, phones: null, end_results: null, page: undefined }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  applySearch()
  {
    const { search } = this.state
    return this.setState({ search, phones: null, end_results: null, page: undefined }, _ => setTimeout(this.loadQueryItems.bind(this), 100))
  }

  onRefresh()
  {
    this.setState({ refreshing: true, phones: null, end_results: null, page: undefined }, this.loadQueryItems)
  }

  onItemsListScroll({ layoutMeasurement, contentOffset, contentSize })
  {
    const paddingToBottom = ScreenDimensions.height * .70
        , { loading_more, end_results } = this.state
        , load_more = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

    if ( ! loading_more && ! end_results && load_more ) {
      this.setState({loading_more: true}, _ =>
      {
        const { category, search, page=1, phones=[] } = this.state

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

          const newItems = res.map(item => objPluck(item))

          this.setState({ page, loading_more: false, end_results: !newItems.length, phones: phones.concat(newItems) })
        }).catch(err => (environ.dev && console.log('err', err), undefined))
      })
    }
  }

  render()
  {
    const { statusBarHeight=24 } = this.props.state

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
          paddingTop: statusBarHeight
        }}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement={ 'Pratique en cas d\'urgence' }
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

          { this.state.categories && !!this.state.categories.length && <ScrollView horizontal={true} style={{
            backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5', minHeight: 44,
          }}>
            {(this.state.categories||[]).map((cat,i) => <Button accent key={i}
              style={{text: {
                color: '#1578a9', fontWeight: '600',
              }, container: {
                borderBottomWidth: 2,
                borderBottomColor: this.state.category == cat ? '#0071bb' : 'transparent',
                borderRadius: 0,
                height: '100%',
              }}}
              text={cat} upperCase={false}
              onPress={e => this.switchCategory(cat)} />)}
          </ScrollView> }
        </LinearGradient>

        { (null === this.state.categories || null === this.state.phones)
          && <ActivityIndicator size="large" color="#55d1f3" style={{ flex: 1 }} /> }
        
        {this.state.phones && !!this.state.phones.length && <FlatList style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}
          data={ (this.state.phones || [])
            .concat( ...(this.state.loading_more ? [{ ActivityIndicator: true, id: Number.MAX_SAFE_INTEGER }] : []) )
            .map(data => (data.key=`${data.id}`, data))
          }
          ref={r => this.LISTVIEW_REF = r}
          onScroll={({nativeEvent}) => this.onItemsListScroll(nativeEvent)}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={e => this.onRefresh(e)} />}
          renderItem={({item, index}) => <View>
            { item.ActivityIndicator ? <ActivityIndicator size="small" color="#55d1f3" style={{ height: 50 }} /> : <View style={{
                margin: 20, marginLeft: 30, marginRight: 30, marginTop: index ? 0 : 20, flexDirection: 'column', backgroundColor: '#fff',
                ...(index == this.state.phones.length-1 && { marginBottom: 40 }),
                borderColor: '#e5e5e5', borderWidth: 2, borderRadius: 15, padding: 15, overflow: 'hidden',
              }} onLayout={({nativeEvent: {layout: { height, width }}}) => this.setState({ [`height_${item.id}`]: height, [`width_${item.id}`]: width })}>
              
              <Text style={{ color: '#1578a9', fontSize: 16, fontFamily: 'AvantGardeBookBT', fontWeight: '600' }}>{item.group}</Text>

              <View style={{
                flex: 1,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                marginTop: 10,
              }}>
                <Image source={require('./../../images/apps_final-07-03.png')} style={{
                  height: 20, width: 20, marginRight: 10,
                }} />
                <Text style={{ color: '#677e83', fontSize: 16, fontFamily: 'AvantGardeBookBT', fontWeight: '600' }}>{item.number}</Text>
              </View>

              <Button accent text={''} upperCase={false}
                style={{container: {
                  position: 'absolute', bottom: 0, left: 0, backgroundColor: 'transparent',
                  height: this.state[`height_${item.id}`] || '100%', width: this.state[`width_${item.id}`] || '100%',
                }}} onPress={e => Linking.openURL(`tel:${item.number}`)} />
              
            </View>}
          </View>}>
        </FlatList>}

        {this.state.phones && this.state.phones.length === 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{i18n('Nothing found.')}</Text>
        </View>}
      </View>
    )
  }
}
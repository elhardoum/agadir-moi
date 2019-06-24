import React, { Component } from 'react'
import { View, Text, ActivityIndicator, Image, StatusBar, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { Toolbar } from 'react-native-material-ui'
import LinearGradient from 'react-native-linear-gradient'
import { CachedImage, ImageCacheProvider } from 'react-native-cached-image'
import GestureRecognizer from 'react-native-swipe-gestures'

const ScreenDimensions = Dimensions.get('window')

export default class News extends Component
{
  constructor(props)
  {
    super(props)
    this.state = {}
    this.componentId = 'news'
  }

  componentDidMount()
  {
    const { id } = (this.props.match||{}).params || {}
        , { item: post } = this.props.location.state || {}

    this.setState({ post, id: +id })
  }

  selectValue = ({ news, events }) => ({news, events}[this.componentId])

  render()
  {
    const { post, id } = this.state

    const sliderOverlayColors = [
      'rgba(0, 0, 0, 0.12156862745098039)',
      'rgba(0, 0, 0, 0.32941176470588235)',
      'rgba(0, 0, 0, 0.6392156862745098)',
    ]

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ padding: 10, paddingTop: 5, paddingBottom: 5 }}>
            <Toolbar
              leftElement="menu"
              centerElement={ this.selectValue({ news: 'Actualité', events: 'Événement' }) }
              searchable={{
                autoFocus: true,
                placeholder: 'Recherche',
                onChangeText: text => this.setState({ searchable_text: text }),                
                onSubmitEditing: _ => this.setState({ search: this.state.searchable_text }, _ => this.applySearch()),
                onSearchClosed: _ => this.setState({ search: null }, _ => this.applySearch()),
              }}
              onLeftElementPress={e => (console.log('open'), this.props.state.set({ isMenuOpen: true }))}
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
        </LinearGradient>

        { undefined === post && <ActivityIndicator size="large" color="#55d1f3" style={{ flex: 1 }} /> }

        { undefined !== post && ( ! post || ! post.id ) && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{this.selectValue({ news: i18n('This story does not exist.'), events: i18n('This event does not exist.')})}</Text>
        </View>}

        { undefined !== post && post && post.id && <ScrollView style={{flex: 1}}>

          <GestureRecognizer style={ styles.container }
            onSwipeRight={e => console.log('right')}
            onSwipeLeft={e => console.log('left')}>

            { post.images && post.images.length ? <ImageCacheProvider
              urlsToPreload={post.images||[]}>
              <CachedImage
                source={post.images[0] && {uri: post.images[0]}} style={styles.image} />
            </ImageCacheProvider> : <CachedImage
              source={require('./../../images/newspaper-default.jpg')} style={styles.image} /> }

            <LinearGradient  colors={sliderOverlayColors} style={styles.dotWrapper}>

              <View style={ styles.dotWrapperInner }>
                { post.images.map((img, index) => <TouchableOpacity key={index} style={styles.dotButton} onPress={e => this.setState(
                  { index }, _ => index !== 0 && false/*animate*/
                )} activeOpacity={0.9}>
                  <View style={[styles.dot, 0 == index && styles.dotActive ]}></View>
                </TouchableOpacity>) }
              </View>

            </LinearGradient>

          </GestureRecognizer>

        </ScrollView> }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: ScreenDimensions.height * .33,
  },
  dotWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
    width: '100%',
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: 'transparent',
  },
  dotWrapperInner: {
    position: 'absolute',
    bottom: 0,
    height: 5,
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dotButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 4,
    width: 22,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  dotActive: {
    backgroundColor: '#f5f5f5',
  },
})

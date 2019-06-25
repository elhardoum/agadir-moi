import React, { Component } from 'react'
import { View, Text, ActivityIndicator, Image, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { CachedImage, ImageCacheProvider } from 'react-native-cached-image'
import GestureRecognizer from 'react-native-swipe-gestures'
import { View as AnimatableView } from 'react-native-animatable'
import moment from 'moment'
import 'moment/locale/fr'

moment.locale('fr')

const ScreenDimensions = Dimensions.get('window')
    , SLIDER_HEIGHT = ScreenDimensions.height * .33

export default class News extends Component
{
  constructor(props)
  {
    super(props)
    this.state = {}
    this.componentId = 'news'
    this.REF_ANIMATABLE_VIEW = null
  }

  selectValue = ({ news, events }) => ({news, events}[this.componentId])

  animateActiveImage()
  {
    this.REF_ANIMATABLE_VIEW && this.REF_ANIMATABLE_VIEW.fadeOut(500).then(this.REF_ANIMATABLE_VIEW.fadeIn(500))
  }

  render()
  {
    const { image_index=0 } = this.state, { post } = this.props

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        { undefined === post && <ActivityIndicator size="large" color="#55d1f3" style={{ flex: 1 }} /> }

        { undefined !== post && ( ! post || ! post.id ) && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{this.selectValue({ news: i18n('This story does not exist.'), events: i18n('This event does not exist.')})}</Text>
        </View>}

        { undefined !== post && post && post.id && <ScrollView style={{flex: 1}}>

          <GestureRecognizer style={ styles.container }
            onSwipeRight={e => this.setState({ image_index: Math.max(0, image_index-1) }, _ => image_index > 0 && this.animateActiveImage())}
            onSwipeLeft={e => this.setState({ image_index: Math.min(post.images.length-1, image_index+1) }, _ =>
              image_index < post.images.length-1 && this.animateActiveImage())}>

            <AnimatableView ref={r => this.REF_ANIMATABLE_VIEW = r} style={{ flex: 1, alignItems: 'flex-start', backgroundColor: '#555' }}>
              { post.images && post.images.length ? <ImageCacheProvider
                urlsToPreload={post.images||[]}>
                <CachedImage source={post.images[image_index] && {uri: post.images[image_index]}} style={styles.image} />
              </ImageCacheProvider> : <CachedImage
                source={require('./../../images/newspaper-default.jpg')} style={styles.image} /> }
            </AnimatableView>

            <LinearGradient colors={this.props.overlayGradients} style={styles.dotWrapper}>
              <View style={[styles.dotWrapperInner, this.selectValue({
                news: { bottom: 20 }, events: { bottom: 30 }
              })]}>
                { post.images.map((img, index) => <TouchableOpacity key={index} style={styles.dotButton} onPress={e => this.setState(
                  { image_index: index }, _ => index !== image_index && this.animateActiveImage()
                )} activeOpacity={0.9}>
                  <View style={[styles.dot, image_index == index && styles.dotActive, index && {marginLeft: 8} ]}></View>
                </TouchableOpacity>) }
              </View>
            </LinearGradient>
          </GestureRecognizer>

          {this.content()}

        </ScrollView> }
      </View>
    )
  }

  content()
  {
    const { post } = this.props

    return <View style={styles.contentWrapper}>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postDate}>{moment(post.timeCreated).format('DD MMMM YYYY HH:mm')}</Text>
      <Text style={styles.postContent}>{post.content}</Text>
    </View>
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'left',
    // alignItems: 'left',
  },
  image: {
    width: '100%',
    height: SLIDER_HEIGHT,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotButton: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  dot: {
    height: 4,
    width: 22,
    backgroundColor: '#fff',
  },
  dotActive: {
    backgroundColor: '#55d1f3',
  },
  contentWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#eae9e5',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: -15,
    marginRight: 2,
    marginLeft: 2,
    padding: 30,
    marginBottom: 2,
  },
  postTitle: {
    color: '#197cce',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'AvantGardeBookBT',
  },
  postDate: {
    color: '#688085',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    fontFamily: 'AvantGardeBookBT',
  },
  postContent: {
    color: '#6e8085',
    fontSize: 15,
    fontFamily: 'AvantGardeBookBT',
  },
})

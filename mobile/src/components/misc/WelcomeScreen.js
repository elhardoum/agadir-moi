import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { View as AnimatableView } from 'react-native-animatable'
import { Button } from 'react-native-material-ui'

const IMAGES = [
  require('./../../images/splash-screen-01.png'),
  require('./../../images/splash-screen-02.png'),
  require('./../../images/splash-screen-03.png'),
]

export default class LoadingScreen extends Component
{
  state = {}
  REFs = {}

  componentDidMount()
  {
    this.animate()
  }

  animate()
  {
    this.REFs.view && this.REFs.view.fadeOut(500).then(this.REFs.view.fadeIn(500))
  }

  render()
  {
    const { index=0, dotsLayout } = this.state, finishSlider = _ =>
    {
      this.props.state.set({ pastWelcomeScreen: true })
      // save preference
      this.props.db.metadata.setLocal({ welcomed: true })
    }

    return (
      <GestureRecognizer style={ styles.container }
        onSwipeRight={e => this.setState({ index: Math.max(0, index-1) }, _ => index > 0 && this.animate())}
        onSwipeLeft={e => this.setState({ index: Math.min(2, index+1) }, _ => {
          index < 2 && this.animate()
          index >= 2 && finishSlider()
        })}>
        <AnimatableView ref={ref => this.REFs.view = ref} style={ styles.container }>
          <Image style={ styles.headerImage } source={IMAGES[index]} />

          <Text style={ [styles.title, styles.paddingSides] }>
            {['Lorem Ipsum', 'Dolor Sit Amet', 'Consectetur Adipisicing Truck'][index]}
          </Text>

          <Text style={ [styles.description, styles.paddingSides] }>
            {[
              'Lorem ipsum dolor sit truck amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
              'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            ][index]}
          </Text>
        </AnimatableView>

        <View style={styles.dotWrapper} onLayout={e => this.setState({ dotsLayout: e.nativeEvent.layout })}>
          <TouchableOpacity style={styles.dotButton} onPress={e => this.setState(
            { index: 0 }, _ => index !== 0 && this.animate()
          )} activeOpacity={0.9}>
            <View style={[styles.dot, 0 == index && styles.dotActive ]}></View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dotButton} onPress={e => this.setState(
            { index: 1 }, _ => index !== 1 && this.animate()
          )} activeOpacity={0.9}>
            <View style={[styles.dot, 1 == index && styles.dotActive ]}></View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dotButton} onPress={e => this.setState(
            { index: 2 }, _ => index !== 2 && this.animate()
          )} activeOpacity={0.9}>
            <View style={[styles.dot, 2 == index && styles.dotActive ]}></View>
          </TouchableOpacity>
        </View>

        {!! dotsLayout && <View style={[styles.skipButtonContainer, {top: dotsLayout.y -10, padding: 10}]}>
          <Button accent style={{text: styles.skipButton}} text={ index === 2 ? i18n('Finish') : i18n('Skip') }
            onPress={finishSlider} />
        </View>}
      </GestureRecognizer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerImage: {
    marginBottom: 0
  },
  title: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 20,
    marginTop: 10,
    color: '#555',
    marginBottom: 10,
  },
  description: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    marginTop: 10,
    color: '#666',
  },
  paddingSides: {
    paddingLeft: 25,
    paddingRight: 25,
  },
  dotWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
    height: 20,
    width: 80,
  },
  dotButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: '#9f9eaf',
    borderRadius: 50
  },
  dotActive: {
    backgroundColor: '#464452',
  },
  skipButtonContainer: {
    position: 'absolute',
    right: 0,
    marginRight: 25,
    marginTop: -9,
  },
  skipButton: {
    color: '#555',
    fontWeight: 'normal',
  }
})

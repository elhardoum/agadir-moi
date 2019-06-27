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
      <View style={ styles.container }>
        <AnimatableView ref={ref => this.REFs.view = ref} style={ styles.container }>
          <Image style={ styles.headerImage } source={IMAGES[index]} />

          <Text style={ [styles.title, styles.paddingSides] }>
            {['Encombrant', 'Déchet', 'Signaler sur l’espace publique'][index]}
          </Text>

          {(style =>
          {
            return [
              <React.Fragment>
                <Text style={style}>Pour faire disparaitre vous anciens</Text>
                <Text style={style.concat({marginTop: 0})}>meuble et encombrant.</Text>
              </React.Fragment>,
              <Text style={style}>Pour rendre votre espace propre.</Text>,
              <Text style={style}>Pour avoir une ville magnifique.</Text>,
            ][index]
          })([styles.description, styles.paddingSides])}

          <GestureRecognizer onSwipeRight={e => this.setState({ index: Math.max(0, index-1) }, _ => index > 0 && this.animate())}
            onSwipeLeft={e => this.setState({ index: Math.min(2, index+1) }, _ => {
              index < 2 && this.animate()
              index >= 2 && finishSlider()
            })} style={{ backgroundColor: 'transparent', position: 'absolute', bottom: 10, left: 0, height: '100%', width: '100%' }} />
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
  },
  headerImage: {
    marginBottom: 0,
    height: 200, width: 200,
  },
  title: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 20,
    marginTop: -20,
    color: '#555',
    // marginBottom: 10,
    fontFamily: 'AvantGardeBookBT',
  },
  description: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    marginTop: 10,
    color: '#666',
    fontFamily: 'AvantGardeBookBT',
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

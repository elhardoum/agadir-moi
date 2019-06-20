import React, { Component } from 'react'
import { Text, StyleSheet, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export default class LoadingScreen extends Component
{
  render()
  {
    return (
      <LinearGradient style={ styles.container } start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']}>
        <Image
          style={ styles.logo }
          source={ require('./../../images/logo.png') } />
        <Text style={ styles.logoLabel }>Agadir & Moi</Text>
      </LinearGradient>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 150,
    width: 150
  },
  logoLabel: {
    alignSelf: 'center',
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 20,
    marginTop: 10
  }
})

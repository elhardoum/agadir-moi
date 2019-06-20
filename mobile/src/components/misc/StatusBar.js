import React, { Component } from 'react'
import { StatusBar as Native } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export default class StatusBar extends Component
{
  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state

    return (
      <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
        height: initialLoaded && pastWelcomeScreen ? Native.currentHeight : 0
      }}>
        <Native translucent={true} backgroundColor={'transparent'} { ... (!initialLoaded || !pastWelcomeScreen) && { hidden: true } } />
      </LinearGradient>
    )
  }
}
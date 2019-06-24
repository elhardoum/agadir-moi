import React, { Component } from 'react'
import { StatusBar as Native, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

export default class StatusBar extends Component
{
  componentDidMount()
  {
    this.props.state.set({
      statusBarHeight: Native.currentHeight
    })
  }  

  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state
    const { path: router_path } = this.props.state.router.match || {}
    const wrapper_height = initialLoaded && pastWelcomeScreen ? Native.currentHeight : 0
    const native_props = {
      translucent: true, backgroundColor: 'transparent', ... (!initialLoaded || !pastWelcomeScreen ) && { hidden: true }
    }

    switch ( true ) {
      case ['/news', '/events'].indexOf(router_path) >= 0:
        return null
    }

    return (
      <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{height: wrapper_height }}>
        <Native {...native_props} />
      </LinearGradient>
    )
  }
}
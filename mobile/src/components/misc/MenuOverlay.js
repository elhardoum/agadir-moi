import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

export default class MenuOverlay extends Component
{
  state = {}

  componentDidMount()
  {
    this.props.captureStateSetter(this.setState.bind(this))
  }

  render()
  {
    if ( this.state.visible ) {
      return ( <View style={[styles.overlay, {opacity: this.state.opacity}]} /> )
    } else {
      return null
    }
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'black',
    height: '100%',
    width: '100%'
  }
})
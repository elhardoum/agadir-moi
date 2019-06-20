import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'

import Menu from './Menu'
import MenuOverlay from './MenuOverlay'
import StatusBar from './StatusBar'

const SideMenu = require('react-native-side-menu').default
const ScreenDimensions = Dimensions.get('window')

export default class AppContent extends Component
{
  state = {}

  onSideMenuMove(left)
  {
    const screenWidth = ScreenDimensions.width

    if ( parseFloat( (left / screenWidth).toFixed(2) ) <= 0 ) {
      this.state.overlayStateSetter({
        visible: false,
      })
    } else {
      this.state.overlayStateSetter({
        visible: true,
        opacity: parseFloat( (left / screenWidth).toFixed(3) ),
      })
    }
  }

  render()
  {
    const { isMenuOpen=false } = this.props.state

    return (
      <View style={{ flex: 1, backgroundColor: '#28323e' }}>
        <SideMenu
          onSliding={(left) => this.state.overlayStateSetter && this.onSideMenuMove(left)}
          menu={<Menu dimensions={ScreenDimensions}/>}
          isOpen={ isMenuOpen }
          bounceBackOnOverdraw={ false }
          openMenuOffset={ScreenDimensions.width * 0.8}
        >
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Text>Home screen</Text>
          </View>

          <MenuOverlay { ...this.props } captureStateSetter={overlayStateSetter => this.setState({ overlayStateSetter })} />
        </SideMenu>
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
  },
  headerImage: {
    marginBottom: 30
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
})

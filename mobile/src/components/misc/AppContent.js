import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'

import Menu from './Menu'
import MenuOverlay from './MenuOverlay'
import StatusBar from './StatusBar'

import { NativeRouter, Route, BackButton } from 'react-router-native'

import Home from './../home/'
import News from './../news/'
import Events from './../events/'

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
        <NativeRouter>
          <BackButton>
            <SideMenu
              onSliding={(left) => this.state.overlayStateSetter && this.onSideMenuMove(left)}
              menu={<Menu dimensions={ScreenDimensions} {...this.props}/>}
              isOpen={ isMenuOpen }
              bounceBackOnOverdraw={ false }
              openMenuOffset={ScreenDimensions.width * 0.85}>

              <Route path='/' exact render={routerProps => <Home {...this.props} {...routerProps} />} />
              <Route path='/news' render={routerProps => <News {...this.props} {...routerProps} />} />
              <Route path='/events' render={routerProps => <Events {...this.props} {...routerProps} />} />

              <MenuOverlay { ...this.props } captureStateSetter={overlayStateSetter => this.setState({ overlayStateSetter })} />
            </SideMenu>
          </BackButton>
        </NativeRouter>
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
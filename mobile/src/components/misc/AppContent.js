import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'

import Menu from './Menu'
import MenuOverlay from './MenuOverlay'
import StatusBar from './StatusBar'

import { NativeRouter, Route, BackButton } from 'react-router-native'

import Error404 from './../misc/Error404'
import News from './../news/'
import Events from './../events/'
import Pratique from './../pratique/'
import Phones from './../phones/'
import Weather from './../weather/'

const SideMenu = require('react-native-side-menu').default
const ScreenDimensions = Dimensions.get('window')
let ROUTER_REF_HIST_PUSH

class RenderProxy extends Component
{
  componentDidMount()
  {
    ROUTER_REF_HIST_PUSH = (...args) => (this.props.state.set({isMenuOpen: false}), this.props.history.push(...args))

    this.props.state.set({
      router: {
        match: this.props.match
      },
      isMenuOpen: false
    })
  }

  render()
  {
    return <this.props.component {...this.props} />
  }
}

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
      false === this.props.state.menuClosed && this.props.state.set({ menuClosed: true })
    } else {
      this.state.overlayStateSetter({
        visible: true,
        opacity: parseFloat( (left / screenWidth).toFixed(3) ),
      })
      this.props.state.menuClosed && this.props.state.set({ menuClosed: false })
    }
  }

  render()
  {
    const { isMenuOpen=false } = this.props.state

    const custProps = {
      pushState: slug => ROUTER_REF_HIST_PUSH && ROUTER_REF_HIST_PUSH(slug)
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#28323e' }}>
        <NativeRouter>
          <BackButton>
            <SideMenu
              onSliding={(left) => this.state.overlayStateSetter && this.onSideMenuMove(left)}
              menu={<Menu dimensions={ScreenDimensions} {...this.props} pushState={custProps.pushState.bind(this)}/>}
              isOpen={ isMenuOpen }
              bounceBackOnOverdraw={ false }
              openMenuOffset={ScreenDimensions.width * 0.85}>

              <Route path='/' exact render={routerProps => <RenderProxy component={News} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/news' exact render={routerProps => <RenderProxy component={News} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/events' exact render={routerProps => <RenderProxy component={Events} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/pratique' exact render={routerProps => <RenderProxy component={Pratique} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/phones' exact render={routerProps => <RenderProxy component={Phones} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/weather' exact render={routerProps => <RenderProxy component={Weather} {...this.props} {...routerProps} {...custProps} />} />

              <Route path='/map' exact render={routerProps => <RenderProxy component={Error404} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/complaints' exact render={routerProps => <RenderProxy component={Error404} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/settings' exact render={routerProps => <RenderProxy component={Error404} {...this.props} {...routerProps} {...custProps} />} />
              <Route path='/404' exact render={routerProps => <RenderProxy component={Error404} {...this.props} {...routerProps} {...custProps} />} />

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

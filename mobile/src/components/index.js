import React, { Component } from 'react'
import { View, Text } from 'react-native'

import StatusBar from './misc/StatusBar'
import LoadingScreen from './misc/LoadingScreen'
import WelcomeScreen from './misc/WelcomeScreen'
import AppContent from './misc/AppContent'

import DataLoader from './../util/dataLoader'
dataLoader = new DataLoader( 'android' )

export default class App extends Component
{
  componentDidMount()
  {
    setTimeout(_ => this.props.state.set({ initialLoaded: true }), 10||2000) // @todo

    // fetch data updates in the background
    dataLoader.bootBackground()
  }

  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state

    this.props.dataLoader = dataLoader

    return (
      <View style={{ flex: 1 }}>
        <StatusBar { ...this.props } />

        { !initialLoaded ? <LoadingScreen { ...this.props } /> :
          ( !pastWelcomeScreen ? <WelcomeScreen { ...this.props } /> : <AppContent { ...this.props } /> ) }
      </View>
    )
  }
}

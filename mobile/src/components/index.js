import React, { Component } from 'react'
import { View, Text } from 'react-native'

import StatusBar from './misc/StatusBar'
import LoadingScreen from './misc/LoadingScreen'
import WelcomeScreen from './misc/WelcomeScreen'
import AppContent from './misc/AppContent'

import DataLoader from './../util/dataLoader'
import DB from './../util/db'

const db = new DB(environ.realm_db_path || 'dbv13.realm')
    , dataLoader = new DataLoader(db)

// debugging
const SKIP_WELCOME = environ.dev, SKIP_LOADING = environ.dev // @todo

export default class App extends Component
{
  async componentDidMount()
  {
    setTimeout(_ => this.props.state.set({ initialLoaded: true }), SKIP_LOADING && 10 || 2000)

    // fetch data updates in the background
    dataLoader.bootBackground({
      news: new AbortController,
      events: new AbortController,
      phones: new AbortController,
    })

    SKIP_WELCOME && this.props.state.set({ pastWelcomeScreen: true })
  }

  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state

    const custProps = { dataLoader, db }

    return (
      <View style={{ flex: 1 }}>
        <StatusBar { ...this.props } { ... custProps } />

        { !initialLoaded ? <LoadingScreen { ...this.props } { ...custProps } /> :
          ( !pastWelcomeScreen ? <WelcomeScreen { ...this.props } { ...custProps } /> : <AppContent { ...this.props } { ...custProps } /> ) }
      </View>
    )
  }
}

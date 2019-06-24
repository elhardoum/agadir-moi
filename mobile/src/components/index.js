import React, { Component } from 'react'
import { View, Text } from 'react-native'

import StatusBar from './misc/StatusBar'
import LoadingScreen from './misc/LoadingScreen'
import WelcomeScreen from './misc/WelcomeScreen'
import AppContent from './misc/AppContent'
import DataLoader from './misc/DataLoader'
import DB from './../util/db'

global.environ = global.environ || require('./../../env.json')
const db = new DB(environ.realm_db_path)

// debugging
const SKIP_WELCOME = environ.dev, SKIP_LOADING = environ.dev // @todo

export default class App extends Component
{
  componentDidMount()
  {
    setTimeout(_ => this.props.state.set({ initialLoaded: true }), SKIP_LOADING && 10 || 2000)

    SKIP_WELCOME && this.props.state.set({ pastWelcomeScreen: true })
  }

  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state

    const custProps = { db }

    return (
      <View style={{ flex: 1 }}>
        <StatusBar { ...this.props } { ...custProps } />

        { !initialLoaded ? <LoadingScreen { ...this.props } { ...custProps } /> :
          ( !pastWelcomeScreen ? <WelcomeScreen { ...this.props } { ...custProps } /> : <AppContent { ...this.props } { ...custProps } /> ) }

        <DataLoader {...this.props} {...custProps} />
      </View>
    )
  }
}

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
    const start = +new Date

    db.metadata.getLocal().then(all =>
    {
      const diff = +new Date - start
      setTimeout(_ => this.props.state.set({
        initialLoaded: true,
        pastWelcomeScreen: SKIP_WELCOME || !!(all||{}).welcomed,
      }), SKIP_LOADING && 10 || Math.max(10, 2000 - diff))
    }).catch(e =>
    {
      const diff = +new Date - start
      setTimeout(_ => this.props.state.set({
        initialLoaded: SKIP_LOADING,
        pastWelcomeScreen: SKIP_WELCOME,
      }), SKIP_LOADING && 10 || Math.max(10, 2000 - diff))
    })

    this.getCurrentWeather()
  }

  async getCurrentWeather()
  {
    let weather

    while ( true ) {
      const data = (await db.metadata.getLocal().catch(err => null)) || {}

      if ( data && data.weather ) {
        weather = JSON.parse(data.weather)
        break
      }

      await new Promise(res => setTimeout(res, 1000))
    }

    this.props.state.set({ weather: weather }, this.updateWeatherState)
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

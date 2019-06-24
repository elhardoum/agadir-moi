import React, { Component } from 'react'
import { AppRegistry } from 'react-native'
import { name as appName } from './app.json'
import AppLoader from './src/components/'

const StateContext = React.createContext()

class StateProvider extends Component
{
  state = { router: {} }

  render()
  {
    return <StateContext.Provider value={{
      ...this.state,
      set: (state, then) => this.setState(state, _ => then && then(_)),
    }}>{this.props.children}</StateContext.Provider>
  }
}

class App extends Component
{
  render()
  {
    return (
      <StateProvider>
        <StateContext.Consumer>
          {state => <AppLoader { ... { state } } />}
        </StateContext.Consumer>
      </StateProvider>
    )
  }
}

AppRegistry.registerComponent(appName, () => App)

// load globals
import i18n from './src/util/i18n'
global.i18n = i18n

global.environ = require('./env.json')

// global helpers
global.objPluck = (obj, props=[]) =>
{
  const ret = {}
  for ( let prop in obj ) {
    (! props.length || props.indexOf(prop) >= 0) && (ret[prop]=obj[prop])
  }
  return ret
}
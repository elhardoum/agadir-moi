import React, { Component } from 'react'
import { View } from 'react-native'
import { AppRegistry } from 'react-native'
import { name as appName } from './app.json'

import AppLoader from './src/components/'

const StateContext = React.createContext()

class StateProvider extends Component
{
  state = {}

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

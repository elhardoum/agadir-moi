import React, { Component } from 'react'
import { View, Text } from 'react-native'

import StatusBar from './misc/StatusBar'
import LoadingScreen from './misc/LoadingScreen'
import WelcomeScreen from './misc/WelcomeScreen'

export default class App extends Component
{
  componentDidMount()
  {
    setTimeout(_ => this.props.state.set({ initialLoaded: true }), 2000)
  }

  render()
  {
    const { initialLoaded=false, pastWelcomeScreen=false } = this.props.state 

    return (
      <View style={{ flex: 1 }}>
        <StatusBar { ... this.props } />

        { !initialLoaded ? <LoadingScreen { ... this.props } /> :
          (
            !pastWelcomeScreen ? <WelcomeScreen { ... this.props } /> : <React.Fragment>

              <View><Text>Text</Text></View>
            
            </React.Fragment>
          )
        }
      </View>
    )
  }
}

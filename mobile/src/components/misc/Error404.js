import React, { Component } from 'react'
import { View, Text, StatusBar } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Toolbar } from 'react-native-material-ui'

export default class Error404 extends Component
{
  render()
  {
    const { statusBarHeight=24 } = this.props.state

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
          paddingTop: statusBarHeight
        }}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement={'Agadir & Moi'}
              onLeftElementPress={e => this.props.state.set({ isMenuOpen: true })}
              style={{
                container: { backgroundColor: 'transparent' }
              }}
            />
          </View>
        </LinearGradient>

        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', paddingLeft: 20, paddingRight: 20 }}>
          <Text style={{color: '#555'}}>404 - (or WIP, rather)</Text>
          <Text style={{color: '#555'}}>{JSON.stringify(this.props.match, null, 2)}</Text>
        </View>
      </View>
    )
  }
}
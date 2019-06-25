import React, { Component } from 'react'
import { View, Text, ScrollView, Image, StatusBar } from 'react-native'
import { Toolbar, Button } from 'react-native-material-ui'
import LinearGradient from 'react-native-linear-gradient'

const ITEMS = [
  {
    title: 'Actualités',
    info: 'Lorem ipsum dolor sit amet',
    icon: require('./../../images/mockup-static/iconb-08.png'),
    route: '/news',
  },
  {
    title: 'Météo',
    info: 'Lorem ipsum dolor sit amet',
    icon: require('./../../images/mockup-static/iconb-08.png'),
    route: '/weather',
  },
  {
    title: 'Numéros Utiles',
    info: 'Lorem ipsum dolor sit amet',
    icon: require('./../../images/mockup-static/iconb-08.png'),
    route: '/phones',
  },
  {
    title: 'Encombrants',
    info: 'Lorem ipsum dolor sit amet',
    icon: require('./../../images/mockup-static/iconb-08.png'),
    route: '/404#encombrants',
  },
  {
    title: 'Déchets',
    info: 'Lorem ipsum dolor sit amet',
    icon: require('./../../images/mockup-static/iconb-08.png'),
    route: '/404#dechets',
  },
]

export default class Pratique extends Component
{
  state = {}

  render()
  {
    const { statusBarHeight=24 } = this.props.state

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
          paddingTop: statusBarHeight, paddingBottom: 30,
        }}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement={ 'Pratique' }
              onLeftElementPress={e => this.props.state.set({ isMenuOpen: true })}
              style={{
                container: { backgroundColor: 'transparent' }
              }}
            />
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1, backgroundColor: 'transparent', marginTop: -30 }} overScrollMode='never'>
          {ITEMS.map((item, index) => <View key={index} style={{
            margin: 10, marginLeft: 30, marginRight: 30, marginTop: 0, backgroundColor: '#fff',
            ...(index == ITEMS.length-1 && { marginBottom: 10 }),
            borderColor: '#e5e5e5', borderWidth: 2, borderRadius: 15, padding: 20, overflow: 'hidden',
            flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
          }} onLayout={({nativeEvent: {layout: { height, width }}}) => this.setState({ [`height_${index}`]: height, [`width_${index}`]: width })}>
            <Image source={item.icon} style={{
              height: 40, width: 40, marginRight: 20,
            }} />

            <View style={{ flex: 1 }}>            
              <Text style={{ color: '#1578a9', fontSize: 18, fontFamily: 'AvantGardeBookBT' }}>{item.title}</Text>
              <Text style={{ color: '#464452', fontSize: 17, fontFamily: 'AvantGardeBookBT' }}>{item.info}</Text>
            </View>

            <Button accent text={''} upperCase={false} style={{container: {
              position: 'absolute', bottom: 0, left: 0, backgroundColor: 'transparent',
              height: this.state[`height_${index}`] || '100%', width: this.state[`width_${index}`] || '100%',
            }}} onPress={e => this.props.pushState(item.route)} />
          </View>)}
        </ScrollView>
      </View>
    )
  }
}
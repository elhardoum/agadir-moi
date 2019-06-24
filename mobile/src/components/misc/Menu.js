import React, { Component } from 'react'
import { ScrollView, Text, View, Image, StyleSheet, TouchableHighlight } from 'react-native'
import { Link } from 'react-router-native'
import { Button } from 'react-native-material-ui'

export const MENU_ITEMS = [
  ['/', 'Acceuil', require('./../../images/mockup-static/apps_final-07-06.png')],
  ['/news', 'Actualités', require('./../../images/mockup-static/apps_final-07-04.png')],
  ['/events', 'Événements', require('./../../images/mockup-static/apps_final-07-06.png')],
  ['/pratique', 'Pratique', require('./../../images/mockup-static/apps_final-07-03.png')],
  ['/map', 'Carte Interactive', require('./../../images/mockup-static/apps_final-07-05.png')],
  ['/complaints', 'Réclamation', require('./../../images/mockup-static/apps_final-07-07.png')],
  ['/settings', 'Paramétres', require('./../../images/mockup-static/apps_final-07-06.png')],
]

export default class Menu extends Component
{
  isActive(slug, truthyObj, Default)
  {
    const match = this.props.state.router.match || {}
    let matched

    if ( match.path ) {
      matched = slug === match.path
    } else {
      matched = '/' == slug
    }

    return matched ? truthyObj : Default
  }

  render()
  {
    return (
      <View style={[styles.menuContainer, { height: this.props.dimensions.height }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./../../images/logo.png')}
            style={styles.logoImg}
          />
          <Text style={styles.logoText}>Agadir & Moi</Text>
        </View>

        <ScrollView style={styles.buttonsContainer}>
          {MENU_ITEMS.map((opt,i) => <Button accent upperCase={false} text={''} style={{
            container: {...styles.button, ...this.isActive(opt[0], styles.buttonActive, {backgroundColor: 'transparent'})},
          }} icon={
            <View style={{ marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap', marginLeft: 4 }}>
              <Image style={styles.buttonImg} source={opt[2]} />
              <Text style={[styles.buttonText, this.isActive(opt[0], {color: '#55d1f3'})]}>{opt[1]}</Text>
            </View>
          } onPress={e => this.props.pushState(opt[0])} key={i} />)}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: '#fff'
  },
  logoContainer: {
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#2297b7',
    paddingLeft: 15,
  },
  logoImg: {
    height: 60,
    width: 60,
    borderRadius: 50,
    backgroundColor: '#fff'
  },
  logoText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold'
  },
  buttonsContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  button: {
    paddingTop: 23,
    paddingBottom: 23,
    padding: 28,
    flexWrap: 'wrap', 
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#ddd',
  },
  buttonActive: {
    backgroundColor: '#f5f5f5',
  },
  buttonImg: {
    height: 20,
    width: 20,
    flexDirection:'column',
    marginRight: 40,
  },
  buttonText: {
    flexDirection:'column',
    color: '#555',
    fontWeight: 'bold',
    fontSize: 15,
  },
})

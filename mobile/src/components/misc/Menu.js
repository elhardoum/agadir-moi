import React, { Component } from 'react'
import { ScrollView, Text, View, Image, StyleSheet, TouchableHighlight } from 'react-native'

export default class Menu extends Component {
   render()
   {
     return (
      <ScrollView scrollsToTop={false}>
        <View style={[styles.menuContainer, { height: this.props.dimensions.height }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./../../images/logo.png')}
              style={styles.logoImg}
            />
            <Text style={styles.logoText}>Agadir & Moi</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={[styles.button, styles.buttonActive]}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={[styles.buttonText, {color: '#fff'}]}>Acceuil</Text>
              </React.Fragment>
            </TouchableHighlight>

            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={styles.button}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={styles.buttonText}>Actualités</Text>
              </React.Fragment>
            </TouchableHighlight>

            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={styles.button}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={styles.buttonText}>Pratique</Text>
              </React.Fragment>
            </TouchableHighlight>

            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={styles.button}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={styles.buttonText}>Carte Interactive</Text>
              </React.Fragment>
            </TouchableHighlight>

            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={styles.button}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={styles.buttonText}>Réclamation</Text>
              </React.Fragment>
            </TouchableHighlight>

            <TouchableHighlight underlayColor='#ececec' onPress={e => void 0} style={styles.button}>
              <React.Fragment>
                <Image
                  style={styles.buttonImg}
                  source={require('./../../images/logo.png')}
                />
                <Text style={styles.buttonText}>Paramétres</Text>
              </React.Fragment>
            </TouchableHighlight>
          </View>
        </View>
      </ScrollView>
     );
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
    // padding: 10,
    // backgroundColor: '#222c37'
  },
  button: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 15,
    paddingRight: 15,
    flexWrap: 'wrap', 
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  buttonActive: {
    backgroundColor: '#55d1f3'
  },
  buttonImg: {
    height: 20,
    width: 20,
    flexDirection:'column',
    marginRight: 15
  },
  buttonText: {
    flexDirection:'column',
    color: '#555',
    fontWeight: 'bold',
    fontSize: 15,
  },
})

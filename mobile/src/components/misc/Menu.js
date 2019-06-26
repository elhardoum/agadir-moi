import React, { Component } from 'react'
import { ScrollView, Text, View, Image, StyleSheet, TouchableHighlight } from 'react-native'
import { Link } from 'react-router-native'
import { Button } from 'react-native-material-ui'
import Icon from './Icon'
import LinearGradient from 'react-native-linear-gradient'
import moment from 'moment'

export const MENU_ITEMS = [
  ['/news', 'Actualités', null, 'Newspaper'],
  ['/events', 'Événements', null, 'Newspaper'],
  ['/pratique', 'Pratique', null, 'Phone'],
  ['/map', 'Carte Interactive', null, 'Map'],
  ['/complaints', 'Réclamation', null, 'Alert'],
  ['/settings', 'Paramétres', null, 'MenuSettings'],
]

export default class Menu extends Component
{
  state = {}

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

  getWeatherData()
  {
    return { temps: this.tempsMinMax(), ...this.todaysMetrics() }
  }

  tempsMinMax()
  {
    const { data } = this.props.state.weather || {}
    let days = {}, temps = {}

    data.map(x =>
    {
      let day = x.dt_txt.split(' ').shift()
      days[day] = (days[day]||[]).concat(x)
    })

    Object.keys(days).map(k =>
    {
      temps[k] = []
      for ( let entry in days[k] ) {
        temps[k] = temps[k].concat([days[k][entry].main.temp, days[k][entry].main.temp_min, days[k][entry].main.temp_max])
      }
      return k
    })

    let list = temps[moment(+new Date).format('YYYY-MM-DD')] || []
      , min = list.length ? Math.round(Math.min(...list) -273.15) : null
      , max = list.length ? Math.round(Math.max(...list) -273.15) : null

    if ( null === min && null === max ) {
      return null
    } else if ( min === max ) {
      return `${min}º`
    } else {
      return `${max}º/${min}º`
    }
  }

  todaysMetrics()
  {
    let { data: weather=[], current={} } = this.props.state.weather || {}
      , date = moment(+new Date).format('YYYY-MM-DD')
      , data = weather.filter(x => x.dt_txt.startsWith(date))[0] || {}

    if ( (current||{}).dt ) {
      let date_current = moment(current.dt * 1000).format('YYYY-MM-DD')

      if ( date_current == date ) {
        data = current
      }
    }

    let main = data.main || {}
      , numeric = v => /^\d+(\.\d+)?$/.test(parseFloat(v))
      , round = (value, postdecimal) => parseFloat(parseFloat(value).toFixed(postdecimal))
      , temp = numeric(main.temp) ? main.temp : null
      , weatherSet = data.weather || []

    temp = null !== temp ? round(temp -273.15, 1) : null

    return { temp, icon: (weatherSet[0]||{}).icon }
  }

  render()
  {
    const { statusBarHeight=24 } = this.props.state
        , { temp, temps, icon: weatherIcon } = this.getWeatherData()
        , { weatherLayout=[] } = this.state

    return (
      <View style={[styles.menuContainer, { height: this.props.dimensions.height }]}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={[styles.logoContainer, {paddingTop: statusBarHeight}]}>
          <Image source={require('./../../images/logo.png')} style={styles.logoImg} />
          <Text style={styles.logoText}>Agadir & Moi</Text>
        </LinearGradient>

        <ScrollView style={[styles.buttonsContainer, temp !== null && weatherIcon !== null && {paddingTop: 0}]}>
          { temp !== null && weatherIcon !== null && <View style={styles.weatherWrap}
            onLayout={({nativeEvent: {layout: { height, width }}}) => this.setState({ weatherLayout: [height, width] })}>
            <View>
              <Text style={styles.weatherCity}>AGADIR</Text>
              <Text style={styles.weatherCitySub}>Aujourd'hui</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={`wi${weatherIcon}`} height="50" width="50" fill="#197ccf" style={styles.weatherIcon} /> 

              <View>
                <Text style={styles.weatherMetaTemp}>{temp}º</Text>
                {temps && <Text style={styles.weatherMetaTemps}>{temps}</Text>}
              </View>
            </View>

            <Button accent text={''} upperCase={false}
              style={{container: {
                position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent',
                height: weatherLayout[0] || '100%', width: weatherLayout[1] || '100%',
              }}} onPress={e => this.props.pushState('/weather')} />
          </View> }

          {MENU_ITEMS.map((opt,i) => <Button accent upperCase={false} text={''} style={{
            container: {...styles.button, ...this.isActive(opt[0], styles.buttonActive, {backgroundColor: 'transparent'}),
              ...(i+1 == MENU_ITEMS.length && {marginBottom: 20})},
          }} icon={
            <View style={{ marginRight: 'auto', flexDirection: 'row', flexWrap: 'wrap', marginLeft: 4 }}>
              {(_ =>
              {
                switch ( true ) {
                  case !!opt[3]:
                    return <Icon name={opt[3]} height="20" width="20" fill="#363635" style={styles.buttonImg} />

                  case !!opt[2]:
                    return <Image style={styles.buttonImg} source={opt[2]} />
                }
              })()}
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
    paddingBottom: 20,
    backgroundColor: '#2297b7',
    paddingLeft: 15,
  },
  logoImg: {
    height: 60,
    width: 60,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 15,
  },
  logoText: {
    color: '#fff',
    marginTop: 10,
    fontFamily: 'AvantGardeBookBT',
    fontSize: 16,
    textTransform: 'uppercase',
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
    flexDirection: 'column',
    color: '#555',
    fontSize: 15,
    fontFamily: 'AvantGardeBookBT',
  },
  weatherWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 15, paddingLeft: 15, marginBottom: 10, paddingBottom: 10, paddingTop: 5,
    borderBottomWidth: 1, borderBottomColor: '#efefef',
  },
  weatherCity: {
    color: '#197ccf',
    fontSize: 22,
    fontFamily: 'AvantGardeBookBT',
  },
  weatherCitySub: {
    color: '#444',
    fontSize: 14,
    fontFamily: 'AvantGardeBookBT',
  },
  weatherIcon: {
    marginRight: 8,
  },
  weatherMetaTemp: {
    color: '#363636',
    fontSize: 18,
    fontFamily: 'AvantGardeBookBT',
  },
  weatherMetaTemps: {
    color: '#3e3e3e',
    fontSize: 14,
    fontFamily: 'AvantGardeBookBT',
  },
})

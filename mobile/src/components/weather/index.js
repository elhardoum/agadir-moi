import React, { Component } from 'react'
import { View, Text, StatusBar, StyleSheet, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Toolbar, Button } from 'react-native-material-ui'
import Icon from './../misc/Icon'
import moment from 'moment'
import 'moment/locale/fr'

moment.locale('fr')

const numeric = v => /^\d+(\.\d+)?$/.test(parseFloat(v))

export default class Weather extends Component
{
  state = {
    days: [...new Array(5)].map((n,i) => moment().add(i,'days').format()),
  }

  async componentDidMount()
  {
    let weather

    while ( true ) {
      const data = (await this.props.db.metadata.getLocal().catch(err => null)) || {}

      if ( data && data.weather ) {
        weather = JSON.parse(data.weather)
        break
      }

      await new Promise(res => setTimeout(res, 1000))
    }

    this.setState({ weather }, this.updateWeatherState)
  }

  updateWeatherState()
  {
    const { weather=[] } = this.state

    let days = {}, temps = {}

    weather.map(x =>
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

    this.setState({ temps })
  }

  tempsMinMax(date)
  {
    let { temps={} } = this.state
      , list = temps[date] || []
      , min = list.length ? Math.round(Math.min(...list) -273.15) : null
      , max = list.length ? Math.round(Math.max(...list) -273.15) : null

    if ( null === min && null === max ) {
      return '?/?'
    } else if ( min === max ) {
      return `${min}º`
    } else {
      return `${max}º/${min}º`
    }
  }

  todaysMetrics()
  {
    let { weather=[] } = this.state
      , date = moment(+new Date).format('YYYY-MM-DD')
      , data = weather.filter(x => x.dt_txt.startsWith(date))[0] || {}
      , main = data.main || {}
      , temp = numeric(main.temp) ? main.temp : null
      , humid = numeric(main.humidity) ? main.humidity : '?'
      , wind = (data.wind||{}).speed || null
      , weatherSet = data.weather || []

    temp = null !== temp ? this.round(temp -273.15, 1) : '?'
    wind = numeric(wind) ? this.round(wind, 1) : '?'

    return { temp, humid, wind, icon: (weatherSet[0]||{}).icon }
  }

  getDayMetrics(index)
  {
    if ( index === 0 )
      return this.todaysMetrics()

    let { weather=[] } = this.state
      , date = moment(+new Date).add(index,'days').format('YYYY-MM-DD')
      , data = weather.filter(x => x.dt_txt.startsWith(date)) || []

    let temps = [], humids = [], winds = []
    
    data.map(data =>
    {
      temps.push(data.main.temp)
      humids.push(data.main.humidity)
      winds.push(data.wind.speed)
    })

    [temps, humids, winds] = [temps, humids, winds].map(set => set.filter(numeric))

    let temp = temps.length ? temps.reduce((a,b) => a+b) /temps.length : null
      , wind = winds.length ? winds.reduce((a,b) => a+b) /winds.length : null
      , humid = humids.length ? humids.reduce((a,b) => a+b) /humids.length : null
      , morning = data[ Math.max(0, data.length/2 -1) ] || {}
      , weatherSet = morning.weather||[]

    temp = null !== temp ? this.round(temp -273.15, 1) : '?'
    wind = null !== wind ? this.round(wind, 1) : '?'
    humid = null !== humid ? this.round(humid, 1) : '?'

    return { temp, humid, wind, icon: (weatherSet[0]||{}).icon }
  }

  round(value, postdecimal=2)
  {
    return parseFloat(parseFloat(value).toFixed(postdecimal))
  }

  render()
  {
    const { statusBarHeight=24 } = this.props.state
        , { dayIndex=0 } = this.state
        , dayDisplay = dayIndex ? moment(+new Date).add(dayIndex,'days').format('dddd') : 'Aujourd\'hui'

    const { temp, humid, wind, icon: weatherIcon } = this.getDayMetrics(dayIndex)
    
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <LinearGradient start={{x: 1, y: 0}} end={{x: 0, y: 1}} colors={['#11096c', '#1a5293', '#2297b7']} style={{
          paddingTop: statusBarHeight, flex: 1,
        }}>
          <StatusBar translucent={true} backgroundColor='transparent' />

          <View style={{ paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10 }}>
            <Toolbar
              leftElement="menu"
              centerElement={'Météo'}
              onLeftElementPress={e => this.props.state.set({ isMenuOpen: true })}
              style={{
                container: { backgroundColor: 'transparent' }
              }}
            />
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
            <View style={styles.headerCityWrap}>
              <Text style={styles.headerCity}>AGADIR</Text>
              <Text style={[styles.headerCitySub, {textTransform:'capitalize'}]}>{dayDisplay}</Text>
            </View>

            <View>
              <Icon name={weatherIcon ? `wi${weatherIcon}` : 'wi01d'} height="150" width="150" fill="#fff" style={styles.headerIcon} />
            </View>

            <View style={styles.metaWrap}>
              <View style={styles.metaMetric}>
                <Icon name='Temperature' height="15" width="15" fill="#fff" style={styles.metaIcon} />
                <Text style={styles.metaNumber}>{temp||'?'}</Text>
                <Text style={styles.metaUnit}>°c</Text>
              </View>

              <View style={styles.metaDivider}></View>

              <View style={styles.metaMetric}>
                <Icon name='Humidity' height="15" width="15" fill="#fff" style={styles.metaIcon} />
                <Text style={styles.metaNumber}>{humid||'?'}</Text>
                <Text style={styles.metaUnit}>%</Text>
              </View>

              <View style={styles.metaDivider}></View>

              <View style={styles.metaMetric}>
                <Icon name='Wind' height="15" width="15" fill="#fff" style={styles.metaIcon} />
                <Text style={styles.metaNumber}>{wind||'?'}</Text>
                <Text style={[styles.metaUnit, {fontSize:14}]}>M/S</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.daysSlider} onLayout={({nativeEvent: {layout: { height }}}) => this.setState({ daysSliderHeight: height })}>
          {this.state.days.map((time,i) => <View key={i} style={[styles.daysSliderItem, dayIndex==i && {backgroundColor: '#197cce'}]}>

            <Text style={[styles.sliderDayText, dayIndex==i && {color: '#d3dae0'}, {fontSize:17}]}>{moment(time).format('ddd').replace(/.$/, '')}</Text>
            <Image source={require('./../../images/mockup-static/apps_final-07-06.png')} style={styles.daysSliderIcon} />
            <Text style={[styles.sliderDayText, dayIndex==i && {color: '#d3dae0'}]}>{this.tempsMinMax(moment(time).format('YYYY-MM-DD'))}</Text>

            <Button accent text={''} upperCase={false}
              style={{container: {
                position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent',
                height: this.state.daysSliderHeight || '100%', width: '100%',
              }}} onPress={e => this.setState({ dayIndex: i })} />

          </View>)}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  daysSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysSliderItem: {
    backgroundColor: '#f2f2f2',
    flex: 1,
    paddingTop: 15, paddingBottom: 15,
  },
  sliderDayText: {
    color: '#197cce',
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'AvantGardeBookBT',
    textAlign: 'center',
  },
  daysSliderIcon: {
    height: 28, width: 28,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 10,
  },
  headerCityWrap: {
    paddingLeft: 20,
    paddingTop: 10,
  },
  headerCity: {
    color: '#f2f2f2',
    fontSize: 35,
    fontFamily: 'AvantGardeBookBT',
  },
  headerCitySub: {
    color: '#f2f2f2',
    fontSize: 18,
    fontFamily: 'AvantGardeBookBT',
  },
  headerIcon: {
    height: 150, width: 150,
    alignSelf: 'center',
  },
  headerIconDay: {
    color: '#ffffff',
    fontSize: 25,
    fontFamily: 'AvantGardeBookBT',
    alignSelf: 'center',
    textTransform: 'capitalize',
  },
  metaWrap: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 35,
  },
  metaMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaIcon: {
    height: 15, width: 15,
    marginRight: 5,
  },
  metaNumber: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 21,
  },
  metaUnit: {
    color: '#fff',
    marginTop: -5,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 2,
  },
  metaDivider: {
    borderRightColor: '#97bfd5',
    borderRightWidth: 1,
    height: 40,
    marginRight: 20, marginLeft: 20,
  },
})

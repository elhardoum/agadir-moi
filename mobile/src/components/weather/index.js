import React, { Component } from 'react'
import { View, Text, StatusBar, StyleSheet, Image, ToastAndroid as Toast } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Toolbar, Button } from 'react-native-material-ui'
import moment from 'moment'
import 'moment/locale/fr'

moment.locale('fr')

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

    console.log( JSON.stringify(weather) )
  }

  render()
  {
    const { statusBarHeight=24 } = this.props.state

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

          <View style={{
            flex: 1, flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <View style={styles.headerCityWrap}>
              <Text style={styles.headerCity}>AGADIR</Text>
              <Text style={styles.headerCitySub}>Aujourd'hui</Text>
            </View>

            <View>
              <Image source={require('./../../images/mockup-static/iconb-01.png')} style={styles.headerIcon} />
              <Text style={styles.headerIconDay}>{moment(+new Date).format('dddd')}</Text>
            </View>

            <View style={styles.metaWrap}>

              <View style={styles.metaMetric}>
                <Image source={require('./../../images/mockup-static/iconb-05.png')} style={styles.metaIcon} />
                <Text style={styles.metaNumber}>19</Text>
                <Text style={styles.metaUnit}>°c</Text>
              </View>

              <View style={styles.metaDivider}></View>

              <View style={styles.metaMetric}>
                <Image source={require('./../../images/mockup-static/iconb-06.png')} style={styles.metaIcon} />
                <Text style={styles.metaNumber}>80</Text>
                <Text style={styles.metaUnit}>%</Text>
              </View>

              <View style={styles.metaDivider}></View>

              <View style={styles.metaMetric}>
                <Image source={require('./../../images/mockup-static/iconb-02.png')} style={styles.metaIcon} />
                <Text style={styles.metaNumber}>41</Text>
                <Text style={[styles.metaUnit, {fontSize:14}]}>M/S</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.daysSlider} onLayout={({nativeEvent: {layout: { height }}}) => this.setState({ daysSliderHeight: height })}>
          {this.state.days.map((time,i) => <View key={i} style={[styles.daysSliderItem, !i && {backgroundColor: '#197cce'}]}>

            <Text style={[styles.sliderDayText, !i && {color: '#d3dae0'}, {fontSize:17}]}>{moment(time).format('ddd').replace(/.$/, '')}</Text>
            <Image source={require('./../../images/mockup-static/apps_final-07-06.png')} style={styles.daysSliderIcon} />
            <Text style={[styles.sliderDayText, !i && {color: '#d3dae0'}]}>19º/13º</Text>

            <Button accent text={''} upperCase={false}
              style={{container: {
                position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent',
                height: this.state.daysSliderHeight || '100%', width: '100%',
              }}} onPress={e => Toast.show('no', Toast.SHORT)} />

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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 22,
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

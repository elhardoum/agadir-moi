import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, Linking, TouchableHighlight } from 'react-native'
import Story, { styles as news_styles } from './../news/item'
import moment from 'moment'
import 'moment/locale/fr'
moment.locale('fr')

export default class Event extends Story
{
  constructor(props)
  {
    super(props)
    this.componentId = 'events'
  }

  openMap(location)
  {
    return Linking.openURL(`https://maps.google.com/?${(new URLSearchParams({q: location})).toString()}`)
  }

  content()
  {
    const { post } = this.props

    let date_from = moment(post.date_from).format('DD MMM YYYY')
      , date_to = moment(post.date_to).format('DD MMM YYYY')
      , time_from = moment(post.date_from).format('HH:mm')
      , time_to = moment(post.date_to).format('HH:mm')

    if ( date_from === date_to ) { // same day
      date_from = moment(post.date_from).format('DD MMM')
      date_to = moment(post.date_to).format('YYYY')
    }

    return <View style={{ flex: 1, marginTop: -25 }}>
      <View style={styles.contentWrapper}>
        <Text style={[styles.postTitle, styles.textCenter, {marginBottom: 15}]}>{post.title}</Text>

        <View style={styles.location}>
          <Image source={require('./../../images/mockup-static/apps_final-07-11.png')} style={styles.locationIcon} />
          <TouchableHighlight>
            <Text style={styles.locationText} onPress={e => this.openMap(post.location)}>{post.location}</Text>
          </TouchableHighlight>
        </View>

        <View style={styles.divider} />

        <View style={styles.dateWrapper}>
          <View style={styles.dateSection}>
            <Image source={require('./../../images/mockup-static/apps_final-07-12.png')} style={styles.dateIcon} />
            <View styles={styles.dateDisplay}>
              <Text style={styles.dateDisplayItem}>{date_from}</Text>
              <Text style={styles.dateDisplayItem}>{date_to}</Text>
            </View>
          </View>

          <View style={styles.dateSection}>
            <Image source={require('./../../images/mockup-static/apps_final-07-13.png')} style={styles.dateIcon} />
            <View styles={styles.dateDisplay}>
              <Text style={styles.dateDisplayItem}>{time_from}</Text>
              <Text style={styles.dateDisplayItem}>{time_to}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, {marginBottom: 0}]} />        
      </View>

      <View style={{...styles.contentWrapper, marginTop: 20, marginBottom: 20}}>
        <Text style={[styles.postTitle, styles.textCenter, {marginBottom: 15}]}>{i18n('About The Event')}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#eae9e5',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 15,
    marginLeft: 15,
    paddingLeft: 15, paddingRight: 15,
    paddingTop: 30, paddingBottom: 30,
  },
  postTitle: {
    ...news_styles.postTitle,
  },
  postDate: {
    ...news_styles.postDate,
  },
  postContent: {
    ...news_styles.postContent,
  },
  textCenter: {
    textAlign: 'center',
  },
  location: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 25, paddingLeft: 25,
  },
  locationIcon: {
    height: 20, width: 20,
  },
  locationText: {
    color: '#688085',
    fontSize: 14,
    fontFamily: 'AvantGardeBookBT',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  divider: {
    flex: 1, borderBottomWidth: 1, borderBottomColor: '#cccccc',
    marginTop: 15, marginBottom: 15,
  },
  dateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingRight: 25, paddingLeft: 25,
  },
  dateIcon: {
    height: 40, width: 40,
  },
  dateSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dateDisplayItem: {
    color: '#688085',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'AvantGardeBookBT',
    marginLeft: 3,
  },
})

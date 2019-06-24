import React, { Component } from 'react'
import { View, Text } from 'react-native'
import db from './../../util/db'

export default class DataLoader extends Component
{
  componentDidMount()
  {
    // fetch data updates in the background
    this.bootBackground()
  }

  async bootBackground()
  {
    global.metadata = {
      local: await this.props.db.metadata.getLocal(),
      remote: await this.props.db.metadata.getRemote(),
    }

    let sync_delay = +environ.SYNC_DATA_DELAY_MS || ( (environ.dev ? 2 : 5) * 60 * 1000 )

    if ( ! metadata.remote || ! metadata.local || +new Date - metadata.local.updated > sync_delay ) {
      let data = await fetch(`${environ.database_url}/posts/metadata.json?auth=${environ.database_secret}`)
        .then(r => r.json())
        .catch(err => (environ.dev && console.log('err', err), undefined))

      if ( data ) {
        metadata.remote = data
        this.props.db.metadata.setRemote(data)
      }
    }

    if ( metadata && metadata.remote ) {
      const data_promises = []

      metadata.local = metadata.local || {}

      if ( ! metadata.local.phones_updated || metadata.remote.phones_updated !== metadata.local.phones_updated ) {
        environ.dev && console.log('updating phones')

        fetch(`${environ.database_url}/posts/phones.json?auth=${environ.database_secret}`)
          .then(r => r.json())
          .then(async data => this.props.db.phones.persistList(data).then(r =>
            this.props.db.metadata.setLocal({ phones_updated: metadata.remote.phones_updated || +new Date })
            .catch(e => environ.dev && console.log('phones.json err', e))).catch(e => undefined))
          .catch(err => (environ.dev && console.log('err phones', err), undefined))
      }

      if ( ! metadata.local.news_updated || metadata.remote.news_updated !== metadata.local.news_updated ) {
        environ.dev && console.log('updating news')

        fetch(`${environ.database_url}/posts/news.json?auth=${environ.database_secret}`)
          .then(r => r.json())
          .then(async data => this.props.db.news.persistList(data).then(r =>
            this.props.db.metadata.setLocal({ news_updated: metadata.remote.news_updated || +new Date }).catch(e => environ.dev && console.log(e))).catch(e => undefined))
          .catch(err => (environ.dev && console.log('err news', err), undefined))
      }

      if ( ! metadata.local.events_updated || metadata.remote.events_updated !== metadata.local.events_updated ) {
        environ.dev && console.log('updating events')

        fetch(`${environ.database_url}/posts/events.json?auth=${environ.database_secret}`)
          .then(r => r.json())
          .then(async data => this.props.db.events.persistList(data).then(r =>
            this.props.db.metadata.setLocal({ events_updated: metadata.remote.events_updated || +new Date }).catch(e => environ.dev && console.log(e))).catch(e => undefined))
          .catch(err => (environ.dev && console.log('err events', err), undefined))
      }
    }
  }

  render = _ => null
}


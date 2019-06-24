import React, { Component } from 'react'
import { EventsSchema } from './../../util/db'
import News from './../news/'
import Event from './item'

export default class Events extends News
{
  constructor(props)
  {
    super(props)
    this.DB_SCHEMA = EventsSchema
    this.componentId = 'events'
    this.Single = Event
  }
}
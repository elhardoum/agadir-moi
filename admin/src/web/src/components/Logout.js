import React, { Component } from 'react'

import Loading from './Loading'

import { Redirect } from 'react-router-dom'

export default class Logout extends Component
{
  async componentDidMount()
  {
    if ( ! this.props.user || ! this.props.user.id )
      return

    try {
      let res = await fetch('/api/auth', {
        method: 'DELETE',
      }).then(res => res.json())

      if ( res && res.success ) {
        this.props.setGlobalState( { user: {} } )
        return location.assign('/')
      }
    } catch (e) {
      // pass
    }
  
    return location.assign('/account')
  }

  render()
  {
    if ( this.props.user && this.props.user.id ) {
      return <Redirect to='/account' /> 
    }

    return <Loading { ...this.props } />
  }
}
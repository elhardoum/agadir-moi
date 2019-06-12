import React, { Component } from 'react'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class Settings extends Component
{
  constructor(props)
  {
    super(props)

    const { email, first_name, last_name } = props.user

    this.state = {
      email,
      password: '',
      password_conf: '',
      first_name,
      last_name,
      errors: {
        email: [], password: [], password_conf: [], general: [], first_name: [], last_name: []
      },
      loading: null,
      success: null,
    }

    this.ABORT_CONTROLLER = new AbortController
    this.REF_EMAIL = React.createRef()
    this.REF_PASSWORD = React.createRef()
    this.REF_PASSWORD_CONF = React.createRef()
    this.REF_FIRST_NAME = React.createRef()
    this.REF_LAST_NAME = React.createRef()
  }

  async submit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { first_name, last_name, email, password, password_conf, errors } = this.state
    errors.email = []
    errors.password = []
    errors.password_conf = []
    errors.first_name = []
    errors.last_name = []
    errors.general = []

    let success // be your noise

    this.setState({ errors, success: false })

    if ( ! first_name || ! first_name.trim() )
      return this.REF_FIRST_NAME.current.focus()

    if ( ! last_name || ! last_name.trim() )
      return this.REF_LAST_NAME.current.focus()

    if ( ! email || ! email.trim() )
      return this.REF_EMAIL.current.focus()

    if ( password && ! password.trim() )
      return this.REF_PASSWORD.current.focus()

    if ( password && ! password_conf.trim() )
      return this.REF_PASSWORD_CONF.current.focus()

    if ( password && password !== password_conf ) {
      errors['password_conf'].push('Password mismatch.')
      this.setState({ errors })
      return this.REF_PASSWORD_CONF.current.focus()
    }

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let body = [
        first_name ? `first_name=${encodeURIComponent(first_name)}` : '',
        last_name ? `last_name=${encodeURIComponent(last_name)}` : '',
        email ? `email=${encodeURIComponent(email)}` : '',
        password ? `password=${encodeURIComponent(password)}` : '',
      ].filter(Boolean).join('&')

      let res = await fetch('/api/auth/profile-edit', {
        method: 'post',
        body,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.id && res.email ) {
        success = true
        this.props.updateUser( res )
      } else if ( res.errors && res.errors.length ) {
        res.errors.forEach(err => errors[err.field||'general'].push(err.error))
      }
    } catch (e) {
      // pass
      errors['general'].push('Error occurred, please try again or contact us.')
    }

    this.setState({ errors, loading: false, success })
  }

  render()
  {
    const { first_name, last_name, email, password, password_conf, errors, loading, success } = this.state

    return (
      <div>
        <form className="w-full max-w-md px-3 m-auto" onSubmit={e => this.submit(e)}>
          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-first_name">
                First Name
              </label>
              <input
                onChange={e => this.setState({first_name: e.target.value})}
                value={first_name}
                ref={this.REF_FIRST_NAME}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.first_name.length ? ' border-red' : '')} id="grid-first_name" type="text" placeholder="Your first name" />
              { errors.first_name.length ? <p className="text-red text-xs italic">{ errors.first_name.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-last_name">
                Last Name
              </label>
              <input
                onChange={e => this.setState({last_name: e.target.value})}
                value={last_name}
                ref={this.REF_LAST_NAME}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.last_name.length ? ' border-red' : '')} id="grid-last_name" type="text" placeholder="Your last name" />
              { errors.last_name.length ? <p className="text-red text-xs italic">{ errors.last_name.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-email">
                Email address
              </label>
              <input
                onChange={e => this.setState({email: e.target.value})}
                value={email}
                ref={this.REF_EMAIL}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.email.length ? ' border-red' : '')} id="grid-email" type="email" placeholder="Your email address" />
              { errors.email.length ? <p className="text-red text-xs italic">{ errors.email.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password">
                New Password (optional)
              </label>
              <input
                onChange={e => this.setState({password: e.target.value})}
                value={password}
                ref={this.REF_PASSWORD}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password.length ? ' border-red' : '')} id="grid-password" type="password" placeholder="Choose a password" />
              { errors.password.length ? <p className="text-red text-xs italic">{ errors.password.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password_conf">
                Confirm New Password (optional)
              </label>
              <input
                onChange={e => this.setState({password_conf: e.target.value})}
                value={password_conf}
                ref={this.REF_PASSWORD_CONF}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password_conf.length ? ' border-red' : '')} id="grid-password_conf" type="password" placeholder="Confirm your new password" />
              { errors.password_conf.length ? <p className="text-red text-xs italic">{ errors.password_conf.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex items-center">
            <button className="bg-blue-2 focus:outline-none font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">
              Update Profile
            </button>

            { loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : '' }
            { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            { success ? <p className="text-red text-sm text-green">Account updated successfully!</p> : '' }
          </div>
        </form>
      </div>
    )
  }
}
import React, { Component } from 'react'
import { title, is_email, config } from './../../helpers'
import { Link } from 'react-router-dom'
import Loading from './../misc/Loading'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class ResetPassword extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      password: '',
      password_conf: '',
      errors: {
        password: [], password_conf: [], general: []
      },
      loading: null,
      valid_token: null,
      reset_done: null,
    }

    this.ABORT_CONTROLLER = new AbortController
    this.REF_PASSWORD = React.createRef()
    this.REF_PASSWORD_CONF = React.createRef()
  }

  async componentDidMount()
  {
    title('Reset Password')

    const { token } = this.props.match.params || {}

    if ( ! token )
      return this.setState({ valid_token: false })
    
    try {
      let res = await fetch('/api/users/password-reset', {
        method: 'post',
        body: `token=${encodeURIComponent(token)}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      }).then(res => res.json())

      this.setState({ valid_token: res && res.success })
    } catch (e) {
      this.setState({ valid_token: false })
    }
  }

  async submit(e)
  {
    e.preventDefault()

    if ( this.state.reset_done )
      return

    document.activeElement && document.activeElement.blur()

    const { password, password_conf, errors } = this.state
    errors.password = []
    errors.password_conf = []
    errors.general = []

    let reset_done

    this.setState({ errors })

    if ( ! password || ! password.trim() || password.length < 6 ) {
      errors.password.push('Please enter a valid password.')
      this.setState({ errors })
      return this.REF_PASSWORD.current.focus()
    }

    if ( password !== password_conf ) {
      errors.password_conf.push(password_conf.trim() ? 'Password confirmation mismatch.' : 'Please confirm your new password.')
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

      let res = await fetch('/api/users/password-reset', {
        method: 'post',
        body: `password=${encodeURIComponent(password)}&token=${this.props.match.params.token}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        reset_done = true
      } else if ( res.errors && res.errors.length ) {
        res.errors.forEach(err => errors[err.field||'general'].push(err.error))
      }
    } catch (e) {
      // pass
      errors['general'].push('Error occurred, please try again or contact us.')
    }

    this.setState({ errors, loading: false, reset_done })
  }

  render()
  {
    const { errors, loading, valid_token, reset_done, password, password_conf, include_fields=[] } = this.state

    if ( null === valid_token ) {
      return <Loading { ...this.props } />
    }

    return (
      <div className="flex mt-10 items-center">
        { valid_token && <form className="w-full max-w-md m-auto px-3" onSubmit={e => this.submit(e)}>
          <h1 className="mb-4 text-grey-darker text-2xl">Reset Password</h1>

          <p className="text-grey-darker mb-5">Enter and confirm your new password.</p>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password">
                New Password
              </label>
              <input
                onChange={e => this.setState({password: e.target.value})}
                value={password}
                disabled={reset_done}
                ref={this.REF_PASSWORD}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password.length ? ' border-red' : '')} id="grid-password" type="password" placeholder="Choose a Password" />
              { errors.password.length ? <p className="text-red text-xs italic">{ errors.password.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password_conf">
                Confirm New Password
              </label>
              <input
                onChange={e => this.setState({password_conf: e.target.value})}
                value={password_conf}
                disabled={reset_done}
                ref={this.REF_PASSWORD_CONF}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password_conf.length ? ' border-red' : '')} id="grid-password_conf" type="password" placeholder="Confirm New Password" />
              { errors.password_conf.length ? <p className="text-red text-xs italic">{ errors.password_conf.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          { ! reset_done ?
            <div className="flex items-center">
              <button className="bg-blue-2 focus:outline-none hover:bg-blue-light-2 font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">Submit</button>

              {loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : ''}
              { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
            :
            <p className="text-green">Your password has been reset successfully!</p>
          }

          <p className="mt-5"><Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/login'>Sign In</Link></p>
        </form> || <div className="w-full max-w-md m-auto px-3">
          <h3 className="text-red">Invalid Token</h3>
          <p className="mt-5 text-grey-darker">The link you have followed may have been expired or invalidated. Try resetting your password again.</p>
          <p className="mt-5"><Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/login'>Sign In</Link></p>
        </div> }
      </div>
    )
  }
}
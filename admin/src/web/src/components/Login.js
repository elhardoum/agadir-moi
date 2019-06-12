import React, { Component } from 'react'
import { title, is_email } from './../helpers'

import { Link, Redirect } from 'react-router-dom'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class Login extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      login: '',
      password: '',
      errors: {
        login: [], password: [], general: []
      },
      loading: null
    }

    this.ABORT_CONTROLLER = new AbortController
    this.REF_LOGIN = React.createRef()
    this.REF_PASSWORD = React.createRef()
    this.REF_REMEMBER = React.createRef()
  }

  componentDidMount()
  {
    return title('Login')
  }

  async submit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { login, password, errors } = this.state
    errors.login = []
    errors.password = []
    errors.general = []

    this.setState({ errors })

    if ( ! login || ! login.trim() || ! is_email(login) )
      return this.REF_LOGIN.current.focus()

    if ( ! password || ! password.trim() )
      return this.REF_PASSWORD.current.focus()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let res = await fetch('/api/auth', {
        method: 'post',
        body: `login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}&remember=${this.REF_REMEMBER.current.checked}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        let next = [... new URLSearchParams(this.props.location.search)].find(x => x[0] === 'next')
        next = next && next.pop ? next.pop() : null
        return next ? location.assign(next) : location.reload()
      } else if ( res.errors && res.errors.length ) {
        res.errors.forEach(err => errors[err.field||'general'].push(err.error))
      }
    } catch (e) {
      // pass
      errors['general'].push('Error occurred, please try again or contact us.')
    }

    this.setState({ errors, loading: false })
  }

  render()
  {
    const { login, password, errors, loading } = this.state

    if ( this.props.user && this.props.user.id ) {
      return <Redirect to='/account' /> 
    }

    return (
      <div className="flex mt-10 items-center">
        <form className="w-full max-w-md m-auto px-3" onSubmit={e => this.submit(e)}>
          <h1 className="mb-4 text-grey-darker text-2xl">Sign In</h1>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-login">
                Email
              </label>
              <input
                onChange={e => this.setState({login: e.target.value})}
                value={login}
                ref={this.REF_LOGIN}
                type="email"
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.login.length ? ' border-red' : '')} id="grid-login" type="text" />
              { errors.login.length ? <p className="text-red text-xs italic">{ errors.login.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password">
                Password
              </label>
              <input
                onChange={e => this.setState({password: e.target.value})}
                value={password}
                ref={this.REF_PASSWORD}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password.length ? ' border-red' : '')} id="grid-password" type="password" />
              { errors.password.length ? <p className="text-red text-xs italic">{ errors.password.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          <div className="-mx-3 mb-3 px-3">
            <label className="table">
              <input type="checkbox" ref={this.REF_REMEMBER}/>
              <span className="text-sm text-grey-darker ml-2">Remember Me</span>
            </label>
          </div>

          <div className="flex items-center">
            <button className="bg-blue-2 hover:bg-orange-light-2 focus:outline-none font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">
              Sign In
            </button>

            {loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : ''}
            { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
          </div>

          <p className="mt-5"><Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/lost-password'>Forgot your password?</Link></p>
          <p className="mt-2 text-sm text-grey-darker">Don't have an account? <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/register'>Sign Up</Link>
          </p>
        </form>
      </div>
    )
  }
}
import React, { Component } from 'react'
import { title, is_email } from './../../helpers'

import { Link, Redirect } from 'react-router-dom'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class Register extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      errors: {
        email: [], password: [], general: [], first_name: [], last_name: []
      },
      loading: null,
      success: null,
    }

    this.ABORT_CONTROLLER = new AbortController
    this.REF_EMAIL = React.createRef()
    this.REF_PASSWORD = React.createRef()
    this.REF_FIRST_NAME = React.createRef()
    this.REF_LAST_NAME = React.createRef()
  }

  componentDidMount()
  {
    return title('Create an Account')
  }

  async submit(e)
  {
    e.preventDefault()

    if ( this.state.success )
      return

    document.activeElement && document.activeElement.blur()

    const { first_name, last_name, email, password, errors } = this.state
    errors.email = []
    errors.password = []
    errors.first_name = []
    errors.last_name = []
    errors.general = []

    let success // be your noise

    this.setState({ errors })

    if ( ! first_name || ! first_name.trim() )
      return this.REF_FIRST_NAME.current.focus()

    if ( ! last_name || ! last_name.trim() )
      return this.REF_LAST_NAME.current.focus()

    if ( ! email || ! email.trim() || ! is_email(email) )
      return this.REF_EMAIL.current.focus()

    if ( ! password || ! password.trim() )
      return this.REF_PASSWORD.current.focus()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let res = await fetch('/api/users/create', {
        method: 'post',
        body: `first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        success = true
        setTimeout(e => location.reload(), 2000)
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
    const { first_name, last_name, email, password, errors, loading, success } = this.state

    if ( this.props.user && this.props.user.id ) {
      return <Redirect to='/account' /> 
    }

    return (
      <div className="flex mt-10 items-center pt-3">
        <form className="w-full max-w-md m-auto px-3" onSubmit={e => this.submit(e)}>
          <h1 className="mb-4 text-grey-darker text-2xl">Create an Account</h1>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-first_name">
                First Name
              </label>
              <input
                onChange={e => this.setState({first_name: e.target.value})}
                value={first_name}
                disabled={success}
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
                disabled={success}
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
                disabled={success}
                ref={this.REF_EMAIL}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.email.length ? ' border-red' : '')} id="grid-email" type="email" placeholder="Your email address" />
              { errors.email.length ? <p className="text-red text-xs italic">{ errors.email.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
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
                disabled={success}
                ref={this.REF_PASSWORD}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.password.length ? ' border-red' : '')} id="grid-password" type="password" placeholder="Choose a password" />
              { errors.password.length ? <p className="text-red text-xs italic">{ errors.password.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          { ! success ? <div className="flex items-center">
            <button className="bg-blue-2 hover:bg-orange-light focus:outline-none font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">
              Create Account
            </button>

            {loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : ''}
            { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
          </div> :
            <p className="text-green">Your account was successfully created! Login to get started.</p>
          }

          <p className="mt-2 text-sm text-grey-darker">Have an account? <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/login'>Sign In</Link>
          </p>
        </form>
      </div>
    )
  }
}
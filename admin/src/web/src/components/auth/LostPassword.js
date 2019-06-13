import React, { Component } from 'react'
import { title, is_email } from './../../helpers'

import { Link } from 'react-router-dom'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class LostPassword extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      email: '',
      errors: {
        email: [], general: []
      },
      loading: null,
      sent: null
    }

    this.ABORT_CONTROLLER = new AbortController
    this.REF_EMAIL = React.createRef()
  }

  componentDidMount()
  {
    return title('Lost Password')
  }

  async submit(e)
  {
    e.preventDefault()

    if ( this.state.sent )
      return

    document.activeElement && document.activeElement.blur()

    const { email, errors } = this.state
    errors.email = []
    errors.general = []
    let sent

    this.setState({ errors })

    if ( ! email || ! email.trim() || ! is_email(email) )
      return this.REF_EMAIL.current.focus()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let res = await fetch('/api/auth/lost-password', {
        method: 'post',
        body: `email=${encodeURIComponent(email)}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        sent = true
      } else if ( res.errors && res.errors.length ) {
        res.errors.forEach(err => errors[err.field||'general'].push(err.error))
      }
    } catch (e) {
      // pass
      errors['general'].push('Error occurred, please try again or contact us.')
    }

    this.setState({ errors, loading: false, sent })
  }

  render()
  {
    const { email, errors, loading, sent } = this.state

    return (
      <div className="flex mt-10 items-center">
        <form className="w-full max-w-md m-auto px-3" onSubmit={e => this.submit(e)}>
          <h1 className="mb-4 text-grey-darker text-2xl">Lost Password</h1>
          <p className="text-grey-darker mb-3">Enter the email address associated with your account below to reset your password.</p>

          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-email">
                Email Address
              </label>
              <input
                onChange={e => this.setState({email: e.target.value})}
                disabled={sent}
                value={email}
                ref={this.REF_EMAIL}
                className={'appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-blue-2' + (errors.email.length ? ' border-red' : '')} id="grid-email" type="text" />
              { errors.email.length ? <p className="text-red text-xs italic">{ errors.email.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          </div>

          { ! sent ?
            <div className="flex items-center">
              <button className="bg-blue-2 focus:outline-none hover:bg-blue-light-2 font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">Submit</button>

              {loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : ''}
              { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
            :
            <p className="text-green">We have emailed you a password-reset link. Follow the instructions to set a new password.</p>
          }
          { this.props.user && this.props.user.id && <div>
            <p className="mt-5"><Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/account'>My Account</Link></p>
          </div> || <div>
          <p className="mt-5"><Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/login'>Sign In</Link></p>
          </div> }
        </form>
      </div>
    )
  }
}
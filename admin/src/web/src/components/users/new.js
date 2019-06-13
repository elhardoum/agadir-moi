import React, { Component } from 'react'
import { title } from './../../helpers'
import Autocomplete from 'react-autocomplete'
import { Link } from 'react-router-dom'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import { ALL_USER_ROLES } from './../../config'

export default class UsersNew extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      errors: {
        first_name: [], last_name: [], email: [], password: [], role: [], general: []
      },
    }

    this._REFS = [...Array(4)].map( React.createRef )
    this.ABORT_CONTROLLER = new AbortController
  }

  componentDidMount()
  {
    title('Add New User')

    const list = this.props.getGlobalState('users/raw-list')

    list || fetch('/api/users/manage')
      .then(res => res.json())
      .then(list => Array.isArray(list) && this.props.setGlobalState({'users/raw-list': list}))
      .catch(e => 1)
  }

  async onSubmit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { first_name='', last_name='', email='', password='', role='', errors } = this.state
    errors.first_name = []
    errors.last_name = []
    errors.general = []
    errors.password = []
    errors.role = []

    this.setState({ errors })

    if ( ! first_name.trim() )
      return this._REFS[0].current.focus()

    if ( ! last_name.trim() )
      return this._REFS[1].current.focus()

    if ( ! email.trim() )
      return this._REFS[2].current.focus()

    if ( password && password.length < 6 )
      return this._REFS[3].current.focus()

    if ( ! role || Object.keys(ALL_USER_ROLES).indexOf(role) < 0 ) {
      return errors.role.push('Please select a user role.') && this.setState({ errors })
    }

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let res = await fetch('/api/users/manage', {
        method: 'PUT',
        body: (new URLSearchParams({
          first_name: encodeURIComponent(first_name.trim()),
          last_name: encodeURIComponent(last_name.trim()),
          email: email.trim(),
          password: encodeURIComponent(password),
          role: encodeURIComponent(role.trim()),
        })).toString(),
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res && Array.isArray(res) ) { // returns a list on success
        this.props.setGlobalState({'users/raw-list': res})
        return this.props.history.push('/users')
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
    const { user } = this.props
        , { loading, first_name='', last_name='', email='', password='', role='', errors } = this.state

    return (
      <div className="h-full">
        <Link to='/users' className="text-blue text-sm cursor-pointer pl-2">&lsaquo; Back</Link>

        <form className="px-2" onSubmit={e => this.onSubmit(e)}>
          <div className="bg-white mt-3 p-6 shadow w-full">
            <div>
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-first_name">First Name</label>
              <input
                onChange={e => this.setState({first_name: e.target.value})}
                value={first_name}
                ref={this._REFS[0]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.first_name.length ? ' border-red' : ''}`}
                id="grid-first_name"
                type="text" />
              { errors.first_name.length ? <p className="text-red text-xs italic">{ errors.first_name.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-last_name">Last Name</label>
              <input
                onChange={e => this.setState({last_name: e.target.value})}
                value={last_name}
                ref={this._REFS[1]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.last_name.length ? ' border-red' : ''}`}
                id="grid-last_name"
                type="text" />
              { errors.last_name.length ? <p className="text-red text-xs italic">{ errors.last_name.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-email">Email Address</label>
              <input
                onChange={e => this.setState({email: e.target.value})}
                value={email}
                ref={this._REFS[2]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.email.length ? ' border-red' : ''}`}
                id="grid-email"
                type="text" />
              { errors.email.length ? <p className="text-red text-xs italic">{ errors.email.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password">Password (optional)</label>
              <input
                onChange={e => this.setState({password: e.target.value})}
                value={password}
                ref={this._REFS[3]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.password.length ? ' border-red' : ''}`}
                id="grid-password"
                type="text" />
              <p className="text-grey-darker text-xs">The password will be emailed to the user.</p>
              { errors.password.length ? <p className="text-red text-xs italic">{ errors.password.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-password">Role</label>

              { Object.keys(ALL_USER_ROLES).map((r, i) => <label key={i} className="flex items-center">
                <input
                  onChange={e => this.setState({role: r})}
                  checked={r === role}
                  type="radio"
                  id="grid-role"
                  name="role" />
                <span className="text-grey-darker text-xs ml-1 mt-1">{ ALL_USER_ROLES[r] }</span>
              </label>) }

              { errors.role.length ? <p className="text-red text-xs italic">{ errors.role.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>
          
            <div className="flex items-center mt-6">
              <button className="bg-blue-2 hover:bg-blue-light-2 focus:outline-none font-bold px-4 py-2 rounded shadow text-sm text-white mr-2" type="submit">
                Submit
              </button>

              {loading ? <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> : ''}
              { errors.general.length ? <p className="text-red text-xs italic">{ errors.general.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

          </div>          
        </form>
      </div>
    )
  }
}
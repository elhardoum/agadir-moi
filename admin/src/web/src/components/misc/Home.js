import React, { Component } from 'react'
import { title } from './../../helpers'
import { Link } from 'react-router-dom'

export default class Home extends Component
{
  componentDidMount()
  {
    title('Dashboard')
  }
  render()
  {
    const { user } = this.props

    return (
      <div className="m-auto table">
        <div className="w-full max-w-md m-auto px-3">
          <h3 className="text-grey-darker uppercase tracking-wide">Welcome, { [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User' }!</h3>
          <p className="mt-5 text-grey-darker">Welcome to your Agadir & Moi administration dashboard!</p>

          <ul className="mt-5 text-grey-darker pl-5">
            <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/account/settings">My Profile</Link>
            </li>

            { (user.granted_roles||[]).join('').indexOf('admin') >= 0 && <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/news">Manage News</Link>
            </li> }

            { (user.granted_roles||[]).join('').indexOf('admin') >= 0 && <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/important-phone-numbers">Manage Important Phone Numbers</Link>
            </li> }

            { (user.granted_roles||[]).join('').indexOf('admin') >= 0 && <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/events">Manage Events</Link>
            </li> }

            { (user.granted_roles||[]).indexOf('moderator') >= 0 && <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/complaints">Manage Complaints</Link>
            </li> }

            { (user.granted_roles||[]).indexOf('super-admin') >= 0 && <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/users">Manage Users</Link>
            </li> }

            <li>
              <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to="/logout">Sign Out</Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
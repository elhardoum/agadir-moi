import React, { Component } from 'react'
import { title } from './../../helpers'
import { Link } from 'react-router-dom'

export default class Error404 extends Component
{
  componentDidMount()
  {
    title('Error 404 (Page Not Found)')
  }
  render()
  {
    return (
      <div className="m-auto table">
        <div className="w-full max-w-md m-auto px-3">
          <h2 className="text-grey-darker uppercase tracking-wide">Error 404</h2>
          <p className="mt-5 text-grey-darker">The page you are looking for could not be found. Go <Link className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer" to='/'>Home</Link>?</p>
          { ! ( this.props.user && this.props.user.id ) && <p className="mt-5 text-grey-darker">Perhaps the page you're trying to access is put behind a login. Try <Link to={`/login?next=${encodeURIComponent(this.props.location.pathname + this.props.location.search)}`} className="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker cursor-pointer">logging</Link> into your account first.</p> }
        </div>
      </div>
    )
  }
}
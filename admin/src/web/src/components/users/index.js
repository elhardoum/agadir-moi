import React, { Component } from 'react'
import { title, getQueryArgFromSearch } from './../../helpers'
import { Link } from 'react-router-dom'
import Loading from './../misc/Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class Users extends Component
{
  constructor(props)
  {
    super(props)

    this.ABORT_CONTROLLER = {}
  }

  componentDidMount()
  {
    title('Users')

    const list = this.props.getGlobalState('users/raw-list')

    list || fetch('/api/users/manage')
      .then(res => res.json())
      .then(list => Array.isArray(list) && this.props.setGlobalState({'users/raw-list': list}))
      .catch(e => 1)
  }
  
  delete(id, e)
  {
    e.preventDefault()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER[id] && this.ABORT_CONTROLLER[id].abort && this.ABORT_CONTROLLER[id].abort()
      this.ABORT_CONTROLLER[id] = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      fetch('/api/users/manage', {
        method: 'DELETE',
        body: `id=${id}`,
        signal: this.ABORT_CONTROLLER.signal
      })
      .then(res => res.json())
      .then(res => res && Array.isArray(res) && (this.props.setGlobalState({'users/raw-list': res})))
    } catch ( e ) {
      // show notice
      alert( 'Error occurred, please try again or contact us.' )
    }
  }

  render()
  {
    let items = this.props.getGlobalState('users/raw-list')
      , filter_role = (getQueryArgFromSearch(this.props.location.search, 'role')||'').trim()

    if ( filter_role && items ) {
      items = items.filter(item => item.roles.indexOf(filter_role) >= 0)
    }

    let roles = [], sort = (a,b) => b.id - a.id, temp={}
    ;(this.props.getGlobalState('users/raw-list')||[]).sort(sort).filter(item => roles = roles.concat(item.roles))
    roles = roles.filter(x => x in temp ? false : (temp[x]=1))

    return (
      <div className="h-full px-2">
        { items ? <div className="bg-white mt-3 p-6 shadow w-full">

          { items.length ? <div className="mb-8">
            <div className="flex items-center mb-3">
              <h3 className="flex-1 block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Manage Users</h3>
              {filter_role && <Link className="text-grey-dark mr-2 text-xs" to='/users'>Clear filters</Link>}
              <Link to='/users/new' className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 px-2 py-1 rounded text-white text-xs">Add New</Link>
            </div>

            { roles.length && <div className="text-grey text-sm mb-1 mt-1">{roles.map((role,i) => <Link key={i} to={filter_role === role ? '/users' : `?role=${encodeURIComponent(role)}`}
              className={`${filter_role === role ? 'bg-blue-2' : 'bg-grey-dark' } mb-1 no-underline inline-block inline-flex items-center justify-between mr-1 px-2 py-1 relative rounded-full text-white text-xs`}>
              <span>{role}</span>
            </Link>)}</div> }

            <table className="table-fixed w-full text-sm font-normal" style={{wordBreak: 'break-word'}}>
              <thead className="text-left text-grey-dark">
                <tr className="border-b border-grey-light">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Joined</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-grey-darker">
                { items.sort(sort).map((item,i) => <tr className="border-b border-grey-light" key={i}>
                  <td className="py-2">{ [item.first_name, item.last_name].filter(Boolean).join(' ') || 'N/A' }</td>
                  <td className="py-2">{ item.email }</td>
                  <td className="py-2">{ item.roles.join(', ') }</td>
                  <td className="py-2">{ item.registered ? (new Date(item.registered)).toLocaleDateString() : 'N/A' }</td>
                  <td className="py-2"><div className="sm:flex items-center">

                    <Link to={`/users/edit/${item.id}`}
                      className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 leading-none px-3 py-1 rounded text-white text-xs uppercase mr-1">Edit</Link>

                    { item.id !== this.props.user.id && <span
                      title="Delete user"
                      onClick={ e => confirm('Are you sure you want to delete this user?') && this.delete(item.id, e) }
                      className="bg-red hover:bg-red-darker cursor-pointer h-5 inline rounded-full select-none table text-white w-5 inline-flex items-center">
                      <span className="text-center block w-full">-</span>
                    </span> }
                    
                  </div></td>
                </tr>) }
              </tbody>
            </table>
          </div> : <div className="select-none w-full"><div className="flex h-48 items-center w-full">
          <div className="table m-auto text-sm text-grey">
            {filter_role ? 'No items have matched your filters.' : 'You don\'t have any items yet.'}
            &nbsp;<Link className="text-grey-dark" to='/users/new'>Add New &raquo;</Link>

            {filter_role && <Link className="text-grey-dark table mt-2" to='/users'>Clear filters</Link>}
            </div>
        </div></div> }

        </div> : <div className="bg-white mt-3 p-6 shadow w-full"><div className="flex h-48 items-center text-center w-full">
          <Loading {...this.props} className="w-full" />
        </div></div> }
      </div>
    )
  }
}
import React, { Component } from 'react'
import { title, getQueryArgFromSearch } from './../../helpers'
import { Link } from 'react-router-dom'
import Loading from './../misc/Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class Events extends Component
{
  constructor(props)
  {
    super(props)
    this.state = {}
    this.ABORT_CONTROLLER = {}
  }

  componentDidMount()
  {
    title('Events')
    let cursor = this.state.cursor || getQueryArgFromSearch(this.props.location.search, 'cursor')
      , url = `/api/events${(new URLSearchParams(cursor && +cursor ? {start_at: cursor} : {})).toString().replace(/^(.)/, '?$1')}`

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER[url] && this.ABORT_CONTROLLER[url].abort && this.ABORT_CONTROLLER[url].abort()
      this.ABORT_CONTROLLER[url] = new AbortController
    } catch ( e ) { /* pass */ }

    this.setState({ loading_cursor: true })

    fetch(url, {
      signal: this.ABORT_CONTROLLER[url].signal
    }).then(res => res.json()).then(posts => this.setState(Object.assign({loading_cursor: false}, posts))).catch(e => 1)
  }

  switchCursor(cursor)
  {
    this.setState({ cursor }, _ => this.componentDidMount())
    this.props.history.replace(`/events${(new URLSearchParams(cursor && +cursor ? {cursor: cursor} : {})).toString().replace(/^(.)/, '?$1')}`)
  }

  delete(id, e)
  {
    e.preventDefault()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER[`del-${id}`] && this.ABORT_CONTROLLER[`del-${id}`].abort && this.ABORT_CONTROLLER[`del-${id}`].abort()
      this.ABORT_CONTROLLER[`del-${id}`] = new AbortController
    } catch ( e ) { /* pass */ }

    this.setState({ loading_cursor: true })

    fetch('/api/events', {
      method: 'DELETE',
      body: `id=${encodeURIComponent(id)}`,
      signal: this.ABORT_CONTROLLER[`del-${id}`].signal
    }).then(res => res.json()).then(r => this.componentDidMount()).catch(e => 1)
  }

  render()
  {
    let { items, previous_cursor, next_cursor } = this.state

    return (
      <div className="h-full px-2">
        { items ? <div className="bg-white mt-3 p-6 shadow w-full">

          { items.length ? <div className="mb-8">
            <div className="flex items-center mb-3">
              <h3 className="flex-1 block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Saved Events</h3>
              {false && <Link className="text-grey-dark mr-2 text-xs" to='/events'>Clear filters</Link>}
              <Link to='/events/new' className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 px-2 py-1 rounded text-white text-xs">Add New</Link>
            </div>

            <table className="table-fixed w-full text-sm font-normal">
              <thead className="text-left text-grey-dark">
                <tr className="border-b border-grey-light">
                  <th className="py-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-grey-darker">
                { items.map((item,i) => <tr className="border-b border-grey-light" key={i}>
                  <td className="py-2">{ item.title }</td>
                  <td className="py-2">{ item.category || 'N/A' }</td>
                  <td className="py-2 text-xs">
                    <span className="table" title={(new Date(item.timeCreated)).toLocaleString()}>Created { (new Date(item.timeCreated)).toLocaleDateString() }</span>
                    { !!item.timeUpdated && <span className="table" title={(new Date(item.timeUpdated)).toLocaleString()}>Updated { (new Date(item.timeUpdated)).toLocaleDateString() }</span> }
                  </td>
                  <td className="py-2"><div className="sm:flex items-center">
                    <Link to={`/events/edit/${item.id}`}
                      className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 leading-none px-3 py-1 rounded text-white text-xs uppercase mr-1">Edit</Link>

                    <span
                      title="Delete post"
                      onClick={ e => confirm('Are you sure you want to delete this post?') && this.delete(item.id, e) }
                      className="bg-red hover:bg-red-darker cursor-pointer h-5 inline rounded-full select-none table text-white w-5 inline-flex items-center">
                      <span className="text-center block w-full">-</span>
                    </span>
                  </div></td>
                </tr>) }
              </tbody>
            </table>
          </div> : <div className="select-none w-full"><div className="flex h-48 items-center w-full">
          <div className="table m-auto text-sm text-grey">
            {getQueryArgFromSearch(this.props.location.search, 'cursor') ? <div>
              No items have matched your filters. <a className="cursor-pointer text-grey-dark" onClick={e => this.switchCursor(null)}>Clear filters</a>
            </div>: <div>
              You don't have any events yet. <Link className="text-grey-dark" to='/events/new'>Add New &raquo;</Link>
            </div>}
            </div>
        </div></div> }

        <div className="flex items-center">
          { !!previous_cursor && <a className="bg-blue-2 cursor-pointer no-underline focus:outline-none hover:bg-blue-light-2 px-2 py-1 rounded text-white text-xs mr-1" onClick={e => this.switchCursor(previous_cursor)}>&larr; Previous</a> }
          { !!next_cursor && <a className="bg-blue-2 cursor-pointer no-underline focus:outline-none hover:bg-blue-light-2 px-2 py-1 rounded text-white text-xs mr-1" onClick={e => this.switchCursor(next_cursor)}>Next &rarr;</a> }
          { !!this.state.loading_cursor && <img src="/assets/images/ajax-loader.gif" alt="Loading..." width="20" /> }
        </div>

        </div> : <div className="bg-white mt-3 p-6 shadow w-full"><div className="flex h-48 items-center text-center w-full">
          <Loading {...this.props} className="w-full" />
        </div></div> }
      </div>
    )
  }
}
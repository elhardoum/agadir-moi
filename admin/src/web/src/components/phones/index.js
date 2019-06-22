import React, { Component } from 'react'
import { title, getQueryArgFromSearch } from './../../helpers'
import { Link } from 'react-router-dom'
import Loading from './../misc/Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class ImportantPhoneNumbers extends Component
{
  constructor(props)
  {
    super(props)

    this.ABORT_CONTROLLER = {}
  }

  componentDidMount()
  {
    title('Important Phone Numbers')

    const list = this.props.getGlobalState('phones/raw-list')

    list || fetch('/api/phones')
      .then(res => res.json())
      .then(list => list && list.items && Array.isArray(list.items) && this.props.setGlobalState({'phones/raw-list': list.items}))
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
      fetch('/api/phones', {
        method: 'DELETE',
        body: `id=${id}`,
        signal: this.ABORT_CONTROLLER.signal
      })
      .then( res => {
        if ( 200 === res.status ) {
          return res
        } else {
          throw new Error(res.statusText)
        }
      })
      .then(res => res.json())
      .then(res => res.success && Array.isArray(res.list) && (this.props.setGlobalState({'phones/raw-list': res.list})))
    } catch ( e ) {
      // show notice
      alert( 'Error occurred, please try again or contact us.' )
    }
  }

  render()
  {
    let items = this.props.getGlobalState('phones/raw-list')
      , filter_category = (getQueryArgFromSearch(this.props.location.search, 'category')||'').trim()

    if ( filter_category && items ) {
      items = items.filter(item => item.category === filter_category)
    }

    const categories = []
    ;(this.props.getGlobalState('phones/raw-list')||[]).filter(item => categories.indexOf(item.category) < 0 && categories.push(item.category))

    return (
      <div className="h-full px-2">
        { items ? <div className="bg-white mt-3 p-6 shadow w-full">

          { items.length ? <div className="mb-8">
            <div className="flex items-center mb-3">
              <h3 className="flex-1 block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Saved Numbers</h3>
              {filter_category && <Link className="text-grey-dark mr-2 text-xs" to='/important-phone-numbers'>Clear filters</Link>}
              <Link to='/important-phone-numbers/new' className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 px-2 py-1 rounded text-white text-xs">Add New</Link>
            </div>

            { categories.length && <div className="text-grey text-sm mb-1 mt-1">{categories.map((cat,i) => <Link key={i} to={filter_category === cat ? '/important-phone-numbers' : `?category=${encodeURIComponent(cat)}`}
              className={`${filter_category === cat ? 'bg-blue-2' : 'bg-grey-dark' } mb-1 no-underline inline-block inline-flex items-center justify-between mr-1 px-2 py-1 relative rounded-full text-white text-xs`}>
              <span>{cat}</span>
            </Link>)}</div> }

            <table className="table-fixed w-full text-sm font-normal">
              <thead className="text-left text-grey-dark">
                <tr className="border-b border-grey-light">
                  <th className="py-2">Category</th>
                  <th className="py-2">Phone Number</th>
                  <th className="py-2">Group</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-grey-darker">
                { items.map((item,i) => <tr className="border-b border-grey-light" key={i}>
                  <td className="py-2">{ item.category }</td>
                  <td className="py-2">{ item.number }</td>
                  <td className="py-2">{ item.group }</td>
                  <td className="py-2"><div className="sm:flex items-center">

                    <Link to={`/important-phone-numbers/edit/${item.t}`}
                      className="bg-blue-2 no-underline focus:outline-none hover:bg-blue-light-2 leading-none px-3 py-1 rounded text-white text-xs uppercase mr-1">Edit</Link>

                    <span
                      title="Delete number"
                      onClick={ e => confirm('Are you sure you want to delete this number?') && this.delete(item.t, e) }
                      className="bg-red hover:bg-red-darker cursor-pointer h-5 inline rounded-full select-none table text-white w-5 inline-flex items-center">
                      <span className="text-center block w-full">-</span>
                    </span>
                    
                  </div></td>
                </tr>) }
              </tbody>
            </table>
          </div> : <div className="select-none w-full"><div className="flex h-48 items-center w-full">
          <div className="table m-auto text-sm text-grey">
            {filter_category ? 'No items have matched your filters.' : 'You don\'t have any items yet.'}
            &nbsp;<Link className="text-grey-dark" to='/important-phone-numbers/new'>Add New &raquo;</Link>

            {filter_category && <Link className="text-grey-dark table mt-2" to='/important-phone-numbers'>Clear filters</Link>}
            </div>
        </div></div> }

        </div> : <div className="bg-white mt-3 p-6 shadow w-full"><div className="flex h-48 items-center text-center w-full">
          <Loading {...this.props} className="w-full" />
        </div></div> }
      </div>
    )
  }
}
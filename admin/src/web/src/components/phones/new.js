import React, { Component } from 'react'
import { title } from './../../helpers'
import Autocomplete from 'react-autocomplete'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class ImportantPhoneNumbersNew extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      errors: {
        category: [], phone: [], group: [], general: []
      },
    }

    this._REFS = [...Array(2)].map( React.createRef )
    this.ABORT_CONTROLLER = new AbortController
  }

  componentDidMount()
  {
    title('Add New Number')

    const list = this.props.getGlobalState('phones/raw-list')

    list || fetch('/api/important-phone-numbers')
      .then(res => res.json())
      .then(list => Array.isArray(list) && this.props.setGlobalState({'phones/raw-list': list}))
      .catch(e => 1)
  }

  async onSubmit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { category='', phone='', group='', errors } = this.state
    errors.category = []
    errors.phone = []
    errors.general = []
    errors.group = []

    this.setState({ errors })

    if ( ! category.trim() )
      return (document.forms[0].querySelector('input[type=text]')||{focus: _ => 1}).focus()

    if ( ! phone.trim() )
      return this._REFS[1].current.focus()

    if ( ! group.trim() )
      return this._REFS[2].current.focus()

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      this.setState({loading: true})

      let res = await fetch('/api/important-phone-numbers', {
        method: 'PUT',
        body: `category=${encodeURIComponent(category.trim())}&phone=${encodeURIComponent(phone.trim())}&group=${encodeURIComponent(group.trim())}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        this.props.setGlobalState({'phones/raw-list': res.list})
        return this.props.history.push('/important-phone-numbers')
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
        , { loading, category='', phone='', group='', categories=[], errors } = this.state

    ;(this.props.getGlobalState('phones/raw-list')||[]).forEach(item =>
    {
      categories.indexOf(item.category) < 0 && categories.push(item.category)
    })

    return (
      <div className="h-full">
        <form className="px-2" onSubmit={e => this.onSubmit(e)}>
          <div className="bg-white mt-3 p-6 shadow w-full">
            <h3 className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Category</h3>

            <Autocomplete
              getItemValue={(item) => item.label}
              items={categories.map((x, i) => Object.assign({ label: x, id: i }))}
              renderItem={(item, isHighlighted) =>
                <div style={{ background: isHighlighted ? 'lightgray' : 'white' }} key={`${item.id}`}
                  className="text-grey-dark p-2 hover:text-grey-darker">
                  {item.label}
                </div>
              }
              shouldItemRender={(item, value) => item.label && item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
              onChange={ e => this.setState({ category: e.target.value }) }
              onSelect={ (val, item) => this.setState({ category: item.label }) }
              value={category}
              inputProps={{
                className: `appearance-none block w-full bg-grey-lighter text-grey-darker border border-transparent rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.category.length ? ' border-red' : ''}`,
                style: {paddingRight: '2rem'},
              }}
              wrapperStyle={{}}
              wrapperProps={{ className: 'w-full' }}
              menuStyle={{
                borderRadius: '3px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.9)', padding: '2px 0', fontSize: '90%', position: 'fixed', overflow: 'auto', maxHeight: '50%', zIndex: 999
              }}
            />
            { errors.category.length ? <p className="text-red text-xs italic">{ errors.category.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-phone">Phone Number</label>
              <input
                onChange={e => this.setState({phone: e.target.value})}
                value={phone}
                ref={this._REFS[1]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.phone.length ? ' border-red' : ''}`}
                id="grid-phone"
                type="text" />
              { errors.phone.length ? <p className="text-red text-xs italic">{ errors.phone.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-group">Group</label>
              <input
                onChange={e => this.setState({group: e.target.value})}
                value={group}
                ref={this._REFS[2]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.group.length ? ' border-red' : ''}`}
                id="grid-group"
                placeholder="Name of this party, e.g Police Department #2, Central Hospital"
                type="text" />
              { errors.group.length ? <p className="text-red text-xs italic">{ errors.group.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
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
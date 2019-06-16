import React, { Component } from 'react'
import { title } from './../../helpers'
import Autocomplete from 'react-autocomplete'
import { Link } from 'react-router-dom'
import ImagesPicker from './../misc/ImagesPicker'
import Loading from './../misc/Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class EventsEdit extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      errors: {
        category: [], title: [], content: [], location: [], dates: [], general: []
      },
    }

    this._REFS = [...Array(3)].map( React.createRef )
    this.ABORT_CONTROLLER = new AbortController
  }

  componentDidMount()
  {
    title('Edit Event')

    const id = this.props.match.params.id

    if ( ! /^\d{13,}$/.test(id) )
      return this.setState({ valid: false })

    this.props.getGlobalState('events/categories') || fetch('/api/events/categories')
      .then(res => res.json())
      .then(list => Array.isArray(list) && this.props.setGlobalState({'events/categories': list}))
      .catch(e => 1)

    fetch(`/api/events/item?id=${id}`)
      .then(res => res.json())
      .then(post => post && post.id == id && (_ =>
      {
        let date_entries = [], formatter = epoch => {
          let date = new Date(epoch)
            , y = date.getFullYear()
            , m = date.getMonth()+1
            , d = date.getDate()
            , h = date.getHours()
            , i = date.getMinutes()
            , z = x => x <= 9 ? `0${x}` : x
          return [[y, z(m), z(d)].join('-'), [z(h), z(i)].join(':')]
        }

        if ( post.dates && post.dates.length ) {
          post.dates.forEach((date,i) =>
          {
            date_entries.push([])
            date_entries[date_entries.length-1] = [
              ...formatter(date[0]), ...formatter(date[1])
            ]
          })
        }

        date_entries.length > 0 || date_entries.push([])

        this.setState(Object.assign(post, {valid: true, date_entries}))
      })())
      .catch(e => 1)
  }

  async onSubmit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { category='', title='', content='', location='', images=[], errors } = this.state
    errors.category = []
    errors.title = []
    errors.general = []
    errors.content = []
    errors.dates = []
    errors.location = []

    this.setState({ errors })

    if ( ! title.trim() )
      return this._REFS[0].current.focus()

    if ( ! location.trim() )
      return this._REFS[1].current.focus()

    let { dates, errors: date_errors } = this.validateDateEntries()

    if ( date_errors.length || ! dates.length ) {
      errors.dates = date_errors.length ? date_errors : ['Please enter the event dates.']
      return this.setState({errors})
    }

    if ( ! content.trim() )
      return this._REFS[2].current.focus()

    this.setState({loading: true})

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      let res = await fetch('/api/events', {
        method: 'PATCH',
        body: (new URLSearchParams({
          title: title.trim(),
          category: category.trim(),
          content: content.trim(),
          location: location.trim(),
          id: this.state.id,
        })).toString() + `&images=${images.map(encodeURIComponent).join('&images=')}` + 
          `&${decodeURIComponent(new URLSearchParams({ dates }).toString()).replace(/\,/g, '&dates=')}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        let cats = this.props.getGlobalState('events/categories')

        if ( category && Array.isArray(cats) && cats.indexOf(category) < 0 ) {
          this.props.setGlobalState({'events/categories': cats.concat(category)})
        }

        return this.props.history.push('/events')
      } else if ( res.errors && res.errors.length ) {
        res.errors.forEach(err => errors[err.field||'general'].push(err.error))
      }
    } catch (e) {
      // pass
      errors['general'].push('Error occurred, please try again or contact us.')
    }

    this.setState({ errors, loading: false })
  }

  collectDateItem(parentIndex, index, e)
  {
    e.preventDefault()

    let { date_entries=[[]] } = this.state

    date_entries[parentIndex] = date_entries[parentIndex] || [...new Array(3)]
    date_entries[parentIndex][index] = e.target.value

    this.setState({ date_entries })
  }

  deleteDateEntry(index)
  {
    let { date_entries=[[]] } = this.state
    index >= 0 && index < date_entries.length && date_entries.splice(index,1)
    date_entries.length || date_entries.push([])
    this.setState({ date_entries })
  }

  validateDateEntries()
  {
    let { date_entries=[[]] } = this.state
      , errors = [], dates = []

    date_entries.filter(x => !!x.length).forEach(set =>
    {
      let [ date1, time1, date2, time2 ] = set

      if ( set.filter(Boolean).length !== 4 ) {
        return errors.push('One or more of date or time fields are left unfilled.')
      }

      let datetime1 = +new Date(`${date1} ${time1}`)
      let datetime2 = +new Date(`${date2} ${time2}`)

      if ( isNaN(datetime1) || isNaN(datetime2) ) {
        return errors.push('One or more date fields have invalid values.')
      }

      if ( datetime2 - datetime1 <= 0 ) {
        return errors.push('Event start date must be inferior to event end date.')
      }

      dates.push([ datetime1, datetime2 ])
    })

    return {dates, errors}
  }

  render()
  {
    const { loading, category='', title='', content='', images=[], location='', date_entries=[[]], errors } = this.state

    const categories = this.props.getGlobalState('events/categories') || []

    if ( 'boolean' !== typeof this.state.valid ) {
      return (
        <div className="px-2"><div className="bg-white px-2 mt-3 p-6 shadow w-full"><div className="flex h-48 items-center text-center w-full">
          <Loading {...this.props} className="w-full" />
        </div></div></div>
      )
    } else if ( ! this.state.valid ) {
      return (
        <div className="px-2"><div className="select-none bg-white px-2 mt-3 p-6 shadow w-full"><div className="flex h-48 items-center w-full">
          <div className="table m-auto text-sm text-grey">This event does not exist or is deleted.</div>
        </div></div></div>
      )
    }

    return (
      <div className="h-full">
        <Link to='/events' className="text-blue text-sm cursor-pointer pl-2">&lsaquo; Back</Link>

        <form className="px-2" onSubmit={e => this.onSubmit(e)}>
          <div className="bg-white mt-3 p-6 shadow w-full">
            <div>
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-title">Title</label>
              <input
                onChange={e => this.setState({title: e.target.value})}
                value={title||''}
                ref={this._REFS[0]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.title.length ? ' border-red' : ''}`}
                id="grid-title"
                placeholder="Event title"
                type="text" />
              { errors.title.length ? <p className="text-red text-xs italic">{ errors.title.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-location">Location</label>
              <input
                onChange={e => this.setState({location: e.target.value})}
                value={location}
                ref={this._REFS[1]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.location.length ? ' border-red' : ''}`}
                id="grid-location"
                placeholder="Event location"
                type="text" />
              { errors.location.length ? <p className="text-red text-xs italic">{ errors.location.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-location">Event Date</label>
              { date_entries.map((dates, i) => <div key={i}>
                <div className="border flex flex-wrap items-center p-2 text-grey-darker text-sm mb-1">
                  <label className="flex items-center mr-2 md:mb-0 mb-1">
                    <span className="mr-2">From:</span>
                    <input
                      value={dates[0]||''}
                      onChange={e => this.collectDateItem(i,0,e)}
                      type="date" className="mr-1 appearance-none bg-grey-lighter border border-transparent focus:bg-white focus:border-blue-2 focus:outline-none leading-tight p-1 rounded" />
                    <input
                      value={dates[1]||''}
                      onChange={e => this.collectDateItem(i,1,e)}
                      type="time" className="appearance-none bg-grey-lighter border border-transparent focus:bg-white focus:border-blue-2 focus:outline-none leading-tight p-1 rounded" />
                  </label>

                  <label className="flex items-center flex-1">
                    <span className="mr-2">To:</span>
                    <input
                      value={dates[2]||''}
                      onChange={e => this.collectDateItem(i,2,e)}
                      type="date" className="mr-1 appearance-none bg-grey-lighter border border-transparent focus:bg-white focus:border-blue-2 focus:outline-none leading-tight p-1 rounded" />
                    <input
                      value={dates[3]||''}
                      onChange={e => this.collectDateItem(i,3,e)}
                      type="time" className="appearance-none bg-grey-lighter border border-transparent focus:bg-white focus:border-blue-2 focus:outline-none leading-tight p-1 rounded" />
                  </label>

                  { i+1 == date_entries.length && <svg onClick={e => date_entries.push([]) && this.setState({ date_entries })}
                    className="cursor-pointer" title="New entry" width="17" height="15" fill="#4CAF50" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304.223 304.223">
                    <g> <g> <path d="M152.112,0C68.241,0,0.008,68.244,0.008,152.114c0,83.865,68.233,152.109,152.103,152.109 c83.865,0,152.103-68.244,152.103-152.109C304.215,68.244,235.977,0,152.112,0z M152.112,275.989 c-68.32,0-123.891-55.565-123.891-123.875c0-68.326,55.571-123.891,123.891-123.891s123.891,55.565,123.891,123.891 C276.003,220.424,220.426,275.989,152.112,275.989z"></path> <path d="M221.922,139.186h-56.887V82.298c0-7.141-5.782-12.929-12.923-12.929 c-7.141,0-12.929,5.782-12.929,12.929v56.887H82.296c-7.141,0-12.923,5.782-12.923,12.929c0,7.141,5.782,12.923,12.923,12.923 h56.882v56.893c0,7.142,5.787,12.923,12.929,12.923c7.141,0,12.929-5.782,12.929-12.923v-56.893h56.882 c7.142,0,12.929-5.782,12.929-12.923C234.851,144.967,229.063,139.186,221.922,139.186z"></path> </g> </g>
                  </svg> }

                  <svg onClick={e => this.deleteDateEntry(i)} className="cursor-pointer" title="Delete entry" style={{transform: 'rotate(45deg)'}} width="17" height="15" fill="#F44336" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304.223 304.223">
                    <g> <g> <path d="M152.112,0C68.241,0,0.008,68.244,0.008,152.114c0,83.865,68.233,152.109,152.103,152.109 c83.865,0,152.103-68.244,152.103-152.109C304.215,68.244,235.977,0,152.112,0z M152.112,275.989 c-68.32,0-123.891-55.565-123.891-123.875c0-68.326,55.571-123.891,123.891-123.891s123.891,55.565,123.891,123.891 C276.003,220.424,220.426,275.989,152.112,275.989z"></path> <path d="M221.922,139.186h-56.887V82.298c0-7.141-5.782-12.929-12.923-12.929 c-7.141,0-12.929,5.782-12.929,12.929v56.887H82.296c-7.141,0-12.923,5.782-12.923,12.929c0,7.141,5.782,12.923,12.923,12.923 h56.882v56.893c0,7.142,5.787,12.923,12.929,12.923c7.141,0,12.929-5.782,12.929-12.923v-56.893h56.882 c7.142,0,12.929-5.782,12.929-12.923C234.851,144.967,229.063,139.186,221.922,139.186z"></path> </g> </g>
                  </svg>
                </div>
              </div>) }
              { errors.dates.length ? <p className="text-red text-xs italic">{ errors.dates.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <h3 className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2 mt-6">Category</h3>

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
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-content">Description</label>
              <textarea
                onChange={e => this.setState({content: e.target.value})}
                ref={this._REFS[2]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.content.length ? ' border-red' : ''}`}
                id="grid-content"
                placeholder="About this event"
                value={content} rows="5"></textarea>
              { errors.content.length ? <p className="text-red text-xs italic">{ errors.content.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Event Images</label>
              <div className="border p-2">
                <ImagesPicker {...this.props}
                  onUpdateSelection={images => this.setState({ images: images.map(decodeURIComponent) })}
                  selectedIds={ images.map(decodeURIComponent).map(encodeURIComponent) }
                  />
                </div>
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
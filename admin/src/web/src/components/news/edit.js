import React, { Component } from 'react'
import { title } from './../../helpers'
import Autocomplete from 'react-autocomplete'
import { Link } from 'react-router-dom'
import ImagesPicker from './../misc/ImagesPicker'
import Loading from './../misc/Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class NewsNew extends Component
{
  constructor(props)
  {
    super(props)

    this.state = {
      errors: {
        category: [], title: [], content: [], general: []
      },
    }

    this._REFS = [...Array(2)].map( React.createRef )
    this.ABORT_CONTROLLER = new AbortController
  }

  componentDidMount()
  {
    title('Edit Story')

    const id = this.props.match.params.id

    if ( ! /^\d{13,}$/.test(id) )
      return this.setState({ valid: false })

    this.props.getGlobalState('news/categories') || fetch('/api/news/categories')
      .then(res => res.json())
      .then(list => Array.isArray(list) && this.props.setGlobalState({'news/categories': list}))
      .catch(e => 1)

    fetch(`/api/news/item?id=${id}`)
      .then(res => res.json())
      .then(post => post && post.id == id && this.setState(Object.assign(post, {valid: true})))
      .catch(e => 1)
  }

  async onSubmit(e)
  {
    e.preventDefault()

    document.activeElement && document.activeElement.blur()

    const { category='', title='', content='', images=[], errors } = this.state
    errors.category = []
    errors.title = []
    errors.general = []
    errors.content = []

    this.setState({ errors })

    if ( ! title.trim() )
      return this._REFS[0].current.focus()

    if ( ! content.trim() )
      return this._REFS[1].current.focus()

    this.setState({loading: true})

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER && this.ABORT_CONTROLLER.abort && this.ABORT_CONTROLLER.abort()
      this.ABORT_CONTROLLER = new AbortController
    } catch ( e ) { /* pass */ }

    try {
      let res = await fetch('/api/news', {
        method: 'PATCH',
        body: (new URLSearchParams({
          title: title.trim(),
          category: category.trim(),
          content: content.trim(),
          id: this.state.id,
        })).toString() + `&images=${images.map(encodeURIComponent).join('&images=')}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER.signal
      }).then(res => res.json())

      if ( res.success ) {
        let cats = this.props.getGlobalState('news/categories')

        if ( category && Array.isArray(cats) && cats.indexOf(category) < 0 ) {
          this.props.setGlobalState({'news/categories': cats.concat(category)})
        }

        return this.props.history.push('/news')
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
    const { loading, category='', title='', content='', images=[], errors } = this.state

    const categories = this.props.getGlobalState('news/categories') || []

    if ( 'boolean' !== typeof this.state.valid ) {
      return (
        <div className="px-2"><div className="bg-white px-2 mt-3 p-6 shadow w-full"><div className="flex h-48 items-center text-center w-full">
          <Loading {...this.props} className="w-full" />
        </div></div></div>
      )
    } else if ( ! this.state.valid ) {
      return (
        <div className="px-2"><div className="select-none bg-white px-2 mt-3 p-6 shadow w-full"><div className="flex h-48 items-center w-full">
          <div className="table m-auto text-sm text-grey">This story does not exist or is deleted.</div>
        </div></div></div>
      )
    }

    return (
      <div className="h-full">
        <Link to='/news' className="text-blue text-sm cursor-pointer pl-2">&lsaquo; Back</Link>

        <form className="px-2" onSubmit={e => this.onSubmit(e)}>
          <div className="bg-white mt-3 p-6 shadow w-full">
            <div>
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-title">Title</label>
              <input
                onChange={e => this.setState({title: e.target.value})}
                value={this.state.title||''}
                ref={this._REFS[0]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.title.length ? ' border-red' : ''}`}
                id="grid-title"
                placeholder="Story title"
                type="text" />
              { errors.title.length ? <p className="text-red text-xs italic">{ errors.title.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
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
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" htmlFor="grid-content">Content</label>
              <textarea
                onChange={e => this.setState({content: e.target.value})}
                ref={this._REFS[1]}
                className={`appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-2${errors.content.length ? ' border-red' : ''}`}
                id="grid-content"
                placeholder="Story content"
                value={content} rows="5"></textarea>
              { errors.content.length ? <p className="text-red text-xs italic">{ errors.content.map((e,k) => <span className="table" key={k}>{e}</span>) }</p> : '' }
            </div>

            <div className="mt-6">
              <label className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">Story Images</label>
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
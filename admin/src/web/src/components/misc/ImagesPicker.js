import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ImagesPickerFile from './ImagesPickerFile'
import Loading from './Loading'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export default class ImagesPicker extends Component
{
  constructor(props)
  {
    super(props)
    this.state = {}
    this.UPLOAD_TRIGGER = React.createRef()
    this.ABORT_CONTROLLER = {}
  }

  componentDidMount()
  {
    const list = this.props.getGlobalState('storage/images')

    list || fetch('/api/storage/images')
      .then(res => res.json())
      .then(list => Array.isArray(list) && (list =>
      {
        this.props.setGlobalState({'storage/images': list})

        let { selectedIds, onUpdateSelection } = this.props
          , { selected=[] } = this.state

        // validate preloaded selection from storage items
        selectedIds && selected.length && this.setState({ selected: selected.filter(id => list.find(item => item.id === id)) }, _ =>
          onUpdateSelection && this.state.selected.length !== selectedIds.length
            && onUpdateSelection(this.state.selected))
      })(list))
      .catch(e => 1)

    this.props.selectedIds && this.setState({ selected: this.props.selectedIds })
  }

  uploaderClick(e)
  {
    e.preventDefault()

    let wrapper = document.createElement('div'), key = Math.random().toString(36).substr(2,5)
    document.body.appendChild(wrapper)
    ReactDOM.render(<ImagesPickerFile onChange={e => this.processUpload(e, key)} />, wrapper)
  }

  processUpload(e, key)
  {
    const file = e.target.files[0]

    if ( ! file || ! file.size || +file.size <= 0 )
      return

    if ( ! /^image\//i.test(file.type) )
      return alert('Invalid file type - only images are permitted.')

    const reader = new FileReader
    reader.onload = async _ =>
    {
      const { uploads=[] } = this.state
          , upload = {
            id: key,
            name: file.name,
            access_url: reader.result,
            timeCreated: +new Date,
            loading: 'of course',
          }

      this.setState({ uploads: [upload].concat(uploads) })

      // abort pending XHR if any
      try {
        this.ABORT_CONTROLLER[key] && this.ABORT_CONTROLLER[key].abort && this.ABORT_CONTROLLER[key].abort()
        this.ABORT_CONTROLLER[key] = new AbortController
      } catch ( e ) { /* pass */ }

      try {
        let list = await fetch('/api/storage/images', {
          method: 'PUT',
          body: `filename=${encodeURIComponent(file.name)}&data=${encodeURIComponent(upload.access_url)}&contentType=${encodeURIComponent(file.type)}`,
          headers: { 'Content-type': 'application/x-www-form-urlencoded' },
          signal: this.ABORT_CONTROLLER[key].signal
        }).then(res => res.json())

        if ( list && Array.isArray(list) ) {
          this.props.setGlobalState({'storage/images': list})
        }
      } catch (e) {
        // pass
        alert('Error occurred, please try again later.')
      }

      this.setState({ uploads: (this.state.uploads||[]).filter(f => f.id !== key) })
    }
    reader.readAsDataURL(file)
  }

  onDragOver(e)
  {
    e.preventDefault()

    if ( this.UPLOAD_TRIGGER.current.parentElement.className.indexOf('border-green') < 0 ) {
      this.UPLOAD_TRIGGER.current.parentElement.classList.add('border-green')
    }
  }

  onDragLeave(e)
  {
    e.preventDefault()

    if ( this.UPLOAD_TRIGGER.current.parentElement.className.indexOf('border-green') >= 0 ) {
      this.UPLOAD_TRIGGER.current.parentElement.classList.remove('border-green')
    }
  }

  onDrop(e)
  {
    this.onDragLeave(e)

    e.dataTransfer.dropEffect = 'move'

    if ( e.dataTransfer && e.dataTransfer.files.length !== 0 ) {
      let i = e.dataTransfer.files.length
      while ( --i >= 0 ) {
        this.processUpload({ target: {
          files: [e.dataTransfer.files[i]]
        } }, Math.random().toString(36).substr(2,5))
      }
    }
  }

  async onDelete(file)
  {
    const uploads = (this.state.uploads||[]).concat(this.props.getGlobalState('storage/images')||[])
        , filedata = uploads.find(f => f.id === file.id)

    if ( ! filedata || ! filedata.id )
      return

    // abort pending XHR if any
    try {
      this.ABORT_CONTROLLER[`del${filedata.id}`] && this.ABORT_CONTROLLER[`del${filedata.id}`].abort && this.ABORT_CONTROLLER[`del${filedata.id}`].abort()
      this.ABORT_CONTROLLER[`del${filedata.id}`] = new AbortController
      this.ABORT_CONTROLLER[filedata.id] && this.ABORT_CONTROLLER[filedata.id].abort && this.ABORT_CONTROLLER[filedata.id].abort()
    } catch ( e ) { /* pass */ }

    if ( filedata.loading )
      // cancelled the upload XHR, delete on next state update if the file made it to the bucket
      return this.setState({ uploads: (this.state.uploads||[]).filter(f => f.id !== filedata.id) })

    this.setState({ [`deleting_${filedata.id}`]: true })

    try {
      let list = await fetch('/api/storage/images', {
        method: 'DELETE',
        body: `id=${encodeURIComponent(file.id)}`,
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        signal: this.ABORT_CONTROLLER[`del${filedata.id}`].signal
      }).then(res => res.json())

      if ( list && Array.isArray(list) ) {
        return this.props.setGlobalState({'storage/images': list})
      }
    } catch (e) {
      // pass
      alert('Error occurred, please try again later.')
    }

    delete this.state[`deleting_${filedata.id}`]
    this.setState(this.state)
  }

  showItemShow(item)
  {
    const { filter='', show_all=true, selected=[] } = this.state

    if ( ! show_all && selected.indexOf(item.id) < 0 )
      return false

    if ( ! filter )
      return true

    let strip = str => str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
      , bucket = `${strip(item.id)} ${strip(item.name)} ${(new Date(item.timeCreated||+new Date)).toLocaleString()}`

    return strip(bucket).indexOf(strip(filter)) >= 0
  }

  toggleSelected(file)
  {
    if ( file.loading )
      return

    const { selected=[] } = this.state
    selected.indexOf(file.id) >= 0 ? selected.splice(selected.indexOf(file.id), 1) : selected.push(file.id)
    this.setState({selected})
    this.props.onUpdateSelection && this.props.onUpdateSelection(selected)
  }

  render()
  {
    const uploaded_files = this.props.getGlobalState('storage/images')
        , { uploads=[], show_all=true, selected=[] } = this.state
        , files = uploads.concat(uploaded_files||[])
        , files_filtered = files.filter(item => this.showItemShow(item))

    return (
      <div>
        <div className="bg-white border-grey p-2 text-sm w-full">
          { undefined === uploaded_files ? <div className="select-none w-full">
            <div className="flex h-16 items-center w-full">
              <Loading {...this.props} className="w-full" />
            </div>
          </div> : <div className="select-none w-full">
            { files.length > 0 && <div className="flex items-center text-grey-dark text-xs">
              <input type="text" className="bg-grey-lighter block border border-grey-lighter focus:bg-white focus:border-blue-2 focus:outline-none mb-1 mr-2 px-2 py-2 rounded text-grey-darker text-xs"
                placeholder="Filter..."
                onChange={e => this.setState({ filter: e.target.value })} value={this.state.filter||''} />
              <span onClick={e => this.setState({ show_all: !show_all })} className="underline cursor-pointer">Show { show_all ? 'selected' : 'all' }</span>
            </div> }

            { files_filtered.length ? <div className="flex flex-wrap flex-start" style={{ maxHeight: this.props.maxHeight || 250, overflowY: 'scroll' }}>{
              files_filtered.map((file,i) => <div key={file.id}>
                <div
                  style={{backgroundImage: `url(${file.access_url})`, minWidth: 150, maxWidth: 200 }}
                  className={`bg-cover bg-center inline-block h-32 rounded relative m-1${file.loading || this.state[`deleting_${file.id}`] ? ' animate-flicker' : ''}${selected.indexOf(file.id) >= 0 ? ' border-4 border-green' : ''}`}>
                  <div className="h-full table w-full filename" onClick={e => !e.target.classList.contains('item-delete-trigger') && 'A' !== e.target.tagName && this.toggleSelected(file)}>
                    <span className="align-bottom text-center table-cell">
                      <div className="text-xs text-white p-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.58)'}}>
                        <div className="flex items-center">
                          <span className="flex-1 mr-1" style={{ wordBreak: 'break-word' }}>
                            <a href={ file.loading ? null : file.access_url } target="_blank" className="text-white">{ file.name }</a> / { (new Date( file.timeCreated )).toLocaleDateString() }
                          </span>
                          <span
                            title="Delete upload"
                            onClick={e => this.onDelete(file)}
                            className="bg-red hover:bg-red-darker cursor-pointer h-5 inline rounded-full select-none table text-white w-5 inline-flex items-center item-delete-trigger">
                            <span className="text-center block w-full item-delete-trigger">&times;</span>
                          </span>
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>)
            }</div> : <div className="flex h-16 items-center w-full">
              <div className="table m-auto text-sm text-grey">
                { this.state.filter || !show_all ? 'No uploads have matched your filters.' : 'You don\'t have any uploads yet.' }
              </div>
            </div> }
          </div> }
        </div>

        { uploaded_files !== undefined && <div className="bg-cover block inline-block mt-2 w-full h-12 rounded bg-white border border-4 border-grey border-dashed cursor-pointer add-photo-container" style={{borderWidth:3}} draggable="true">
          <div className="h-full flex items-center w-full" ref={this.UPLOAD_TRIGGER}
            onClick={e => this.uploaderClick(e)}
            onDrop={e => this.onDrop(e)}
            onDragOver={e => this.onDragOver(e)}
            onDragLeave={e => this.onDragLeave(e)}
            >
            <svg className="align-middle fill-current table-cell text-center text-grey-dark w-full" width="22" height="20" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304.223 304.223">
              <g> <g> <path d="M152.112,0C68.241,0,0.008,68.244,0.008,152.114c0,83.865,68.233,152.109,152.103,152.109 c83.865,0,152.103-68.244,152.103-152.109C304.215,68.244,235.977,0,152.112,0z M152.112,275.989 c-68.32,0-123.891-55.565-123.891-123.875c0-68.326,55.571-123.891,123.891-123.891s123.891,55.565,123.891,123.891 C276.003,220.424,220.426,275.989,152.112,275.989z"></path> <path d="M221.922,139.186h-56.887V82.298c0-7.141-5.782-12.929-12.923-12.929 c-7.141,0-12.929,5.782-12.929,12.929v56.887H82.296c-7.141,0-12.923,5.782-12.923,12.929c0,7.141,5.782,12.923,12.923,12.923 h56.882v56.893c0,7.142,5.787,12.923,12.929,12.923c7.141,0,12.929-5.782,12.929-12.923v-56.893h56.882 c7.142,0,12.929-5.782,12.929-12.923C234.851,144.967,229.063,139.186,221.922,139.186z"></path> </g> </g>
            </svg>
          </div>
        </div> }
      </div>
    )
  }
}
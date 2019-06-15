import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ImagesPickerFile from './ImagesPickerFile'

export default class ImagesPicker extends Component
{
  constructor(props)
  {
    super(props)

    this.UPLOAD_TRIGGER = React.createRef()
  }

  componentDidMount()
  {
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
    console.log( 'processUpload', e.target.files[0], key )

    const file = e.target.files[0]

    if ( ! file || ! file.size || +file.size <= 0 )
      return

    if ( ! /^image\//i.test(file.type) )
      return alert('Invalid file type - only images are permitted.')

    
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

  render()
  {
    return (
      <div>
        <div className="bg-white border-grey p-2 text-sm w-full">
          <div className="select-none w-full">
            <div className="flex h-16 items-center w-full">
              <div className="table m-auto text-sm text-grey">You don't have any uploads yet.</div>
            </div>
          </div>
        </div>

        <div className="bg-cover block inline-block mt-2 w-32 h-16 rounded bg-white border border-4 border-grey border-dashed cursor-pointer add-photo-container" style={{borderWidth:3}} draggable="true">
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
        </div>
      </div>
    )
  }
}
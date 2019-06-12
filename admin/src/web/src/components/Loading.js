import React, { Component } from 'react'

export default class Loading extends Component
{
  componentDidMount()
  {
    document.body.style.display = 'flex'
  }

  componentWillUnmount()
  {
    document.body.style.display = ''
  }

  render()
  {
    return (
      <div className={'h-full ' + this.props.className}>
        <div className="flex h-full items-center">
          <div className="text-center w-full">
            <img src="/assets/images/ajax-loader.gif" alt="Loading..." />
          </div>
        </div>
      </div>
    )
  }
}
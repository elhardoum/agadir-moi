import React, { Component } from 'react'

export default class ImagesPickerFile extends React.Component
{
  render()
  {
    return <input
      type="file"
      style={{position:'absolute', left: -99999}}
      onChange={ e => this.props.onChange(e) }
      accept="image/*"
      ref={ref => ref.click()} />
  }
}
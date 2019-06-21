import fileSystem from './fileSystem'

export default class dataLoader
{
  constructor(os)
  {
    this.fs = new fileSystem(os)
  }

  async bootBackground()
  {
    console.log( this.fs )
  }
}


export default class fileSystem
{
  constructor(os)
  {
    this.lib = require('react-native-fs')
    this.filesRoot = os == 'android' ? this.lib.DocumentDirectoryPath : this.lib.MainBundlePath
  }

  filepath(filename)
  {
    return `${this.filesRoot.replace(/\/{1,}$/g,'')}/${filename.replace(/^\/{1,}/g,'')}`
  }

  writeFile(filename, raw)
  {
    return new Promise((resolve, reject) => this.lib.writeFile(this.filepath(filename), raw, 'utf8')
      .then((success) => resolve(success))
      .catch((err) => reject(err)))
  }

  readFile(filename, raw)
  {
    return new Promise((resolve, reject) => this.lib.readFile(this.filepath(filename), 'utf8')
      .then(contents => resolve(contents))
      .catch((err) => reject(err)))
  }

  deleteFile(filename, raw)
  {
    return new Promise((resolve, reject) => this.lib.unlink(this.filepath(filename))
      .then((success) => resolve(success))
      .catch((err) => reject(err)))
  }
}
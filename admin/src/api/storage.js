module.exports = {
  http( slug, req, res, default_callback )
  {
    this.permissionsCheck(req, res, _ =>
    {
      switch ( slug ) {
        case 'PUT storage/images':
          return this.httpPut( req, res )

        case 'GET storage/images':
          return this.httpGet( req, res )

        case 'DELETE storage/images':
          return this.httpDelete( req, res )

        default: return default_callback()
      }
    })
  },

  async permissionsCheck( req, res, then )
  {
    const user = await require('./users').getCurrentUser( req )

    if ( user && user.roles && user.roles.join('').indexOf('admin') >= 0 )
      return then(req, res)

    return res.sendJSON(null, 403)
  },

  async httpPut(req, res)
  {
    const { filename, data, contentType } = req.parsedQuery

    if ( ! data )
      return res.sendJSON({ success: false })

    let buffer

    try {
      buffer = Buffer.from(data.replace(/^data\:.+\;base64,/gi, ''), 'base64')
    } catch(e) {/*pass*/}

    if ( ! buffer )
      return res.sendJSON({ success: false })

    await new Promise(res => setTimeout(res, 20000))

    try {
      const admin = require('firebase-admin')

      let _filename = `images/${+new Date}.${filename}`

      admin.apps.length || admin.initializeApp({
        credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
        storageBucket: 'agadir-et-moi.appspot.com'
      })

      const bucket = admin.storage().bucket()
          , upload = bucket.file(_filename)
          , blobStream = upload.createWriteStream({
            metadata: {
              contentType: `image/${contentType.split('/').pop()||'png'}`,
              metadata: {
                firebaseStorageDownloadTokens: process.env.STORAGE_IMAGES_DOWNLOAD_TOKEN,
              }
            }
          })

      let url = await new Promise((resolve, reject) =>
      {
        blobStream.on('error', err =>
        {
          console.log('Uploading to firebase storage ended with an error:', err)
          reject()
        })

        blobStream.on('finish', _ =>
        {
          resolve(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(upload.name)}?alt=media&token=${process.env.STORAGE_IMAGES_DOWNLOAD_TOKEN}`)
        })

        blobStream.end(buffer)
      })

      return this.httpGet(req, res)
    } catch (e)
    {
      // pass
    }

    return res.sendJSON({ success: false })
  },

  async httpGet(req, res)
  {
    try {
      const admin = require('firebase-admin')

      admin.apps.length || admin.initializeApp({
        credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
        storageBucket: 'agadir-et-moi.appspot.com'
      })

      const bucket = admin.storage().bucket(), files = await bucket.getFiles({
        directory: 'images'
      })

      let items = [], path = require('path')

      files.map(list => list.map(file => items.push({
        access_url: `https://firebasestorage.googleapis.com/v0/b/${file.bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${(file.metadata.metadata||{}).firebaseStorageDownloadTokens}`,
        id: file.id,
        name: path.basename(file.name).replace(/^\d+\./g, ''),
        timeCreated: +new Date(file.metadata.timeCreated),
      })))

      return res.sendJSON(items.sort((a,b) => b.timeCreated-a.timeCreated))
    } catch (e)
    {
      console.log('err getting files', e)
      // pass
    }

    return res.sendJSON(null, 500)
  },

  async httpDelete(req, res)
  {
    let { id: ids } = req.parsedQuery
    ids = (Array.isArray(ids) ? ids : [ids]).map(id => decodeURIComponent(id)).filter(Boolean)

    try {
      const admin = require('firebase-admin')

      admin.apps.length || admin.initializeApp({
        credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
        storageBucket: 'agadir-et-moi.appspot.com'
      })

      const bucket = admin.storage().bucket()

      for ( let i=0; i<ids.length; i++ ) {
        try {
          let file = await bucket.file(ids[i])
          await file.delete()
        } catch(e) {}
      }

      return this.httpGet(req, res)
    } catch (e)
    {
      console.log('err deleting files', e)
      // pass
    }

    return res.sendJSON(null, 500)
  }
}

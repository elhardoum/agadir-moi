module.exports = {
  http( slug, req, res, default_callback )
  {
    this.permissionsCheck(req, res, _ =>
    {
      switch ( slug ) {
        case 'PUT news':
        case 'POST news':
          return this.httpPut( req, res )

        case 'PATCH news':
          return this.httpUpdate( req, res )

        case 'GET news':
          return this.httpGet( req, res )

        case 'DELETE news':
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

  async httpPut( req, res )
  {
    let { category, title, content, images=[] } = req.parsedQuery

    let errors = []

    if ( ! title || ! title.trim() ) {
      errors.push({field: 'title', error: 'Please choose a title for this news item.'})
    }

    if ( ! content || ! content.trim() ) {
      errors.push({field: 'content', error: 'News content cannot be empty.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const admin = require('firebase-admin')
    admin.apps.length || admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      databaseURL: 'https://agadir-et-moi.firebaseio.com'
    })

    try {
      const id = 1560678706449 - (+new Date - 1560678706449) // hacks, sorry. valid for ~50 years
          , db = admin.database(), ref = db.ref('posts')

      await ref.child(`news/${id}`).set({
        id, title, content, timeCreated: +new Date,
        ...(category && { category }),
        ...(images && {images: images.map(decodeURIComponent)}),
      })

      return res.sendJSON({success: true, id})
    } catch (e) {}

    return res.sendJSON({success: false})
  },

  async httpGet( req, res )
  {
    let { start_at, limit=10 } = req.parsedQuery

    const admin = require('firebase-admin')
    admin.apps.length || admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      databaseURL: 'https://agadir-et-moi.firebaseio.com'
    })

    try {
      let ref = admin.database().ref('posts/news').orderByKey().limitToFirst((+limit||10)+1)
      start_at && (ref=ref.startAt(String(start_at)))

      let data = (await new Promise(res => ref.once('value', snap => res(snap.val()))))||{}
        , next_cursor = Object.keys(data).length > limit ? Object.keys(data).pop() : null

      for ( let id in data ) {
        data[id] = {
          id: data[id].id,
          title: data[id].title,
          content: data[id].content,
          category: data[id].category,
          timeCreated: data[id].timeCreated,
          ...( data[id].timeUpdated && {timeUpdated: data[id].timeUpdated} ),
          ...( data[id].images && {images: data[id].images} ),
        }
      }

      next_cursor && (delete data[next_cursor])

      return res.sendJSON({ data: Object.values(data), next_cursor })
    } catch (e) {}

    return res.sendJSON(null, 500)
  },

  async httpUpdate( req, res )
  {
    let { category, title, content, images, id } = req.parsedQuery

    let errors = [], post, db, postRef

    if ( ! id || ! /^\d+$/.test(+id) ) {
      errors.push({field: 'title', error: 'Please choose a title for this news item.'})
    } else {
      id = +id
    }

    const admin = require('firebase-admin')
    admin.apps.length || admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      databaseURL: 'https://agadir-et-moi.firebaseio.com'
    })

    try {
      db = admin.database()
      postRef = db.ref(`posts/news/${id}`)
      post = (await new Promise(res => postRef.once('value', snap => res(snap.val()))))||{}
    } catch (e) {}

    if ( ! post || post.id != id )
      return res.sendJSON(null, 404)

    if ( title && ! title.trim() ) {
      errors.push({field: 'title', error: 'Please choose a title for this news item.'})
    }

    if ( content && ! content.trim() ) {
      errors.push({field: 'content', error: 'News content cannot be empty.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    try {
      const updateRef = db.ref(`posts/news/${id}`)

      images = undefined !== images ? (Array.isArray(images)?images:[images]).map(decodeURIComponent).filter(Boolean) : undefined

      await postRef.update({
        ...(title && {title}),
        ...(content && {content}),
        ...(images && {images}),
        ...(category && { category }),
        timeUpdated: +new Date,
      })

      return res.sendJSON({success: true, id})
    } catch (e) {}

    return res.sendJSON({success: false})
  },

  async httpDelete( req, res )
  {
    let { id: ids } = req.parsedQuery
    ids = (Array.isArray(ids) ? ids : [ids]).map(id => +id).filter(Boolean)

    if ( ids.length == 0 )
      return res.sendJSON({success: true})

    const admin = require('firebase-admin')
    admin.apps.length || admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      databaseURL: 'https://agadir-et-moi.firebaseio.com'
    })

    const db = admin.database(), deletes = []

    for ( let i=0; i<ids.length; i++ ) {
      try {
        let ref = db.ref(`posts/news/${ids[i]}`)
        deletes.push(new Promise(res => ref.once('value', snap => res(snap.val()))))
        ref.remove()
      } catch (e) {}
    }

    if ( deletes.length ) {
      try {
        await Promise.all(deletes)
      } catch(e) {/*pass*/}

      return res.sendJSON({success: true})
    }

    return res.sendJSON({success: false})
  },
}

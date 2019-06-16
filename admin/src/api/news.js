module.exports = class news
{
  constructor()
  {
    this.collectionId = 'news'
  }

  http( slug, req, res, default_callback )
  {
    this.permissionsCheck(req, res, _ =>
    {
      switch ( slug ) {
        case `PUT ${this.collectionId}`:
        case `POST ${this.collectionId}`:
          return this.httpPut( req, res )

        case `PATCH ${this.collectionId}`:
          return this.httpUpdate( req, res )

        case `GET ${this.collectionId}`:
          return this.httpGet( req, res )

        case `DELETE ${this.collectionId}`:
          return this.httpDelete( req, res )

        case `GET ${this.collectionId}/categories`:
          return this.httpGetCategories( req, res )

        case `GET ${this.collectionId}/item`:
          return this.httpGetItem( req, res )

        default: return default_callback()
      }
    })
  }

  async permissionsCheck( req, res, then )
  {
    const user = await require('./users').getCurrentUser( req )

    if ( user && user.roles && user.roles.join('').indexOf('admin') >= 0 )
      return then(req, res)

    return res.sendJSON(null, 403)
  }

  uid()
  {
    return 1560678706449 - (+new Date - 1560678706449) // hacks, sorry. valid for ~50 years
  }

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

    const admin = APP_UTIL.initFirebaseApp()

    try {
      const id = this.uid(), db = admin.database(), ref = db.ref('posts')

      await ref.child(`${this.collectionId}/${id}`).set({
        id, title, content, timeCreated: +new Date,
        ...(category && { category }),
        ...(images && {images: (Array.isArray(images)?images:[images]).map(decodeURIComponent)}),
      })

      return res.sendJSON({success: true, id})
    } catch (e) {}

    return res.sendJSON({success: false})
  }

  parseItemData(data)
  {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      timeCreated: data.timeCreated,
      ...( data.timeUpdated && {timeUpdated: data.timeUpdated} ),
      ...( data.images && {images: data.images} ),
    }
  }

  async httpGet( req, res )
  {
    let { start_at, limit } = req.parsedQuery

    const admin = APP_UTIL.initFirebaseApp()

    try {
      limit = +limit||(process.env.POSTS_ITEMS_PER_PAGE||10)
      let ref = admin.database().ref(`posts/${this.collectionId}`).orderByKey().limitToFirst(limit+1)
      start_at && (ref=ref.startAt(String(start_at)))

      let data = (await new Promise(res => ref.once('value', snap => res(snap.val()))))||{}
        , next_cursor = Object.keys(data).length > limit ? Object.keys(data).pop() : null
        , previous_cursor = null

      for ( let id in data ) {
        data[id] = this.parseItemData(data[id])
      }

      next_cursor && (delete data[next_cursor])

      if ( start_at ) {
        try {
          let ref = admin.database().ref(`posts/${this.collectionId}`).orderByKey()
            , keys = (await new Promise(res => ref.once('value', snap => res(snap.val()))))||{}
            , ids = Object.keys(keys||{})
            , first_id = Object.keys(data)[0]

          if ( ids.length ) {
            let previous_items = ids.slice(0, ids.indexOf(first_id)).reverse().slice(0,limit).reverse()
            previous_items.length && (previous_cursor=previous_items[0])
          }
        } catch(e) {}
      }

      return res.sendJSON({ items: Object.values(data), previous_cursor, next_cursor })
    } catch (e) {}

    return res.sendJSON(null, 500)
  }

  async httpUpdate( req, res )
  {
    let { category, title, content, images, id } = req.parsedQuery

    let errors = [], post, db, postRef

    if ( ! id || ! /^\d+$/.test(+id) ) {
      errors.push({field: 'general', error: 'Error, request missing post ID.'})
    } else {
      id = +id
    }

    const admin = APP_UTIL.initFirebaseApp()

    try {
      db = admin.database()
      postRef = db.ref(`posts/${this.collectionId}/${id}`)
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
      const updateRef = db.ref(`posts/${this.collectionId}/${id}`)

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
  }

  async httpDelete( req, res )
  {
    let { id: ids } = req.parsedQuery
    ids = (Array.isArray(ids) ? ids : [ids]).map(id => +id).filter(Boolean)

    if ( ids.length == 0 )
      return res.sendJSON({success: true})

    const admin = APP_UTIL.initFirebaseApp()

    const db = admin.database(), deletes = []

    for ( let i=0; i<ids.length; i++ ) {
      try {
        let ref = db.ref(`posts/${this.collectionId}/${ids[i]}`)
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
  }

  async httpGetCategories( req, res )
  {
    const admin = APP_UTIL.initFirebaseApp()

    try {
      let ref = admin.database().ref(`posts/${this.collectionId}`).orderByKey()
        , data = (await new Promise(res => ref.once('value', snap => res(snap.val()))))||{}
      return res.sendJSON([...new Set(Object.keys(data||{}).map(k => data[k].category).filter(Boolean))])
    } catch(e) {}

    return res.sendJSON([])
  }

  async httpGetItem( req, res )
  {
    const { id } = req.parsedQuery

    if ( ! id || ! /^\d+$/.test(+id) )
      return res.sendJSON(null, 404)

    const admin = APP_UTIL.initFirebaseApp()

    try {
      let ref = admin.database().ref(`posts/${this.collectionId}/${id}`)
        , data = (await new Promise(res => ref.once('value', snap => res(snap.val()))))||{}

      return res.sendJSON( data, data && data.id ? 200 : 404 )
    } catch(e) {}

    return res.sendJSON([])
  }
}

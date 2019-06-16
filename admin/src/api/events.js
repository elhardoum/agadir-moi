const news = require('./news')

module.exports = class events extends news
{
  constructor(...args)
  {
    super(...args)
    this.collectionId = 'events'
  }

  async httpPut( req, res )
  {
    let { category, title, content, location, dates=[], images=[] } = req.parsedQuery

    let errors = []

    if ( ! title || ! title.trim() ) {
      errors.push({field: 'title', error: 'Please choose a title for this news item.'})
    }

    if ( ! content || ! content.trim() ) {
      errors.push({field: 'content', error: 'Event description cannot be empty.'})
    }

    if ( ! location || ! location.trim() ) {
      errors.push({field: 'location', error: 'Event location cannot be empty.'})
    }

    dates = dates.reduce((all,one,i) => {
      const ch = Math.floor(i/2)
      all[ch] = [].concat((all[ch]||[]),one)
      return all
    }, []).map(x => x.map(y => +y).filter(y => y>0)).filter(x => x.length == 2)

    let dates_pre = dates
    dates = dates.map(pair =>
    {
      let datetime1 = +new Date(pair[0])
      let datetime2 = +new Date(pair[1])

      if ( isNaN(datetime1) || isNaN(datetime2) )
        return

      if ( datetime2 - datetime1 <= 0 )
        return

      return [ datetime1, datetime2 ]
    }).filter(Boolean)

    if ( ! dates.length || dates_pre.length !== dates.length ) {
      errors.push({field: 'dates', error: 'Empty or invalid event start and end dates.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const admin = APP_UTIL.initFirebaseApp()

    try {
      const id = this.uid(), db = admin.database(), ref = db.ref('posts')

      await ref.child(`${this.collectionId}/${id}`).set({
        id, title, content, location, dates, timeCreated: +new Date,
        ...(category && { category }),
        ...(images && {images: (Array.isArray(images)?images:[images]).map(decodeURIComponent)}),
      })

      return res.sendJSON({success: true, id})
    } catch (e) {}

    return res.sendJSON({success: false})
  }

  async httpUpdate( req, res )
  {
    let { category, title, content, location, dates=[], images=[], id } = req.parsedQuery

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

    if ( ! title || ! title.trim() ) {
      errors.push({field: 'title', error: 'Please choose a title for this news item.'})
    }

    if ( ! content || ! content.trim() ) {
      errors.push({field: 'content', error: 'Event description cannot be empty.'})
    }

    if ( ! location || ! location.trim() ) {
      errors.push({field: 'location', error: 'Event location cannot be empty.'})
    }

    dates = dates.reduce((all,one,i) => {
      const ch = Math.floor(i/2)
      all[ch] = [].concat((all[ch]||[]),one)
      return all
    }, []).map(x => x.map(y => +y).filter(y => y>0)).filter(x => x.length == 2)

    let dates_pre = dates
    dates = dates.map(pair =>
    {
      let datetime1 = +new Date(pair[0])
      let datetime2 = +new Date(pair[1])

      if ( isNaN(datetime1) || isNaN(datetime2) )
        return

      if ( datetime2 - datetime1 <= 0 )
        return

      return [ datetime1, datetime2 ]
    }).filter(Boolean)

    if ( ! dates.length || dates_pre.length !== dates.length ) {
      errors.push({field: 'dates', error: 'Empty or invalid event start and end dates.'})
    }

    try {
      const updateRef = db.ref(`posts/${this.collectionId}/${id}`)

      images = undefined !== images ? (Array.isArray(images)?images:[images]).map(decodeURIComponent).filter(Boolean) : undefined

      await postRef.update({
        ...(title && {title}),
        ...(content && {content}),
        ...(location && {location}),
        ...(images && {images}),
        ...(dates && {dates}),
        ...(category && { category }),
        timeUpdated: +new Date,
      })

      return res.sendJSON({success: true, id})
    } catch (e) {console.log(e)}

    return res.sendJSON({success: false})
  }

  parseItemData(data)
  {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      location: data.location,
      timeCreated: data.timeCreated,
      ...( data.timeUpdated && {timeUpdated: data.timeUpdated} ),
      ...( data.images && {images: data.images} ),
      ...( data.dates && {dates: data.dates} ),
    }
  }
}
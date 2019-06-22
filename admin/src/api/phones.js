const news = require('./news')

module.exports = class phones extends news
{
  constructor(...args)
  {
    super(...args)
    this.collectionId = 'important-phone-numbers'
    this.DEFAULT_LIST_LIMIT = undefined
  }

  async httpPut( req, res )
  {
    let { category, phone, group } = req.parsedQuery

    let errors = []

    if ( ! category || ! category.trim() ) {
      errors.push({field: 'category', error: 'Please enter a category name for this number.'})
    }

    if ( ! phone || ! phone.trim() ) {
      errors.push({field: 'phone', error: 'Please enter a phone number.'})
    }

    if ( ! group || ! group.trim() ) {
      errors.push({field: 'group', error: 'Please enter a group value.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const admin = APP_UTIL.initFirebaseApp()

    try {
      const id = this.uid(), db = admin.database(), ref = db.ref('posts')

      await ref.child(`${this.collectionId}/${id}`).set({id, category, number: phone, group, timeCreated: +new Date,})

      req.parsedQuery.limit = -1
      return res.sendJSON({success: true, list: (await this.httpGet(req, res, d => d)).items||[]})
    } catch (e) {}

    return res.sendJSON({success: false})
  }

  httpDelete(req, res)
  {
    return super.httpDelete( req, res, async (...args) =>
    {
      req.parsedQuery.limit = -1
      args[0].list = (await this.httpGet(req, res, d => d)).items || []
      return res.sendJSON( ... args )
    })
  }

  async httpUpdate( req, res )
  {
    let { category, phone, group, id } = req.parsedQuery

    let errors = [], post, db, postRef

    if ( ! id || ! /^\d+$/.test(id) ) {
      errors.push({field: 'general', error: 'Could not find a record for this number.'})
    }

    if ( ! category || ! category.trim() ) {
      errors.push({field: 'category', error: 'Please enter a category name for this number.'})
    }

    if ( ! phone || ! phone.trim() ) {
      errors.push({field: 'phone', error: 'Please enter a phone number.'})
    }

    if ( ! group || ! group.trim() ) {
      errors.push({field: 'group', error: 'Please enter a group value.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const admin = APP_UTIL.initFirebaseApp()

    try {
      db = admin.database()
      postRef = db.ref(`posts/${this.collectionId}/${id}`)
      post = (await new Promise(res => postRef.once('value', snap => res(snap.val()))))||{}
    } catch (e) {}

    if ( ! post || post.id != id ) {
      errors.push({field: 'general', error: 'Could not find a record for this number.'})
      return res.sendJSON({ success: false, errors })
    }

    try {
      await postRef.update({
        category, number: phone, group,
        timeUpdated: +new Date,
      })

      req.parsedQuery.limit = -1
      return res.sendJSON({success: true, list: (await this.httpGet(req, res, d => d)).items||[]})
    } catch (e) { console.log(e) }

    return res.sendJSON({success: false})
  }

  parseItemData(data)
  {
    return {
      id: data.id,
      t: data.id,
      category: data.category,
      number: data.number,
      group: data.group,
      timeCreated: data.timeCreated,
      ...( data.timeUpdated && {timeUpdated: data.timeUpdated} ),
    }
  }
}
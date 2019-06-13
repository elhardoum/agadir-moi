module.exports = {
  http( slug, req, res, default_callback )
  {
    this.permissionsCheck(req, res, _ =>
    {
      switch ( slug ) {
        case 'PUT important-phone-numbers':
        case 'POST important-phone-numbers':
          return this.httpPut( req, res )

        case 'GET important-phone-numbers':
          return this.httpGet( req, res )

        case 'DELETE important-phone-numbers':
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

  prepareRawList(list)
  {
    return list
  },

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

    let list = ((await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers'))||{}).list || []
      , set = await APP_UTIL.fireStoreSimple.set('kv/important-phone-numbers', {
      list: (list=list.concat({
        number: phone.trim(),
        category: category.trim(),
        group: group.trim(),
        t: +new Date
      }))
    })

    res.sendJSON({
      success: Boolean(set),
      list: this.prepareRawList(list)
    })
  },


    // // console.log( await APP_UTIL.fireStoreSimple.get('posts/intro-to-firestore') )
    // console.log( await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers') )
    // // console.log( await APP_UTIL.fireStoreSimple.set('kv/important-phone-numbers', {
    // //   list: [
    // //     {
    // //       number: 911,
    // //       category: 'Police',
    // //       t: +new Date
    // //     }
    // //   ]
    // // }) )

    // console.log( await APP_UTIL.fireStoreSimple.update('kv/important-phone-numbers', {
    //   add: 12
    // }) )

  async httpGet( req, res )
  {
    let data = await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers')
      , list = (data||{}).list
    return res.sendJSON( this.prepareRawList( list||[] ) )
  },

  async httpDelete( req, res )
  {
    // @todo
  },
}

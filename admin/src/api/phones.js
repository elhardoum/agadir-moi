module.exports = {
  http( slug, req, res, default_callback )
  {
    this.permissionsCheck(req, res, _ =>
    {
      switch ( slug ) {
        case 'PUT important-phone-numbers':
        case 'POST important-phone-numbers':
          return this.httpPut( req, res )

        case 'PATCH important-phone-numbers':
          return this.httpUpdate( req, res )

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

  async httpUpdate( req, res )
  {
    let { category, phone, group, id } = req.parsedQuery

    let errors = []

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

    let list = ((await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers'))||{}).list || []
      , item = list.find(x => x.t == id)

    if ( ! item || ! item.t ) {
      errors.push({field: 'general', error: 'Could not find a record for this number.'})
      return res.sendJSON({ success: false, errors })
    }

    let updated = true

    if ( item.category !== category || item.number !== phone || item.group !== group ) {
      list.map(x => x.t == id ? Object.assign(x, {
        category, number: phone, group, m: +new Date
      }) : x)

      updated = await APP_UTIL.fireStoreSimple.set('kv/important-phone-numbers', { list })
    }

    return res.sendJSON({
      success: Boolean(updated),
      list: this.prepareRawList(list)
    })
  },

  async httpGet( req, res )
  {
    let data = await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers')
      , list = (data||{}).list
    return res.sendJSON( this.prepareRawList( list||[] ) )
  },

  async httpDelete( req, res )
  {
    let { id: ids } = req.parsedQuery
    ids = (Array.isArray(ids) ? ids : [ids]).map(id => +id).filter(Boolean)

    let list_origin = ((await APP_UTIL.fireStoreSimple.get('kv/important-phone-numbers'))||{}).list || [], list

    if ( list_origin.length == 0 )
      return res.sendJSON({
        success: Boolean(updated),
        list: this.prepareRawList(list_origin)
      })

    list = list_origin.map(x => ids.indexOf(x.t) >= 0 ? null : x).filter(Boolean)

    let updated = true

    if ( list.length !== list_origin.length ) {
      updated = await APP_UTIL.fireStoreSimple.set('kv/important-phone-numbers', { list })
    }

    return res.sendJSON({
      success: Boolean(updated),
      list: this.prepareRawList(list)
    })
  },
}

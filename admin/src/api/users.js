module.exports = {
  http( slug, req, res, default_callback )
  {
    switch ( slug ) {
      case 'POST admin/users/create':
        return this.httpCreate( req, res )

      case 'GET auth':
        return this.httpCurrentUser( req, res )        

      case 'POST auth':
        return this.httpLogin( req, res )        

      case 'DELETE auth':
        return this.httpLogout( req, res )        

      case 'POST auth/lost-password':
        return this.httpLostPassword( req, res )

      case 'POST auth/profile-edit':
        return this.httpProfileEdit( req, res )

      case 'POST users/password-reset':
        return this.httpPasswordReset( req, res )        

      case 'PUT users/manage':
      case 'POST users/manage':
      case 'GET users/manage':
      case 'DELETE users/manage':
      case 'PATCH users/manage':
        return this.permissionsCheckSuperAdmin(req, res, (x, y, user) =>
        {
          switch ( slug ) {
            case 'PUT users/manage':
            case 'POST users/manage':
              return this.httpManageCreate( req, res )

            case 'GET users/manage':
              return this.httpManageList( req, res )

            case 'DELETE users/manage':
              return this.httpManageDelete( req, res, user )

            case 'PATCH users/manage':
              return this.httpManageUpdate( req, res )

            default: return default_callback()
          }
        })

      default: return default_callback()
    }
  },

  async httpCurrentUser( req, res )
  {
    const user = await this.getCurrentUser( req )

    if ( ! process.env.SKIP_AUTO_CREATE_SUPER_ADMIN && ! ('auto_create_super_admin_attempt' in global) ) {
      this.cliMaybeRegisterFirstSuperAdmin()
      global.auto_create_super_admin_attempt = 1
    }

    if ( user ) {
      delete user.password
      delete user.reset_token
      delete user.auth_key

      user.gravatar = `https://www.gravatar.com/avatar/${require('crypto').createHash('md5').update(user.email).digest('hex')}?d=mp`

      if ( user.roles.indexOf('super-admin') >= 0 ) {
        user.granted_roles = JSON.parse(JSON.stringify(APP_CONFIG.USER_ROLES))
      } else if ( user.roles.indexOf('admin') >= 0 ) {
        user.granted_roles = JSON.parse(JSON.stringify(APP_CONFIG.USER_ROLES))
        user.granted_roles.indexOf('super-admin') >= 0 && user.granted_roles.splice(user.granted_roles.indexOf('super-admin'), 1)
      } else if ( user.roles.indexOf('moderator') >= 0 ) {
        user.granted_roles = JSON.parse(JSON.stringify(APP_CONFIG.USER_ROLES))
        user.granted_roles.indexOf('super-admin') >= 0 && user.granted_roles.splice(user.granted_roles.indexOf('super-admin'), 1)
        user.granted_roles.indexOf('admin') >= 0 && user.granted_roles.splice(user.granted_roles.indexOf('admin'), 1)
      }

      return res.sendJSON(user)
    } else {
      return res.sendJSON(null, 404)
    }
  },

  prepareUserObject( raw )
  {
    raw.id = +raw.id
    raw.registered = +raw.registered
    raw.roles = (raw.roles||'').split(',').map(r => r.trim()).filter(Boolean).filter(x => APP_CONFIG.USER_ROLES.indexOf(x) >= 0)

    return raw
  },

  async getUserBy(field, value)
  {
    const pg = await DB_OBJECT.getClient()

    try {
      const query = await pg.query(`SELECT * from users where ${String(field).replace(/[^a-zA-Z0-9_]/g, '')} = $1 limit 1`, [ value ])

      if ( query.rows && query.rows[0] && query.rows[0].id ) {
        return this.prepareUserObject( query.rows[0] )
      }
    } catch (e) {}
  },

  async updateUser(user)
  {
    const pg = await DB_OBJECT.getClient()

    let { id } = user
      , fields = user

    delete fields['id']

    if ( 'roles' in fields && Array.isArray(fields['roles']) ) {
      fields['roles'] = this.prepareUserObject(fields).roles.join(',')
    }

    try {
      const query = await pg.query(
        `UPDATE users set ${Object.keys(fields).map( (f, i) => `${f} = $${i+1}` ).join(', ')} where id = $${Object.keys(fields).length+1} returning id`,
        [ ... Object.values(fields), id ])
  
      if ( query.rows[0] && query.rows[0].id ) {
        return true
      } else {
        return false
      }
    } catch ( err ) {
      console.error('SQL update user ended with an error', err.stack)
    }
  },

  async insertUser(user)
  {
    const pg = await DB_OBJECT.getClient()

    delete user['id']

    if ( 'roles' in user && Array.isArray(user['roles']) ) {
      user['roles'] = this.prepareUserObject(user).roles.join(',')
    }

    try {
      const query = await pg.query(
        `insert into users (${Object.keys(user).join(', ')}) values (${Object.keys(user).map((k,i) => `$${i+1}`).join(', ')}) returning id`,
        [ ... Object.values(user) ])
  
      if ( query.rows[0] && query.rows[0].id ) {
        return query.rows[0].id
      } else {
        return false
      }
    } catch ( err ) {
      console.error('SQL update user ended with an error', err.stack)
    }
  },

  async getCurrentUser( req, skip_globals=false )
  {
    const auth_cookie = APP_UTIL.getCookie( req, {}, 'auth' )

    if ( ! auth_cookie )
      return

    let payload

    try {
      payload = require('jsonwebtoken').verify(auth_cookie, require('fs').readFileSync(`${__dirname}/../pem/auth_rsa.pub`, 'utf8'), {
        algorithm: 'RS256'
      })
    } catch (e) {/*pass*/}

    if ( ! payload || 'object' !== typeof payload || ! payload.key )
      return

    let user = await this.getUserBy( 'auth_key', payload.key )

    return user && user.id ? user : null
  },

  async httpLogin( req, res )
  {
    let { login: email, password, remember } = req.parsedQuery

    email = (email||'').trim()
    remember = 'true' == (remember||'').toLowerCase()

    let errors = []

    if ( ! email ) {
      errors.push({field: 'login', error: 'Please enter an email address.'})
    } else if ( ! APP_UTIL.is_email(email) ) {
      errors.push({field: 'login', error: 'Please enter a valid email address.'})
    }

    if ( ! password ) {
      errors.push({field: 'password', error: 'Please enter your password.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const user = await this.getUserBy('email', email)

    if ( ! user || ! user.id ) {
      errors = [ {error: 'Invalid account credentials.'} ]
      return res.sendJSON({ success: false, errors })
    }

    // hash password
    let compare = await require('bcryptjs').compare( password, user.password ), jwt_token

    if ( compare ) {

      if ( ! user.auth_key ) {
        let auth_key = await APP_UTIL.getRandomKey(20)
        await this.updateUser( { id: user.id, auth_key } ) && (user.auth_key=auth_key)
      }

      if ( user.auth_key ) {
        try {
          jwt_token = require('jsonwebtoken').sign({key: user.auth_key}, require('fs').readFileSync(`${__dirname}/../pem/auth_rsa`, 'utf8'), {
            expiresIn: remember ? '15d' : '1d',
            algorithm: 'RS256'
          })
        } catch (e) { /* pass */ }
      }

      if ( jwt_token ) {
        APP_UTIL.setCookie( req, res, 'auth', jwt_token, { signed: true, expires_seconds: remember ? 15 *86400 : null } )
        return res.sendJSON({ success: true })
      }

      // fallback
      return res.sendJSON({ success: false, errors: [ {error: 'Internal server error. Could not sign you in. Please try again or let us know.'} ] })
    } else {
      return res.sendJSON({ success: false, errors: [ {error: 'Invalid account credentials.'} ] })
    }
  },

  async httpLogout( req, res )
  {
    const user = await this.getCurrentUser( req )

    // purge session
    if ( req.parsedQuery.reauth && user && user.auth_key ) {
      await this.updateUser( { id: user.id, auth_key: null } )
    }

    APP_UTIL.setCookie( req, res, 'auth', ' ', { signed: true, delete: true } )

    return res.sendJSON({ success: true })
  },

  async httpLostPassword( req, res )
  {
    let { email } = req.parsedQuery

    email = (email||'').trim()

    let errors = []

    if ( ! email ) {
      errors.push({field: 'email', error: 'Please enter your email address.'})
    }

    if ( ! email ) {
      errors.push({field: 'email', error: 'Please enter an email address.'})
    } else if ( ! APP_UTIL.is_email(email) ) {
      errors.push({field: 'email', error: 'Please enter a valid email address.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const user = await this.getUserBy('email', email)

    if ( ! user || ! user.id ) {
      errors = [ {error: 'We could not find that account.', field: 'email'} ]
      return res.sendJSON({ success: false, errors })
    }

    let token = await APP_UTIL.getRandomKey(30)
      , expires = +new Date + APP_CONFIG.PASSWORD_RESET_TOKEN_TTL

    if ( await this.updateUser( { id: user.id, reset_token: `${token}:${expires}` } ) ) {
      let body = APP_CONFIG.PASSWORD_RESET_BODY

      for ( let key in user ) {
        body = body.replace( new RegExp(`{user.${key}}`, 'g'), user[key] || 'user' )
      }

      body = body.replace(/\{link\}/g, APP_UTIL.url( `/reset-password/${token}i${user.id}` ))

      APP_UTIL.mail( user.email, APP_CONFIG.PASSWORD_RESET_SUBJECT, body, APP_CONFIG.PASSWORD_RESET_BODY_HTML ? 'html' : null )

      return res.sendJSON({ success: true })
    } else {
      return res.sendJSON({ success: false, errors: [ {error: 'Internal server error. Please try again or let us know.'} ] })
    }
  },

  async httpPasswordReset( req, res )
  {
    const { token: hash, password, first_name, last_name } = req.parsedQuery
        , token = hash.replace(/i\d+$/g, '')
        , user_id = +hash.replace(/.+i(?=\d+$)/g, '')

    if ( 30 !== String(token).length || ! +user_id )
      return res.sendJSON({ success: false })

    const user = await this.getUserBy('id', user_id)
        , include_fields = []

    if ( ! user || ! user.id )
      return res.sendJSON({ success: false })

    let [ user_token, expires ] = (user.reset_token||'').split(':')

    if ( user_token !== token || +expires <= 0 )
      return res.sendJSON({ success: false })

    user.first_name || include_fields.push('first_name')
    user.last_name || include_fields.push('last_name')
    String(user.password).length <= 20 && include_fields.push('tos')

    if ( +expires - +new Date < 0 ) {
      return res.sendJSON({ success: false })
    } else if ( ! ( 'password' in req.parsedQuery ) ) {
      return res.sendJSON({ success: true, include_fields })      
    }

    let errors = []

    if ( ! password ) {
      errors.push({field: 'password', error: 'Please enter your password.'})
    } else if ( password.length < 6 ) {      
      errors.push({field: 'password', error: 'Please enter a valid password.'})
    }

    if ( include_fields.indexOf('first_name') >= 0 && ! first_name ) {
      errors.push({field: 'first_name', error: 'Please enter a first name.'})
    }

    if ( include_fields.indexOf('last_name') >= 0 && ! last_name ) {
      errors.push({field: 'last_name', error: 'Please enter a last name.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    // hash password
    const bcrypt = require('bcryptjs')
    let password_hash = await bcrypt.hash( password, 10 )

    if ( ! password_hash || password_hash.length <= 20 ) {
      return res.sendJSON({ success: false, errors: [ {error: 'Internal server error'} ] })
    }

    let others = {
      ...( first_name && include_fields.indexOf('first_name') >= 0 ? { first_name } : {} ),
      ...( last_name && include_fields.indexOf('last_name') >= 0 ? { last_name } : {} ),
    }

    if ( await this.updateUser({ id: user.id, password: password_hash, auth_key: null, reset_token: null, ...others }) ) {
      let body = APP_CONFIG.PASSWORD_CHANGE_NOTICE_BODY

      for ( let key in user ) {
        body = body.replace( new RegExp(`{user.${key}}`, 'g'), user[key] )
      }

      body && APP_UTIL.mail( user.email, APP_CONFIG.PASSWORD_CHANGE_NOTICE_SUBJECT, body, APP_CONFIG.PASSWORD_CHANGE_NOTICE_BODY_HTML ? 'html' : null )

      return res.sendJSON({ success: true })
    } else {
      return res.sendJSON({ success: false, errors: [ {error: 'Internal server error'} ] })
    }
  },

  async httpProfileEdit( req, res )
  {
    const user = await this.getCurrentUser( req )

    if ( ! user || ! user.id )
      return res.sendJSON({ success: false, errors: [ {error: 'Unauthenticated.'} ] })

    let update = {
      ... ( 'first_name' in req.parsedQuery ? { first_name: req.parsedQuery['first_name'] } : {} ),
      ... ( 'last_name' in req.parsedQuery ? { last_name: req.parsedQuery['last_name'] } : {} ),
      ... ( 'email' in req.parsedQuery ? { email: req.parsedQuery['email'] } : {} ),
      ... ( 'password' in req.parsedQuery ? { password: req.parsedQuery['password'] } : {} ),
    }, errors = []

    let { first_name, last_name, email, password } = update

    if ( 'first_name' in update && ! first_name ) {
      errors.push({field: 'first_name', error: 'Please enter a first name.'})
    }

    if ( 'last_name' in update && ! last_name ) {
      errors.push({field: 'last_name', error: 'Please enter a last name.'})
    }

    if ( 'email' in update && ! email ) {
      errors.push({field: 'email', error: 'Please enter an email address.'})
    } else if ( 'email' in update && ! APP_UTIL.is_email(email) ) {
      errors.push({field: 'email', error: 'Please enter a valid email address.'})
    }

    if ( 'password' in update && ! password ) {
      errors.push({field: 'password', error: 'Please enter your password.'})
    } else if ( 'password' in update && password.length < 6 ) {      
      errors.push({field: 'password', error: 'Please enter a valid password.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    for ( let k in update ) {
      if ( 'password' == k ) {
        update[k] = await require('bcryptjs').hash( update[k], 10 )
      }

      update[k] === user[k] && (delete update[k])
    }

    if ( Object.keys(update).length > 0 ) {
      if ( await this.updateUser({ id: user.id, ... update }) ) {
        return await this.httpCurrentUser(req, res)
      } else {
        return res.sendJSON({ success: false, errors: [ {error: 'Internal server error'} ] })
      }
    } else {
      return res.sendJSON({ success: true })
    }
  },

  async cliMaybeRegisterFirstSuperAdmin()
  {
    if ( ! process.env.SUPER_ADMIN_EMAIL || ! APP_UTIL.is_email(process.env.SUPER_ADMIN_EMAIL) )
      return console.log( 'api/users#cliMaybeRegisterFirstSuperAdmin: no valid ENV SUPER_ADMIN_EMAIL supplied' )

    if ( ! process.env.SUPER_ADMIN_PASSWORD )
      return console.log( 'api/users#cliMaybeRegisterFirstSuperAdmin: no valid ENV SUPER_ADMIN_PASSWORD supplied' )
    
    // verify email existance
    if ( await this.getUserBy('email', process.env.SUPER_ADMIN_EMAIL) )
      return console.log( 'api/users#cliMaybeRegisterFirstSuperAdmin: a user account already exists for this email' )

    let user_id = await this.insertUser({
      email: process.env.SUPER_ADMIN_EMAIL,
      first_name: process.env.SUPER_ADMIN_FNAME || 'John',
      last_name: process.env.SUPER_ADMIN_LNAME || 'Smith',
      // hash user password, or set as null to force a password-reset
      password: process.env.SUPER_ADMIN_PASSWORD ? await require('bcryptjs').hash( process.env.SUPER_ADMIN_PASSWORD, 10 ) : null,
      registered: +new Date,
      roles: 'super-admin'
    })

    console.log(`api/users#cliMaybeRegisterFirstSuperAdmin: task status: ${user_id ? `OK, id=${user_id}` : 'Error'}`)
  },

  async permissionsCheckSuperAdmin( req, res, then )
  {
    const user = await require('./users').getCurrentUser( req )

    if ( user && user.roles && user.roles.indexOf('super-admin') >= 0 )
      return then(req, res, user)

    return res.sendJSON(null, 403)
  },

  async httpManageCreate(req, res)
  {
    let { first_name, last_name, email, password, role } = req.parsedQuery

    first_name = (first_name||'').trim()
    last_name = (last_name||'').trim()
    email = (email||'').trim()

    let errors = []

    if ( ! first_name ) {
      errors.push({field: 'first_name', error: 'Please enter a first name.'})
    }

    if ( ! last_name ) {
      errors.push({field: 'last_name', error: 'Please enter a last name.'})
    }

    if ( ! email ) {
      errors.push({field: 'email', error: 'Please enter an email address.'})
    } else if ( ! APP_UTIL.is_email(email) ) {
      errors.push({field: 'email', error: 'Please enter a valid email address.'})
    }

    if ( password && password.length < 6 ) {      
      errors.push({field: 'password', error: 'Please enter a valid password.'})
    }

    if ( ! role || APP_CONFIG.USER_ROLES.indexOf(role) < 0 ) {
      errors.push({field: 'role', error: 'Please select a user role.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    const pg = await DB_OBJECT.getClient()

    // check if email exists
    const query = await pg.query('SELECT count(id) from users where email = $1 limit 1', [ email ])

    if ( query.rows && query.rows[0] && query.rows[0].count > 0 ) {
      errors = [ {field: 'email', error: 'This email is already registered.'} ]
      return res.sendJSON({ success: false, errors })
    }

    // hash password
    const bcrypt = require('bcryptjs')
    let password_plain = password || (password=bcrypt.genSaltSync(10).replace(/[^a-z0-9]/gi, '').slice(-15))
      , password_hash = await bcrypt.hash( password, 10 )

    if ( ! password_hash || password_hash.length <= 20 ) {
      return res.sendJSON({ success: false, errors: [ {error: 'Internal server error'} ] })
    }

    // insert
    try {
      const query = await pg.query(`insert into users (email, first_name, last_name, password, registered, roles) values ($1, $2, $3, $4, $5, $6) returning id`,
        [email, first_name, last_name, password_hash, +new Date, role])
      
      if ( query.rows[0] && query.rows[0].id ) {
        let body = APP_CONFIG.USER_WELCOME_EMAIL_BODY, user = { first_name, last_name, email, role, password: password_plain }

        for ( let key in user ) {
          body = body.replace( new RegExp(`{user.${key}}`, 'g'), user[key] || 'user' )
        }

        body = body.replace(/\{login_link\}/g, APP_UTIL.url('/login'))
        body = body.replace(/\{dashboard_link\}/g, APP_UTIL.url('/login'))

        APP_UTIL.mail( user.email, APP_CONFIG.USER_WELCOME_EMAIL_SUBJECT, body, APP_CONFIG.USER_WELCOME_EMAIL_BODY_HTML ? 'html' : null )

        return this.httpManageList(req, res)
      }
    } catch( err ) {
      console.error('SQL insert user ended with an error', err.stack)
    }

    errors = [{error: 'Internal server error, could not insert user.'}]

    res.sendJSON({ success: false, errors })
  },

  async httpManageList(req, res)
  {
    const pg = await DB_OBJECT.getClient()

    try {
      const query = await pg.query('SELECT * from users')

      if ( query.rows && query.rows.length ) {
        return res.sendJSON(query.rows.map(this.prepareUserObject))
      }
    } catch (e) {}

    return res.sendJSON(null, 500)
  },

  async httpManageDelete(req, res, current_user)
  {
    let { id } = req.parsedQuery, user, errors = []

    if ( isNaN(+id) || +id <= 0 || ! (user=await this.getUserBy('id', +id)) ) {
      errors.push({field: 'general', error: 'Could not find a member associated with this id.'})
      return res.sendJSON({ success: false, errors })
    } else if ( user.id == current_user.id ) {
      errors.push({field: 'general', error: 'You cannot delete your own account.'})
      return res.sendJSON({ success: false, errors })
    }

    try {
      const pg = await DB_OBJECT.getClient()
      await pg.query(`delete from users where id = $1`, [user.id])
      return this.httpManageList(req, res)
    } catch (e) {}

    return res.sendJSON({ success: false, errors: [{error: 'Internal server error, could not update user.'}] })
  },

  async httpManageUpdate(req, res)
  {
    let { first_name, last_name, email, password, role, id } = req.parsedQuery, user

    first_name = (first_name||'').trim()
    last_name = (last_name||'').trim()
    email = (email||'').trim()

    let errors = []

    if ( isNaN(+id) || +id <= 0 || ! (user=this.getUserBy('id', +id)) ) {
      errors.push({field: 'general', error: 'Could not find a member associated with this id.'})
      return res.sendJSON({ success: false, errors })
    }

    if ( req.parsedQuery.purge_sessions ) {
      if ( await this.updateUser({ id: +id, auth_key: null }) ) {
        return this.httpManageList(req, res)
      } else {
        return res.sendJSON({ success: false, errors: [{error: 'Internal server error, could not purge sessions.'}] })
      }
    }

    if ( ! first_name ) {
      errors.push({field: 'first_name', error: 'Please enter a first name.'})
    }

    if ( ! last_name ) {
      errors.push({field: 'last_name', error: 'Please enter a last name.'})
    }

    if ( ! email ) {
      errors.push({field: 'email', error: 'Please enter an email address.'})
    } else if ( ! APP_UTIL.is_email(email) ) {
      errors.push({field: 'email', error: 'Please enter a valid email address.'})
    }

    if ( password && password.length < 6 ) {      
      errors.push({field: 'password', error: 'Please enter a valid password.'})
    }

    if ( ! role || APP_CONFIG.USER_ROLES.indexOf(role) < 0 ) {
      errors.push({field: 'role', error: 'Please select a user role.'})
    }

    if ( Object.keys(errors).length ) {
      return res.sendJSON({ success: false, errors })
    }

    // check if email exists
    let pre
    if ( (pre=await this.getUserBy('email', email)) && +pre.id !== +id ) {
      errors = [ {field: 'email', error: 'This email is already registered.'} ]
      return res.sendJSON({ success: false, errors })
    }

    if ( password ) {
      // hash password
      password = await require('bcryptjs').hash( password, 10 )

      if ( ! password || password.length <= 20 ) {
        return res.sendJSON({ success: false, errors: [ {error: 'Internal server error'} ] })
      }
    }

    let updated = await this.updateUser({
      id: +id,
      first_name,
      last_name,
      email,
      ... ( password ? { password } : null ),
      ... ( (user.roles||[]).indexOf('super-admin') < 0 ? {roles: role} : null ),
    })

    if ( updated ) {
      return this.httpManageList(req, res)
    } else {
      return res.sendJSON({ success: false, errors: [{error: 'Internal server error, could not update user.'}] })
    }
  },
}

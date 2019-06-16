module.exports = {
  is_email(email)
  {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
  },

  async getRandomKey( length=20, bits=32 )
  {
    return new Promise((res, rej) =>
    {
      require('crypto').randomBytes(bits, (err, buffer) =>
      {
        return err ? rej(err) : res( buffer.toString('hex').substr(0, length) )
      })
    })
  },

  setCookie( req, res, name, value, settings={} )
  {
    const Cookies = require('cookies')
        , cookies = new Cookies( req, res, { keys: [APP_CONFIG.COOKIES_SALT] } )
        , options = {path: settings.path || '/api'}

    if ( 'delete' in settings && settings.delete ) {
      settings.expires_seconds = -31556926 // -1 year
      value = ' '
    }

    if ( settings.expires_seconds && 'number' == typeof settings.expires_seconds ) {
      options.expires = new Date(+new Date + settings.expires_seconds*1000)
    }

    return cookies.set( name, String(value), options, { signed: Boolean(settings.signed) } )
  },

  getCookie( req, res, name, settings={} )
  {
    const Cookies = require('cookies')
        , cookies = new Cookies( req, res, { keys: [APP_CONFIG.COOKIES_SALT] } )

    return cookies.get( name, { signed: Boolean(settings.signed) } )
  },

  getCurrentUser(req, skip_globals=false)
  {
    return require('./users').getCurrentUser( req, skip_globals )
  },

  async isUserLoggedIn(req)
  {
    return Boolean((await this.getCurrentUser(req)||{}).id)
  },

  async mail( to, subject, body, body_key='text' )
  {
    const transporter = require('nodemailer').createTransport(APP_CONFIG.SMTP)

    try {
      return await transporter.sendMail(Object.assign(APP_CONFIG.MAIL_DEFAULTS||{}, {
        to, subject, [body_key||'text']: body,
      }))
    } catch ( err ) {
      console.log('Error sending mail:', err)
    }
  },

  url( path, base=APP_CONFIG.SITE_URL )
  {
    return `${base.replace(/\/{1,}$/g, '')}/${path.replace(/^\/{1,}/g, '')}`
  },

  fireStoreSimple:
  {
    _client: undefined,

    getClient()
    {
      if ( this._client )
        return this._client

      const { Firestore } = require('@google-cloud/firestore')

      return this._client = new Firestore()
    },

    async get( docId )
    {
      const doc = this.getClient().doc( docId )

      try {
        return (await doc.get()).data()
      } catch(e) { /* pass */ }
    },

    async set( docId, data )
    {
      const doc = this.getClient().doc( docId )

      try {
        return await doc.set( data )
      } catch(e) { /* pass */ }
    },

    async update( docId, data )
    {
      const doc = this.getClient().doc( docId )

      try {
        return await doc.update( data )
      } catch(e) { /* pass */ }
    },

    async delete( docId )
    {
      const doc = this.getClient().doc( docId )

      try {
        return await doc.delete()
      } catch(e) { /* pass */ }
    }
  },

  initFirebaseApp()
  {
    const admin = require('firebase-admin')
    admin.apps.length || admin.initializeApp({
      credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      storageBucket: 'agadir-et-moi.appspot.com',
      databaseURL: 'https://agadir-et-moi.firebaseio.com',
    })
    return admin
  }
}
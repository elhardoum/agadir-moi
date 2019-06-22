const http = require('http'), server = http.createServer(async (req, res) =>
{
  const url = require('url')
      , querystring = require('querystring')
      , parsed = url.parse(req.url)

  parsed.pathname = parsed.pathname.replace(/^\/{1,}/g, '/').replace(/\/{1,}$/g, '')

  if ( parsed.pathname.startsWith('/api') ) {
    const request_name = `${req.method.toUpperCase()} ${parsed.pathname.replace(/^\/?api\/?/g, '')}`
        , default_callback = _ => ((res.statusCode=404), res.end())

    req.parsedQuery = querystring.parse(parsed.query)

    if ( 'GET' !== req.method ) {
      let post = await new Promise(res =>
      {
        let body = ''
        req.on('data', data =>
        {
          body += data
          body.length > 1e6 && req.connection.destroy()
        })
        req.on('end', _ => res( querystring.parse(body) ))
      })

      req.parsedQuery = Object.assign( req.parsedQuery, post )
    }

    // helpers
    res.sendJSON = (stack, status=200) =>
    {
      res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'})
      return res.end( 'string' == typeof stack ? stack : JSON.stringify( stack ) )
    }

    // globals
    global.APP_CONFIG = require('./src/api/config')
    global.APP_UTIL = require('./src/api/util')
    global.DB_OBJECT = require('./src/api/db')

    switch ( request_name ) {
      case 'GET auth':
      case 'POST auth':
      case 'DELETE auth':
      case 'POST auth/lost-password':
      case 'POST auth/profile-edit':
      case 'POST users/password-reset':
      case 'PUT users/manage':
      case 'POST users/manage':
      case 'GET users/manage':
      case 'DELETE users/manage':
      case 'PATCH users/manage':
        return require('./src/api/users').http( request_name, req, res, default_callback )
      
      case 'PUT phones':
      case 'POST phones':
      case 'GET phones':
      case 'DELETE phones':
      case 'PATCH phones':
        const phones = require('./src/api/phones')
        return (new phones).http( request_name, req, res, default_callback )

      case 'PUT storage/images':
      case 'GET storage/images':
      case 'DELETE storage/images':
        return require('./src/api/storage').http( request_name, req, res, default_callback )

      case 'PUT news':
      case 'POST news':
      case 'PATCH news':
      case 'GET news':
      case 'DELETE news':
      case 'GET news/categories':
      case 'GET news/item':
        const news = require('./src/api/news')
        return (new news).http( request_name, req, res, default_callback )

      case 'PUT events':
      case 'POST events':
      case 'PATCH events':
      case 'GET events':
      case 'DELETE events':
      case 'GET events/categories':
      case 'GET events/item':
        const events = require('./src/api/events')
        return (new events).http( request_name, req, res, default_callback )

      default:
        return default_callback()
    }
  } else { // serve static assets
    let whitelist_paths = ['/favicon.ico', '/index.html', '/bundle.js', '/assets']

    if ( whitelist_paths.filter( path => parsed.pathname.toLowerCase().startsWith( path ) ).length == 0 ) {
      req.url = '/'
    }

    return require('serve-static')
      ('./src/web/public', {'index': ['index.html', 'index.htm']})(req, res, require('finalhandler')(req, res))
  }
})

server.listen(process.env.PORT||9090, process.env.HOST||'0.0.0.0', _ =>
  console.log(`Server running at http://${process.env.HOST||'0.0.0.0'}:${process.env.PORT||9090}/`))

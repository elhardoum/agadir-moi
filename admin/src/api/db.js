module.exports = {
  client: null,

  newClient()
  {
    return new Promise((resolve, reject) =>
    {
      const { Pool } = require('pg'), pool = new Pool( APP_CONFIG.PG_CONNECTION_URI )

      pool.on('error', (err, client) =>
      {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
      })

      pool.connect((err, client, done) => {
        if (err) throw err
        resolve( client )
      })
    })
  },

  async getClient()
  {
    if ( ! this.client ) {
      let client = await this.newClient()
      if ( ! client._connected ) {
        throw new Error( 'Could not establish a database connection' )
      }

      this.client = client
    }

    return this.client
  },

  async disconnect()
  {
    this.client && this.client._connected && (await this.client.end())
  }
}
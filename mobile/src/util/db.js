import Realm from 'realm'

export const MetaLocalSchema = {
  name: 'MetaLocal',
  primaryKey: '_id',
  properties: {
    _id: 'int',
    events_updated: 'int?',
    phones_updated: 'int?',
    news_updated: 'int?',
    updated: 'int?',
  }
}

export const MetaRemoteSchema = {
  name: 'MetaRemote',
  primaryKey: '_id',
  properties: {
    _id: 'int',
    events_updated: 'int?',
    phones_updated: 'int?',
    news_updated: 'int?',
  }
}

export const PhonesSchema = {
  name: 'Phones',
  primaryKey: 'id',
  properties: {
    id: 'int',
    category: 'string?',
    group: 'string?',
    number: 'string?',
  }
}

export const NewsSchema = {
  name: 'News',
  primaryKey: 'id',
  properties: {
    id: 'int',
    category: 'string?',
    content: 'string?',
    title: 'string?',
    timeCreated: 'int?',
    timeUpdated: 'int?',
    images: {
      type: 'list', objectType: 'string'
    },
    originId: 'int',
  }
}

export const EventsSchema = {
  name: 'Events',
  primaryKey: 'id',
  properties: {
    id: 'int',
    category: 'string?',
    content: 'string?',
    title: 'string?',
    location: 'string?',
    timeCreated: 'int?',
    timeUpdated: 'int?',
    images: {
      type: 'list', objectType: 'string'
    },
    date_from: 'int?',
    date_to: 'int?',
    originId: 'int',
  }
}

export default class db
{
  constructor(path)
  {
    this.path = path
    this.metadata = new MetaData(this)
    this.phones = new Phones(this)
    this.news = new News(this)
    this.events = new Events(this)
  }

  open()
  {
    return Realm.open({ ...( this.path && { path: this.path } ), schema: [
      MetaLocalSchema, MetaRemoteSchema, PhonesSchema, NewsSchema, EventsSchema
    ]})
  }
}

class MetaData
{
  constructor(db)
  {
    this.db = db
  }

  getLocal(...args)
  {
    return this.getType(...args, MetaLocalSchema)
  }

  setLocal(...args)
  {
    return this.setType(...args, MetaLocalSchema)
  }

  getRemote(...args)
  {
    return this.getType(...args, MetaRemoteSchema)
  }

  setRemote(...args)
  {
    return this.setType(...args, MetaRemoteSchema)
  }

  getType(schema)
  {
    return this.db.open().then(realm =>
    {
      let res = realm.objects(schema.name).filtered('_id=1')
      return res[0] && '_id' in res[0] ? objPluck(res[0]) : undefined
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  setType( data, schema )
  {
    return new Promise((resolve, reject) => this.db.open().then(realm =>
    {
      realm.write(_ =>
      {
        for ( let key in data ) { // filter out unwanted data
          key in schema.properties || (delete data[key])
        }

        let model = realm.create(schema.name, {
          _id: 1, ...data
        }, true)

        return resolve(objPluck(model))
      })
    }).catch(err => reject(err)))
  }
}

class Phones
{
  constructor(db)
  {
    this.db = db
  }

  getAll()
  {
    return this.db.open().then(realm =>
    {
      let res = realm.objects(PhonesSchema.name)
        , list = []

      for ( let i=0; i<res.length; i++ ) {
        list.push( objPluck(res[i]) )
      }

      return list
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  persistList( data )
  {
    return new Promise((resolve, reject) => this.db.open().then(realm =>
    {
      realm.write(async _ =>
      {
        const phones = realm.objects(PhonesSchema.name), saved = [], deleted = []

        for ( let i=0; i<phones.length; i++ ) {
          saved.push( objPluck(phones[i]) )

          if ( ! ( saved[ saved.length -1 ].id in data ) ) {
            deleted.push(phones[i])
          }
        }

        for ( let id in data ) {
          for ( let key in data[id] ) { // filter out unwanted data
            key in PhonesSchema.properties || (delete data[id][key])
          }

          realm.create(PhonesSchema.name, data[id], true)
        }

        // purge deleted items
        deleted.length && realm.delete(deleted)

        resolve(1)
      })
    }).catch(err => reject(err)))
  }
}

class News
{
  constructor(db)
  {
    this.db = db
  }

  getAll()
  {
    return this.db.open().then(realm =>
    {
      let res = realm.objects(NewsSchema.name)
        , list = []

      for ( let i=0; i<res.length; i++ ) {
        list.push( objPluck(res[i]) )
        list[list.length -1].images && (list[list.length -1].images=[...list[list.length-1].images])
      }

      return list
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  persistList( data )
  {
    return new Promise((resolve, reject) => this.db.open().then(realm =>
    {
      realm.write(async _ =>
      {
        const news = realm.objects(NewsSchema.name), saved = [], deleted = []

        for ( let i=0; i<news.length; i++ ) {
          saved.push( objPluck(news[i]) )

          if ( ! ( saved[ saved.length -1 ].id in data ) ) {
            deleted.push(news[i])
          }
        }

        for ( let id in data ) {
          data[id].originId = +id

          for ( let key in data[id] ) { // filter out unwanted data
            key in NewsSchema.properties || (delete data[id][key])
          }

          realm.create(NewsSchema.name, data[id], true)
        }

        // purge deleted items
        deleted.length && realm.delete(deleted)

        resolve(1)
      })
    }).catch(err => reject(err)))
  }
}

class Events
{
  constructor(db)
  {
    this.db = db
  }

  getAll()
  {
    return this.db.open().then(realm =>
    {
      let res = realm.objects(EventsSchema.name)
        , list = []

      for ( let i=0; i<res.length; i++ ) {
        let index = list.push( objPluck(res[i]) ) -1
        list[index].images && (list[index].images=[...list[index].images])
      }

      return list
    }).catch(err => (environ.dev && console.log('err', err), undefined))
  }

  parseApiData(data)
  {
    const parsed = {}

    for ( let id in data ) {
      if ( data[id].dates.length ) {
        data[id].originId = +id
        data[id].dates.map((pair,i) =>
        {
          let newId = +`${id}${i||''}`
          parsed[newId] = JSON.parse( JSON.stringify( data[id] ) )
          parsed[newId].date_from = pair[0]
          parsed[newId].date_to = pair[1]
          parsed[newId].id = newId
        })
      } else {
        parsed[id] = data[id]
      }
    }

    return parsed
  }

  persistList( data )
  {
    return new Promise((resolve, reject) => this.db.open().then(realm =>
    {
      realm.write(async _ =>
      {
        const news = realm.objects(EventsSchema.name), saved = [], deleted = []

        data = this.parseApiData( data )

        for ( let i=0; i<news.length; i++ ) {
          saved.push( objPluck(news[i]) )

          if ( ! ( saved[ saved.length -1 ].id in data ) ) {
            deleted.push(news[i])
          }
        }

        for ( let id in data ) {
          for ( let key in data[id] ) { // filter out unwanted data
            key in EventsSchema.properties || (delete data[id][key])
          }

          realm.create(EventsSchema.name, data[id], true)
        }

        // purge deleted items
        deleted.length && realm.delete(deleted)

        resolve(1)
      })
    }).catch(err => reject(err)))
  }
}

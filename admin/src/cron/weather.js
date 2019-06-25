module.exports = async _ =>
{
  const city_id = process.env.WEATHER_CITY_ID || 2561668

  require('node-fetch')(`http://api.openweathermap.org/data/2.5/forecast?id=${city_id}&APPID=${process.env.WEATHER_API_KEY}`)
    .then(res => res.json())
    .then(res =>
    {
      if ( 200 !== +res.cod ) {
        throw new Error(`HTTP (error) status code ${res.cod}`)
      } else if ( ! res.list || ! res.list.length ) {
        throw new Error('Responded with empty dataset')
      } else {
        return res
      }
    })
    .then(data =>
    {
      APP_UTIL.metadata.update({
        weather_data: data.list,
        weather_updated: +new Date,
      })

      console.log('weather saved!')
    }).catch(err => console.log('weather.cron error', err))
}
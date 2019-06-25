(async (crons, options) =>
{
  global.APP_CONFIG = require('./src/api/config')
  global.APP_UTIL = require('./src/api/util')

  const tasks = {}
  
  while ( true ) {
    for ( let i in crons ) {
      const task = crons[i]

      tasks[task.id] = tasks[task.id] || {}

      if ( ! tasks[task.id].last_run || +new Date - tasks[task.id].last_run > task.repeat_ms ) {
        // execute
        new Promise(res => task.callback()).catch(err => console.log(`Error executing cron#${task.id}: ${err}`))

        // record timestamp
        tasks[task.id].last_run = +new Date
      }
    }

    // some delay between checks
    await new Promise(res => setTimeout(res, options.requests_loop_delay_ms))
  }
})([
  {
    task: 'fetch-weather-api',
    repeat_ms: 1 *60 *60 *1000, // every 1 hour (although the weather is updated each 3 hours)
    callback: _ => require('./src/cron/weather')()
  }
], {
  requests_loop_delay_ms: 60 *1000, // 1 minute, simulating linux cron
})
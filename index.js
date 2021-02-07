'use strict'

const { promisify } = require('util')
const sleep = promisify(setTimeout)

function closeWithGrace (opts, fn) {
  const delay = opts.delay ? opts.delay : 10000
  process.once('SIGTERM', onSignal)
  process.once('SIGINT', onSignal)

  function onSignal (signal) {
    run({ signal })
    process.on('SIGTERM', afterFirst)
    process.on('SIGINT', afterFirst)
  }

  function afterFirst (signal) {
    console.error(`second ${signal}, exiting`)
    process.exit(1)
  }

  async function run (out) {
    try {
      await Promise.race([
        // We create the timer first as fn
        // might block the event loop
        sleep(delay),
        fn(out)
      ])
    } catch (err) {
      console.error(err)
    }
    process.exit(1)
  }
}

module.exports = closeWithGrace

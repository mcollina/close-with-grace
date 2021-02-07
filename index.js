'use strict'

const { promisify } = require('util')
const sleep = promisify(setTimeout)

function closeWithGrace (opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  const delay = opts.delay ? opts.delay : 10000
  process.once('SIGTERM', onSignal)
  process.once('SIGINT', onSignal)
  process.once('uncaughtException', onError)
  process.once('unhandledRejection', onError)

  function onSignal (signal) {
    run({ signal })
  }

  function afterFirstSignal (signal) {
    console.error(`second ${signal}, exiting`)
    process.exit(1)
  }

  function onError (err) {
    run({ err })
  }

  function afterFirstError (err) {
    console.error(`second error, exiting`)
    console.error(err)
    process.exit(1)
  }

  async function run (out) {
    process.on('SIGTERM', afterFirstSignal)
    process.on('SIGINT', afterFirstSignal)
    process.on('uncaughtException', afterFirstError)
    process.on('unhandledRejection', afterFirstError)

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

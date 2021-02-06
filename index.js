'use strict'

const { promisify } = require('util')
const sleep = promisify(setTimeout)

function closeWithGrace (opts, fn) {
  const delay = opts.delay ? opts.delay : 10000
  process.once('SIGTERM', onSignal)
  process.once('SIGINT', onSignal)

  function onSignal (signal) {
    run({ signal })
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
      console.log(err)
    }
    process.exit(1)
  }
}

module.exports = closeWithGrace

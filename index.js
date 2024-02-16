'use strict'

const { promisify } = require('util')
const sleep = promisify(setTimeout)

closeWithGrace.closing = false

function closeWithGrace (opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  const delay = opts.delay ? opts.delay : 10000
  const logger = opts.logger ? opts.logger : console
  process.once('SIGTERM', onSignal)
  process.once('SIGINT', onSignal)
  process.once('uncaughtException', onError)
  process.once('unhandledRejection', onError)

  const sleeped = Symbol('sleeped')

  return {
    close () {
      run({ manual: true })
    },
    uninstall () {
      process.removeListener('SIGTERM', onSignal)
      process.removeListener('SIGINT', onSignal)
      process.removeListener('uncaughtException', onError)
      process.removeListener('unhandledRejection', onError)
    }
  }

  function onSignal (signal) {
    run({ signal })
  }

  function afterFirstSignal (signal) {
    logger.error(`second ${signal}, exiting`)
    process.exit(1)
  }

  function onError (err) {
    run({ err })
  }

  function afterFirstError (err) {
    logger.error('second error, exiting')
    logger.error(err)
    process.exit(1)
  }

  function exec (out) {
    const res = fn(out, done)

    if (res && typeof res.then === 'function') {
      return res
    }

    let _resolve
    let _reject

    const p = new Promise(function (resolve, reject) {
      _resolve = resolve
      _reject = reject
    })

    return p

    function done (err) {
      if (!_resolve) {
        return
      }

      if (err) {
        _reject(err)
        return
      }

      _resolve()
    }
  }

  async function run (out) {
    process.on('SIGTERM', afterFirstSignal)
    process.on('SIGINT', afterFirstSignal)
    process.on('uncaughtException', afterFirstError)
    process.on('unhandledRejection', afterFirstError)

    closeWithGrace.closing = true

    try {
      const res = await Promise.race([
        // We create the timer first as fn
        // might block the event loop
        sleep(delay, sleeped),
        exec(out)
      ])

      if (res === sleeped || out.err) {
        process.exit(1)
      } else {
        process.exit(0)
      }
    } catch (err) {
      logger.error(err)
      process.exit(1)
    }
  }
}

module.exports = closeWithGrace

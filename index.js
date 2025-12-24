'use strict'

const { signalEvents } = require('./events/signal.events')
const { errorEvents } = require('./events/error.events')
const { exitEvents } = require('./events/exit.events')

const { promisify } = require('node:util')
const sleep = promisify(setTimeout)

closeWithGrace.closing = false

function closeWithGrace (opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = {
    delay: 10000,
    logger: console,
    ...opts
  }

  const delay = typeof opts.delay === 'number' ? opts.delay : undefined
  const logger =
    typeof opts.logger === 'object' || typeof opts.logger === 'function'
      ? opts.logger
      : undefined

  const skip = Array.isArray(opts.skip) ? opts.skip : []

  const filteredSignalEvents = signalEvents.filter((event) => !skip.includes(event))
  const filteredErrorEvents = errorEvents.filter((event) => !skip.includes(event))
  const filteredExitEvents = exitEvents.filter((event) => !skip.includes(event))

  filteredSignalEvents.forEach((event) => process.once(event, onSignal))
  filteredErrorEvents.forEach((event) => process.once(event, onError))
  filteredExitEvents.forEach((event) => process.once(event, onNormalExit))

  const sleeped = Symbol('sleeped')

  return {
    close: () => run({ manual: true }),
    uninstall: cleanup
  }

  function cleanup () {
    filteredSignalEvents.forEach((event) => process.removeListener(event, onSignal))
    filteredErrorEvents.forEach((event) => process.removeListener(event, onError))
    filteredExitEvents.forEach((event) => process.removeListener(event, onNormalExit))
  }

  function onSignal (signal) {
    run({ signal })
  }

  function afterFirstSignal (signal) {
    if (typeof opts.onSecondSignal === 'function') {
      opts.onSecondSignal(signal)
    } else if (logger) {
      logger.error(`second ${signal}, exiting`)
    }

    process.exit(1)
  }

  function onError (err) {
    run({ err })
  }

  function afterFirstError (err) {
    if (typeof opts.onSecondError === 'function') {
      opts.onSecondError(err)
    } else if (logger) {
      logger.error('second error, exiting')
      logger.error(err)
    }

    process.exit(1)
  }

  function onNormalExit () {
    run({})
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
    cleanup()

    filteredSignalEvents.forEach((event) => process.on(event, afterFirstSignal))
    filteredErrorEvents.forEach((event) => process.on(event, afterFirstError))

    closeWithGrace.closing = true

    try {
      const res = await Promise.race([
        // We create the timer first as fn
        // might block the event loop
        ...(typeof delay === 'number' ? [sleep(delay, sleeped)] : []),
        exec(out)
      ])

      if (res === sleeped) {
        if (typeof opts.onTimeout === 'function') {
          opts.onTimeout(delay)
        } else if (logger) {
          logger.error(`killed by timeout (${delay}ms)`)
        }

        process.exit(1)
      } else if (out.err) {
        process.exit(1)
      } else {
        process.exit(0)
      }
    } catch (err) {
      if (logger) logger.error(err)
      process.exit(1)
    }
  }
}

module.exports = closeWithGrace

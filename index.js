'use strict'

function closeWithGrace (opts, fn) {

  process.on('SIGTERM', onSignal)

  function onSignal (signal) {
    fn({ signal }).then(next, next)
  }

  function next (err) {
    if (err) {
      console.error(err)
    }
    process.exit(1)
  }
}

module.exports = closeWithGrace

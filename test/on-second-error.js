'use strict'

const closeWithGrace = require('..')

function onSecondError (err) {
  console.error('onSecondError', err.message)
}

closeWithGrace({ onSecondError }, function ({ signal, err }) {
  process.nextTick(() => {
    throw new Error('kaboom')
  })
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

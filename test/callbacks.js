'use strict'

const closeWithGrace = require('..')

closeWithGrace({ delay: 500 }, function ({ signal, err }, cb) {
  if (signal) {
    console.log(signal)
  }
  setImmediate(() => {
    if (err) {
      console.log(err.message)
    }
    cb()
  })
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

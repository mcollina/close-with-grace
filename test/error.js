'use strict'

const closeWithGrace = require('..')

const customLogger = {
  error (message) {
    console.error(`[custom logger] ${message}`)
  }
}

closeWithGrace({ logger: customLogger }, function ({ signal, err }) {
  process.nextTick(() => {
    throw new Error('kaboom')
  })
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

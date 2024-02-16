'use strict'

const closeWithGrace = require('..')

const customLogger = {
  error (message) {
    console.error(`[custom logger] ${message}`)
  }
}

closeWithGrace({ delay: 500, logger: customLogger }, function ({ signal, err }) {
  console.log('fn called')
  // this promise never resolves, so the delay should kick in
  return new Promise(() => {})
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

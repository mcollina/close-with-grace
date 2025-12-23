'use strict'

const closeWithGrace = require('..')

closeWithGrace({ skip: ['uncaughtException'] }, async function ({ signal, err }) {
  console.log('callback called')
  if (err) {
    console.log(err.message)
  }
})

setTimeout(() => {
  throw new Error('kaboom')
}, 500)

// Keep the process alive
setInterval(() => {}, 1000)

console.error(process.pid)

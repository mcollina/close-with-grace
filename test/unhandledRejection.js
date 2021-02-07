'use strict'

const closeWithGrace = require('..')

closeWithGrace(async function ({ signal, err }) {
  console.log(err.message)
})

setTimeout(async () => {
  throw new Error('kaboom')
}, 500)
console.error(process.pid)

'use strict'

const { promisify } = require('node:util')
const closeWithGrace = require('..')

const immediate = promisify(setImmediate)

closeWithGrace(async function ({ signal, err }) {
  if (signal) {
    console.log(signal)
  }
  await immediate()
  if (err) {
    console.log(err.message)
  }
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

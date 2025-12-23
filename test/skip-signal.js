'use strict'

const closeWithGrace = require('..')

closeWithGrace({ skip: ['SIGTERM'], delay: 500 }, async function ({ signal, err }) {
  console.log('callback called')
  if (signal) {
    console.log(signal)
  }
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

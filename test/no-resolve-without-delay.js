'use strict'

const closeWithGrace = require('..')

closeWithGrace({ delay: undefined }, function ({ signal, err }) {
  console.log('fn called')
  // this promise never resolves
  // delay has falsy value
  // process can't be closed
  return new Promise(() => {})
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

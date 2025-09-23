'use strict'

const closeWithGrace = require('..')

function onTimeout (delay) {
  console.error('onTimeout', delay)
}

closeWithGrace({ delay: 500, onTimeout }, function ({ signal, err }) {
  console.log('fn called')
  // this promise never resolves, so the delay should kick in
  return new Promise(() => {})
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

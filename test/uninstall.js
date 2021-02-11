'use strict'

const closeWithGrace = require('..')

const { uninstall } = closeWithGrace(async function ({ manual }) {
  console.log('not called')
})

setInterval(() => {}, 500)
uninstall()
console.error(process.pid)

'use strict'

const closeWithGrace = require('..')

// Handle skipped events to prevent crashes
process.on('unhandledRejection', () => {})
process.on('uncaughtException', () => {})
process.on('SIGTERM', () => {})

closeWithGrace({ skip: ['unhandledRejection', 'uncaughtException', 'SIGTERM'], delay: 500 }, async function ({ signal, err }) {
  console.log('callback called')
})

// to keep the process open
setInterval(() => {}, 1000)
console.error(process.pid)

'use strict'

const closeWithGrace = require('..')
const assert = require('node:assert')

const { close } = closeWithGrace(async function ({ manual }) {
  assert.strictEqual(manual, true)
  console.log('close called')
})

setTimeout(close, 500)

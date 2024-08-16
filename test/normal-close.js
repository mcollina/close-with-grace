'use strict'

const closeWithGrace = require('..')

closeWithGrace(async () => console.log('close called'))
setTimeout(() => {}, 500)

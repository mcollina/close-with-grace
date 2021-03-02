'use strict'

const { createServer } = require('http')
const closeWithGrace = require('.')

const server = createServer(function (req, res) {
  if (closeWithGrace.closing) {
    res.statusCode = 503
    res.setHeader('Connection', 'close')
    res.end('try again later')
    return
  }
  res.end('hello world')
})

server.listen(3000)

closeWithGrace(function (opts, cb) {
  console.log(opts, 'server closing')
  server.close(cb)
})

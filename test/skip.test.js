'use strict'

const test = require('tape')
const { fork } = require('node:child_process')
const { join } = require('node:path')
const { once } = require('node:events')
const { promisify } = require('node:util')
const sleep = promisify(setTimeout)

const testCases = [
  { name: 'skip unhandledRejection', file: 'skip-unhandledRejection.js', wait: 1000 },
  { name: 'skip uncaughtException', file: 'skip-uncaughtException.js', wait: 1000 },
  { name: 'skip SIGTERM', file: 'skip-signal.js', wait: 500, signal: 'SIGTERM' },
  { name: 'skip multiple events', file: 'skip-multiple.js', wait: 500, signal: 'SIGTERM' }
]

testCases.forEach(({ name, file, wait, signal }) => {
  test(name, async (t) => {
    const child = fork(join(__dirname, file), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
    await once(child.stderr, 'readable')

    let stdout = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })

    if (signal) child.kill(signal)
    await sleep(wait)

    child.kill('SIGKILL')
    await once(child, 'close')

    t.doesNotMatch(stdout, /callback called/, 'callback should not be called')
  })
})

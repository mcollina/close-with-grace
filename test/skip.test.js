'use strict'

const test = require('tape')
const { fork } = require('node:child_process')
const { join } = require('node:path')
const { once } = require('node:events')
const { promisify } = require('node:util')
const sleep = promisify(setTimeout)

test('skip unhandledRejection does not trigger callback', async (t) => {
  const child = fork(join(__dirname, 'skip-unhandledRejection.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  await once(child.stderr, 'readable')
  t.pass('process started')

  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => { stdout += chunk })

  // Wait for unhandledRejection to occur
  await sleep(1000)

  // Force kill the child process
  child.kill('SIGKILL')
  await once(child, 'close')

  // Verify the callback was not called
  t.doesNotMatch(stdout, /callback called/, 'callback should not be called')
})

test('skip uncaughtException does not trigger callback', async (t) => {
  const child = fork(join(__dirname, 'skip-uncaughtException.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  await once(child.stderr, 'readable')
  t.pass('process started')

  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => { stdout += chunk })

  // Wait for uncaughtException to occur
  await sleep(1000)

  // Force kill the child process
  child.kill('SIGKILL')
  await once(child, 'close')

  // Verify the callback was not called
  t.doesNotMatch(stdout, /callback called/, 'callback should not be called')
})

test('skip SIGTERM does not trigger callback', async (t) => {
  const child = fork(join(__dirname, 'skip-signal.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  await once(child.stderr, 'readable')
  t.pass('process started')

  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => { stdout += chunk })

  // Send SIGTERM which should be ignored by close-with-grace
  child.kill('SIGTERM')

  // Wait a bit
  await sleep(500)

  // Force kill the child process
  child.kill('SIGKILL')
  await once(child, 'close')

  // Verify the callback was not called
  t.doesNotMatch(stdout, /callback called/, 'callback should not be called')
})

test('skip multiple events', async (t) => {
  const child = fork(join(__dirname, 'skip-multiple.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  await once(child.stderr, 'readable')
  t.pass('process started')

  let stdout = ''
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => { stdout += chunk })

  // Send SIGTERM which should be skipped
  child.kill('SIGTERM')

  await sleep(500)

  // Force kill the child process
  child.kill('SIGKILL')
  await once(child, 'close')

  // Verify the callback was not called
  t.doesNotMatch(stdout, /callback called/, 'callback should not be called')
})

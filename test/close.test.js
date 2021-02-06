'use strict'

const test = require('tape')
const { fork } = require('child_process')
const { join } = require('path')
const { once } = require('events')
const { promisify } = require('util')

const immediate = promisify(setImmediate)

async function all (stream) {
  stream.setEncoding('utf8')
  let data = ''
  for await (let chunk of stream) {
    data += chunk
  }
  return data
}

test('close abruptly after a timeout', async (t) => {
  const child = fork(join(__dirname, 'no-resolve.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const out = all(child.stdout)
  out.catch(() => {})

  child.kill('SIGTERM')
  const now = Date.now()

  const [code, signal] = await once(child, 'close')
  t.is(code, 1)
  t.is(signal, null)
  t.is(Date.now() - now >= 500, true)
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  test(`close gracefully (${signal})`, async (t) => {
    const child = fork(join(__dirname, 'simple.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    t.pass('readable emitted')

    const out = all(child.stdout)
    out.catch(() => {})

    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 1)
    t.is(signalOut, null)
    t.is(await out, signal + '\n')
  })

  test(`a secong signal (${signal}) close abruptly`, async (t) => {
    const child = fork(join(__dirname, 'no-resolve.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    t.pass('readable emitted')

    const now = Date.now()

    child.kill(signal)

    await once(child.stdout, 'readable')

    const out = all(child.stdout)
    out.catch(() => {})

    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, null)
    t.is(signalOut, signal)
    t.is(await out, 'fn called\n')
    t.is(Date.now() - now < 500, true)
  })
}

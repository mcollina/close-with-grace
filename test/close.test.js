'use strict'

const test = require('tape')
const { fork } = require('child_process')
const { join } = require('path')
const { once } = require('events')

async function all (stream) {
  stream.setEncoding('utf8')
  let data = ''
  for await (const chunk of stream) {
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
  test(`close gracefully (${signal}) async/await`, async (t) => {
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
    t.is(code, 0)
    t.is(signalOut, null)
    t.is(await out, signal + '\n')
  })

  test(`close gracefully (${signal}) callbacks`, async (t) => {
    const child = fork(join(__dirname, 'callbacks.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    t.pass('readable emitted')

    const out = all(child.stdout)
    out.catch(() => {})

    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 0)
    t.is(signalOut, null)
    t.is(await out, signal + '\n')
  })

  test(`no delay, close gracefully (${signal})`, async (t) => {
    const child = fork(join(__dirname, 'no-delay.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    t.pass('readable emitted')

    const out = all(child.stdout)
    out.catch(() => {})

    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 0)
    t.is(signalOut, null)
    t.is(await out, signal + '\n')
  })

  test(`a secong signal (${signal}) close abruptly`, async (t) => {
    const child = fork(join(__dirname, 'no-resolve.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    child.stderr.read()
    t.pass('readable emitted')

    const now = Date.now()

    child.kill(signal)

    await once(child.stdout, 'readable')

    const out = all(child.stdout)
    out.catch(() => {})

    const err = all(child.stderr)
    err.catch(() => {})

    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 1)
    t.is(signalOut, null)
    t.is(await out, 'fn called\n')
    t.is(await err, `second ${signal}, exiting\n`)
    t.is(Date.now() - now < 500, true)
  })

  test(`a secong signal (${signal}) calls custom logger`, async (t) => {
    const child = fork(join(__dirname, 'no-resolve-custom-logger.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    child.stderr.read()
    t.pass('readable emitted')

    child.kill(signal)

    await once(child.stdout, 'readable')

    const err = all(child.stderr)
    err.catch(() => {})

    child.kill(signal)

    t.is(await err, `[custom logger] second ${signal}, exiting\n`)
  })
}

for (const event of ['uncaughtException', 'unhandledRejection']) {
  test(`close gracefully (${event})`, async (t) => {
    const child = fork(join(__dirname, event + '.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    const out = all(child.stdout)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 1)
    t.is(signalOut, null)
    t.is(await out, 'kaboom\n')
  })
}

test('self close', async (t) => {
  const child = fork(join(__dirname, 'self-close.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  const out = all(child.stdout)
  out.catch(() => {})

  const [code] = await once(child, 'close')
  t.is(code, 0)
  t.is(await out, 'close called\n')
})

test('uninstall', async (t) => {
  const child = fork(join(__dirname, 'uninstall.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const out = all(child.stdout)
  out.catch(() => {})

  child.kill('SIGTERM')

  const [code, signal] = await once(child, 'close')
  t.is(code, null)
  t.is(signal, 'SIGTERM')
  t.is(await out, '')
})

test('closing state', async (t) => {
  const child = fork(join(__dirname, 'closing-state.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  const [code] = await once(child, 'close')
  t.is(code, 0)
})

'use strict'

const { signalEvents } = require('../events/signal.events')
const { errorEvents } = require('../events/error.events')
const test = require('tape')
const { fork } = require('node:child_process')
const { join } = require('node:path')
const { once } = require('node:events')
const { promisify } = require('node:util')
const sleep = promisify(setTimeout)

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

test('when closed by timeout with default logger should log error', async (t) => {
  const child = fork(join(__dirname, 'no-resolve.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)

  child.kill('SIGTERM')
  await once(child, 'close')

  t.match(await err, /killed by timeout/)
})

test('when closed by timeout with custom logger should log error', async (t) => {
  const child = fork(join(__dirname, 'no-resolve-custom-logger.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)

  child.kill('SIGTERM')
  await once(child, 'close')

  t.match(await err, /\[custom logger\] killed by timeout/)
})

test('when closed by timeout should use onTimeout callback', async (t) => {
  const child = fork(join(__dirname, 'on-timeout.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)

  child.kill('SIGTERM')
  await once(child, 'close')

  t.match(await err, /onTimeout 500/)
})

test('when closed by timeout without logger should NOT log error', async (t) => {
  const child = fork(join(__dirname, 'no-resolve-without-logger.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)

  child.kill('SIGTERM')
  await once(child, 'close')

  t.doesNotMatch(await err, /killed by timeout/)
})

for (const signal of signalEvents) {
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

  test(`default delay, close gracefully (${signal})`, async (t) => {
    const child = fork(join(__dirname, 'default-delay.js'), {
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

  test(`a secong signal (${signal}) close abruptly using onSecondSignal`, async (t) => {
    const child = fork(join(__dirname, 'on-second-signal.js'), {
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
    t.is(await err, `onSecondSignal ${signal}\n`)
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

  test(`a secong signal (${signal}) calls without logger`, async (t) => {
    const child = fork(join(__dirname, 'no-resolve-without-logger.js'), {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    })

    // one line to kickstart the test
    await once(child.stderr, 'readable')
    child.stderr.read()
    t.pass('readable emitted')

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
    t.is(await err, '')
  })

  test(`a secong signal (${signal}) calls without delay`, async (t) => {
    const child = fork(join(__dirname, 'no-resolve-without-delay.js'), {
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

    await sleep(550)
    child.kill(signal)

    const [code, signalOut] = await once(child, 'close')
    t.is(code, 1)
    t.is(signalOut, null)
    t.is(await out, 'fn called\n')
    t.is(await err, `second ${signal}, exiting\n`)
    t.is(Date.now() - now > 550 && Date.now() - now < 1000, true)
  })
}

for (const event of errorEvents) {
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

test('normal close', async (t) => {
  const child = fork(join(__dirname, 'normal-close.js'), {
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

test('when the function throws with custom logger should log error', async (t) => {
  const child = fork(join(__dirname, 'error.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)
  err.catch(() => {})

  child.kill('SIGTERM')

  const [code] = await once(child, 'close')
  t.is(code, 1)
  t.match(await err, /\[custom logger\] second error, exiting/)
})

test('when the function throws should use onSecondSignal', async (t) => {
  const child = fork(join(__dirname, 'on-second-error.js'), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  // one line to kickstart the test
  await once(child.stderr, 'readable')
  t.pass('readable emitted')

  const err = all(child.stderr)
  err.catch(() => {})

  child.kill('SIGTERM')

  const [code] = await once(child, 'close')
  t.is(code, 1)
  t.match(await err, /onSecondError kaboom/)
})

# close-with-grace

Exit your process, gracefully (if possible) - for Node.js

## Install

```
npm i close-with-grace
```

## Usage

```js
const closeWithGrace = require('close-with-grace')

// delay is the number of milliseconds for the graceful close to
// finish.
closeWithGrace({ delay: 500 }, async function ({ signal, err, manual }) {
  if (err) {
    console.error(err)
  }
  await closeYourServer()
})

// default delay is 10000
// to disable delay feature at all, pass falsy value to delay option.
closeWithGrace({ delay: false }, () => await somethingUseful())
```

### Injecting custom logger

```js
const closeWithGrace = require('close-with-grace')

// delay is the number of milliseconds for the graceful close to
// finish.
closeWithGrace(
  {
    delay: 500,
    logger: { error: (m) => console.error(`[close-with-grace] ${m}`) }
  },
  async function ({ signal, err, manual }) {
  if (err) {
    console.error(err)
  }
  await closeYourServer()
})

// default logger is console
// to disable logging at all, pass falsy value to logger option.
closeWithGrace({ logger: false }, () => await somethingUseful())
```

### Example with Fastify

```js
import fastify from 'fastify'
import closeWithGrace from 'close-with-grace'

const app = fastify()

closeWithGrace(async function ({ signal, err, manual }) {
  if (err) {
    app.log.error({ err }, 'server closing with error')
  } else {
    app.log.info(`${signal} received, server closing`)
  }
  await app.close()
})

await app.listen()
```

### Skipping specific events

You can skip specific events from triggering the graceful close callback. This is useful when you want to handle certain errors separately, such as with OTEL (OpenTelemetry) or other monitoring tools:

```js
import closeWithGrace from 'close-with-grace'

// Skip unhandledRejection and uncaughtException from triggering graceful close
// These can be handled separately by your error monitoring system
closeWithGrace(
  { skip: ['unhandledRejection', 'uncaughtException'] },
  async function ({ signal, err, manual }) {
    // This callback will only be triggered by signals (SIGTERM, SIGINT, etc.)
    // and beforeExit, but NOT by unhandledRejection or uncaughtException
    await cleanupResources()
  }
)

// You can also skip specific signals
closeWithGrace(
  { skip: ['SIGTERM'] },
  async function ({ signal, err, manual }) {
    // This callback will NOT be triggered by SIGTERM
    await cleanupResources()
  }
)
```

Note: When you skip an error event like `uncaughtException` or `unhandledRejection`, a no-op handler is automatically attached to prevent the process from crashing. Similarly, when you skip a signal, a no-op handler prevents the default exit behavior. This keeps your process running so you can handle these events with your own custom logic.

## API

### `closeWithGrace([opts], fn({ err, signal, manual }))`

`closeWithGrace` adds a global listeners to the events:

* `process.once('SIGHUP')`
* `process.once('SIGINT')`
* `process.once('SIGQUIT')`
* `process.once('SIGILL')`
* `process.once('SIGTRAP')`
* `process.once('SIGABRT')`
* `process.once('SIGBUS')`
* `process.once('SIGFPE')`
* `process.once('SIGSEGV')`
* `process.once('SIGUSR2')`
* `process.once('SIGTERM')`
* `process.once('uncaughtException')`
* `process.once('unhandledRejection')`
* `process.once('beforeExit')`

In case one of them is emitted, it will call the given function.
If it is emitted again, it will terminate the process abruptly.

#### opts

* `delay`: the numbers of milliseconds before abruptly close the
  process. Default: `10000`.
  - Pass `false`, `null` or `undefined` to disable this feature.

* `logger`: instance of logger which will be used internally. Default: `console`.
  - Pass `false`, `null` or `undefined` to disable this feature.

* `skip`: an array of event names to skip from triggering the graceful close callback. Default: `[]`.
  - You can skip any combination of signals (`SIGHUP`, `SIGINT`, `SIGQUIT`, `SIGILL`, `SIGTRAP`, `SIGABRT`, `SIGBUS`, `SIGFPE`, `SIGSEGV`, `SIGUSR2`, `SIGTERM`), error events (`uncaughtException`, `unhandledRejection`), or exit events (`beforeExit`).
  - Example: `skip: ['unhandledRejection', 'uncaughtException']` - useful when these errors are handled separately (e.g., with OTEL) and you don't want them to trigger the graceful close.
  - Note: Skipped error events and signals will still have a no-op handler attached to prevent the process from crashing or exiting with the default behavior.

* `onSecondError(error)`: A callback to execute if the process throws an `uncaughtException`
  or an `unhandledRejection` while `fn` is executing.

* `onSecondSignal(signal)`: A callback to execute if the process receives another
  signal while `fn` is executing.

* `onTimeout(delay)`: A callback to execute if `fn` failed to completed after `delay` milliseconds.

Both `onSecondError`, `onSecondSignal` or `onTimeout` can be used to perform custom logic, but `process.exit(1)`
will be immediately be invoked after they exit so no asynchronous operations are possible.

#### fn({ err, signal, manual } [, cb])

Execute the given function to perform a graceful close.
The function can either return a `Promise` or call the callback.
If this function does not error, the process will be closed with
exit code `0`.
If the function rejects with an `Error`, or call the callback with an
`Error` as first argument, the process will be closed with exit code
`1`.

#### return values

Calling `closeWithGrace()` will return an object as formed:

* `close()`: close the process, the `manual` argument will be set to
  true.
* `uninstall()`: remove all global listeners.

## License

MIT

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
```

## API

### `closeWithGrace([opts], fn({ err, signal, manual }))`

`closeWithGrace` adds a global listeners to the events:

* `process.once('SIGTERM')`
* `process.once('SIGINT')`
* `process.once('uncaughtException')`
* `process.once('unhandledRejection')`

In case one of them is emitted, it will call the given function.
If it is emitted again, it will terminate the process abruptly.

#### opts

* `delay`: the numbers of milliseconds before abruptly close the
  process. Default: `10000`.

* `logger`: instance of logger which will be used internally. Default: `10000`.

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

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
  await closeYourServer()
  if (err) {
    console.error(err)
  }
})
```

## Docs

to be continued..

## License

MIT

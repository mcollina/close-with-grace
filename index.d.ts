declare namespace closeWithGrace {
  interface Options {
    /**
     * The numbers of milliseconds before abruptly close the process
     * @default 10000
     */
    delay: number
  }

  type Signals = 'SIGTERM' | 'SIGINT';

  type CloseWithGraceCallback = (
    { err, signal, manual }: { err?: Error, signal?: Signals, manual?: boolean },
    cb: (error?: Error) => void
  ) => Promise<void> | void
}

/**
@example
import * as closeWithGrace from 'close-with-grace'

  // delay is the number of milliseconds for the graceful close to
  // finish.
  closeWithGrace({ delay: 500 }, async function ({ signal, err, manual }) {
    if (err) {
      console.error(err)
    }
    await closeYourServer()
  })
 */
declare function closeWithGrace (opts?: closeWithGrace.Options | closeWithGrace.CloseWithGraceCallback, fn?: closeWithGrace.CloseWithGraceCallback): {
  /**
   * Close the process, the manual argument will be set to true.
   */
  close: () => void
  /**
   *  Remove all global listeners
   */
  uninstall: () => void
}

export = closeWithGrace
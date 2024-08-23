declare namespace closeWithGrace {
  interface Logger {
    error(message?: any, ...optionalParams: any[]): void
  }

  interface Options {
    /**
     * The numbers of milliseconds before abruptly close the process
     * @default 10000
     */
    delay?: number | undefined | null | false
    /**
     * Instance of logger which will be used internally
     * @default console
     */
    logger?: Logger | undefined | null | false
  }

  type Signals = 'SIGHUP' | 'SIGINT' | 'SIGQUIT' | 'SIGILL' | 'SIGTRAP' | 'SIGABRT' | 'SIGBUS' | 'SIGFPE' | 'SIGSEGV' | 'SIGUSR2' | 'SIGTERM'
  interface CloseWithGraceCallback {
    (
      options: { err?: Error, signal?: Signals, manual?: boolean },
      cb: (error?: Error) => void
    ): void
  }
  interface CloseWithGraceAsyncCallback {
    (options: {
      err?: Error
      signal?: Signals
      manual?: boolean
    }): Promise<void>
  }
}
declare interface CloseWithGraceReturn {
  /**
   * Close the process, the manual argument will be set to true.
   */
  close: () => void
  /**
   *  Remove all global listeners
   */
  uninstall: () => void
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

  // default delay is 10000
  // to disable delay feature at all, pass falsy value to delay option.
  closeWithGrace({ delay: false }, () => await somethingUseful())

  // default logger is console
  // to disable logging at all, pass falsy value to logger option.
  closeWithGrace({ logger: false }, () => await somethingUseful())
*/
declare function closeWithGrace (
  fn: closeWithGrace.CloseWithGraceAsyncCallback
): CloseWithGraceReturn
declare function closeWithGrace (
  fn: closeWithGrace.CloseWithGraceCallback
): CloseWithGraceReturn
declare function closeWithGrace (
  opts: closeWithGrace.Options,
  fn: closeWithGrace.CloseWithGraceAsyncCallback
): CloseWithGraceReturn
declare function closeWithGrace (
  opts: closeWithGrace.Options,
  fn: closeWithGrace.CloseWithGraceCallback
): CloseWithGraceReturn
declare function closeWithGrace (
  fn: closeWithGrace.CloseWithGraceAsyncCallback
): CloseWithGraceReturn
declare function closeWithGrace (
  fn: closeWithGrace.CloseWithGraceCallback
): CloseWithGraceReturn

export = closeWithGrace

import { expect } from 'tstyche'
import closeWithGrace from '..'
import {
  Options,
  CloseWithGraceCallback,
  CloseWithGraceAsyncCallback,
  Signals,
  AllEvents,
} from '..'

type CallbackOptions = {
  manual?: boolean
  err?: Error
  signal?: Signals
}

async function asyncManualCallback (options: Pick<CallbackOptions, 'manual'>) { }
async function asyncErrorCallback (options: Pick<CallbackOptions, 'err'>) { }
async function asyncSignalCallback (options: Pick<CallbackOptions, 'signal'>) { }
async function asyncAllCallback (options: CallbackOptions) { }

function ManualCallback (
  options: Pick<CallbackOptions, 'manual'>,
  cb: (error?: Error) => void
) {
  cb()
  return
}
function ErrorCallback (
  options: Pick<CallbackOptions, 'err'>,
  cb: (error?: Error) => void
) {
  cb()
  return
}
function SignalCallback (
  options: Pick<CallbackOptions, 'signal'>,
  cb: (error?: Error) => void
) {
  cb()
  return
}
function AllCallback (options: CallbackOptions, cb: (error?: Error) => void) {
  cb()
  return
}
function WrongCallback (options: CallbackOptions, cb: (error?: Error) => void) {
  cb()
  return Promise.resolve()
}

expect<CloseWithGraceAsyncCallback>().type.toBeAssignableFrom(asyncManualCallback)
expect<CloseWithGraceAsyncCallback>().type.toBeAssignableFrom(asyncErrorCallback)
expect<CloseWithGraceAsyncCallback>().type.toBeAssignableFrom(asyncSignalCallback)
expect<CloseWithGraceAsyncCallback>().type.toBeAssignableFrom(asyncAllCallback)
expect<CloseWithGraceAsyncCallback>().type.not.toBeAssignableFrom(WrongCallback)
expect<CloseWithGraceCallback>().type.toBeAssignableFrom(ManualCallback)
expect<CloseWithGraceCallback>().type.toBeAssignableFrom(ErrorCallback)
expect<CloseWithGraceCallback>().type.toBeAssignableFrom(SignalCallback)
expect<CloseWithGraceCallback>().type.toBeAssignableFrom(AllCallback)
expect<CloseWithGraceCallback>().type.toBeAssignableFrom(WrongCallback)

expect<Signals>().type.toBeAssignableFrom('SIGHUP')
expect<Signals>().type.toBeAssignableFrom('SIGINT')
expect<Signals>().type.toBeAssignableFrom('SIGQUIT')
expect<Signals>().type.toBeAssignableFrom('SIGILL')
expect<Signals>().type.toBeAssignableFrom('SIGTRAP')
expect<Signals>().type.toBeAssignableFrom('SIGABRT')
expect<Signals>().type.toBeAssignableFrom('SIGBUS')
expect<Signals>().type.toBeAssignableFrom('SIGFPE')
expect<Signals>().type.toBeAssignableFrom('SIGFPE')
expect<Signals>().type.toBeAssignableFrom('SIGSEGV')
expect<Signals>().type.toBeAssignableFrom('SIGUSR2')
expect<Signals>().type.toBeAssignableFrom('SIGTERM')

expect<Options>().type.toBeAssignableFrom({ delay: 10 })
expect<Options>().type.toBeAssignableFrom({ delay: null })
expect<Options>().type.toBeAssignableFrom({ delay: false as const })
expect<Options>().type.toBeAssignableFrom({ delay: undefined })
expect<Options>().type.toBeAssignableFrom({ logger: console })
expect<Options>().type.toBeAssignableFrom({ logger: null })
expect<Options>().type.toBeAssignableFrom({ logger: false as const })
expect<Options>().type.toBeAssignableFrom({ logger: undefined })
expect<Options>().type.toBeAssignableFrom({ logger: console, delay: 10 })
expect<Options>().type.toBeAssignableFrom({ logger: null, delay: null })
expect<Options>().type.toBeAssignableFrom({ logger: false as const, delay: false as const })
expect<Options>().type.toBeAssignableFrom({ logger: undefined, delay: undefined })
expect<Options>().type.toBeAssignableFrom({ logger: { error: () => {} } })
expect<Options>().type.toBeAssignableFrom({ skip: ['unhandledRejection' as const, 'uncaughtException' as const] })
expect<Options>().type.toBeAssignableFrom({ skip: ['SIGTERM' as const, 'SIGINT' as const] })
expect<Options>().type.toBeAssignableFrom({ skip: ['beforeExit' as const] })
expect<Options>().type.toBeAssignableFrom({ skip: [] })
expect<Options>().type.toBeAssignableFrom<{ skip: AllEvents[] }>()
expect<Options>().type.not.toBeAssignableFrom({ skip: ['INVALID' as const] })
expect<Options>().type.toBeAssignableFrom({ onSecondError: (error: unknown) => { expect(error).type.toBe<unknown>() } })
expect<Options>().type.toBeAssignableFrom({ onSecondSignal: (signal: Signals) => { expect(signal).type.toBe<Signals>() } })
expect<Options>().type.toBeAssignableFrom({ onTimeout: (delay: number) => { expect(delay).type.toBe<number>() } })
expect<Options>().type.not.toBeAssignableFrom({ onSecondError: 'nope' })
expect<Options>().type.not.toBeAssignableFrom({ onSecondSignal: 'nope' })
expect<Options>().type.not.toBeAssignableFrom({ onTimeout: 'nope' })
expect<Options>().type.toBeAssignableFrom({ delay: 100, logger: console, skip: ['SIGTERM' as const] })

expect(closeWithGrace({ delay: 100 }, asyncAllCallback)).type.toBeAssignableTo<{
  close: () => void
  uninstall: () => void
}>()
expect(closeWithGrace({ delay: 100 }, AllCallback)).type.toBeAssignableTo<{
  close: () => void
  uninstall: () => void
}>()

closeWithGrace({ delay: 100 }, async function ({ err }) {
  expect(err).type.toBe<Error | undefined>()
})

closeWithGrace(async function ({ err }) {
  expect(err).type.toBe<Error | undefined>()
})
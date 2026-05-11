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

expect(asyncManualCallback).type.toBeAssignableTo<CloseWithGraceAsyncCallback>()
expect(asyncErrorCallback).type.toBeAssignableTo<CloseWithGraceAsyncCallback>()
expect(asyncSignalCallback).type.toBeAssignableTo<CloseWithGraceAsyncCallback>()
expect(asyncAllCallback).type.toBeAssignableTo<CloseWithGraceAsyncCallback>()
expect(WrongCallback).type.not.toBeAssignableTo<CloseWithGraceAsyncCallback>()
expect(ManualCallback).type.toBeAssignableTo<CloseWithGraceCallback>()
expect(ErrorCallback).type.toBeAssignableTo<CloseWithGraceCallback>()
expect(SignalCallback).type.toBeAssignableTo<CloseWithGraceCallback>()
expect(AllCallback).type.toBeAssignableTo<CloseWithGraceCallback>()
expect(WrongCallback).type.toBeAssignableTo<CloseWithGraceCallback>()

expect('SIGINT' as const).type.toBeAssignableTo<Signals>()
expect('SIGTERM' as const).type.toBeAssignableTo<Signals>()

expect({ delay: 10 }).type.toBeAssignableTo<Options>()
expect({ delay: null }).type.toBeAssignableTo<Options>()
expect({ delay: false as false }).type.toBeAssignableTo<Options>()
expect({ delay: undefined }).type.toBeAssignableTo<Options>()
expect({ logger: console }).type.toBeAssignableTo<Options>()
expect({ logger: null }).type.toBeAssignableTo<Options>()
expect({ logger: false as false }).type.toBeAssignableTo<Options>()
expect({ logger: undefined }).type.toBeAssignableTo<Options>()
expect({ logger: console, delay: 10 }).type.toBeAssignableTo<Options>()
expect({ logger: null, delay: null }).type.toBeAssignableTo<Options>()
expect({ logger: false as false, delay: false as false }).type.toBeAssignableTo<Options>()
expect({ logger: undefined, delay: undefined }).type.toBeAssignableTo<Options>()
expect({ logger: { error: () => {} } }).type.toBeAssignableTo<Options>()
expect({ skip: ['unhandledRejection', 'uncaughtException'] as AllEvents[] }).type.toBeAssignableTo<Options>()
expect({ skip: ['SIGTERM', 'SIGINT'] as AllEvents[] }).type.toBeAssignableTo<Options>()
expect({ skip: ['beforeExit'] as AllEvents[] }).type.toBeAssignableTo<Options>()
expect({ skip: [] as AllEvents[] }).type.toBeAssignableTo<Options>()
expect({ skip: ['INVALID'] }).type.not.toBeAssignableTo<Options>()
expect({ onSecondError: (error: unknown) => { expect(error).type.toBe<unknown>() } }).type.toBeAssignableTo<Options>()
expect({ onSecondSignal: (signal: Signals) => { expect(signal).type.toBe<Signals>() } }).type.toBeAssignableTo<Options>()
expect({ onTimeout: (delay: number) => { expect(delay).type.toBe<number>() } }).type.toBeAssignableTo<Options>()
expect({ onSecondError: 'nope' }).type.not.toBeAssignableTo<Options>()
expect({ onSecondSignal: 'nope' }).type.not.toBeAssignableTo<Options>()
expect({ onTimeout: 'nope' }).type.not.toBeAssignableTo<Options>()
expect({ delay: 100, logger: console, skip: ['SIGTERM'] as AllEvents[] }).type.toBeAssignableTo<Options>()

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
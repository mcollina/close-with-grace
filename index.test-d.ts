import { expectType, expectAssignable, expectError } from "tsd"
import closeWithGrace from "."
import {
  Options,
  CloseWithGraceCallback,
  CloseWithGraceAsyncCallback,
  Signals,
} from "."

type CallbackOptions = {
  manual?: boolean
  err?: Error
  signal?: Signals
}

async function asyncManualCallback (options: Pick<CallbackOptions, "manual">) { }
async function asyncErrorCallback (options: Pick<CallbackOptions, "err">) { }
async function asyncSignalCallback (options: Pick<CallbackOptions, "signal">) { }
async function asyncAllCallback (options: CallbackOptions) { }

function ManualCallback (
  options: Pick<CallbackOptions, "manual">,
  cb: (error?: Error) => void
) {
  cb()
  return
}
function ErrorCallback (
  options: Pick<CallbackOptions, "err">,
  cb: (error?: Error) => void
) {
  cb()
  return
}
function SignalCallback (
  options: Pick<CallbackOptions, "signal">,
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

expectAssignable<CloseWithGraceAsyncCallback>(asyncManualCallback)
expectAssignable<CloseWithGraceAsyncCallback>(asyncErrorCallback)
expectAssignable<CloseWithGraceAsyncCallback>(asyncSignalCallback)
expectAssignable<CloseWithGraceAsyncCallback>(asyncAllCallback)
expectError<CloseWithGraceAsyncCallback>(WrongCallback)
expectAssignable<CloseWithGraceCallback>(ManualCallback)
expectAssignable<CloseWithGraceCallback>(ErrorCallback)
expectAssignable<CloseWithGraceCallback>(SignalCallback)
expectAssignable<CloseWithGraceCallback>(AllCallback)
expectAssignable<CloseWithGraceCallback>(WrongCallback)

expectAssignable<Signals>("SIGINT")
expectAssignable<Signals>("SIGTERM")

expectAssignable<Options>({ delay: 10 })
expectAssignable<Options>({ delay: null })
expectAssignable<Options>({ delay: false })
expectAssignable<Options>({ delay: undefined })
expectAssignable<Options>({ logger: console })
expectAssignable<Options>({ logger: null })
expectAssignable<Options>({ logger: false })
expectAssignable<Options>({ logger: undefined })
expectAssignable<Options>({ logger: console, delay: 10 })
expectAssignable<Options>({ logger: null, delay: null })
expectAssignable<Options>({ logger: false, delay: false })
expectAssignable<Options>({ logger: undefined, delay: undefined })
expectAssignable<Options>({ logger: { error: () => {} } })

expectAssignable<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, asyncAllCallback))
expectAssignable<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, AllCallback))

closeWithGrace({ delay: 100 }, async function ({ err }) {
  expectType<Error | undefined>(err)
})

closeWithGrace(async function ({ err }) {
  expectType<Error | undefined>(err)
})

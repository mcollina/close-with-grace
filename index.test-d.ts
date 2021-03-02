import { expectType, expectAssignable, expectError } from "tsd"
import * as closeWithGrace from "."
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

expectType<Options>({ delay: 10 })

expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, asyncAllCallback))
expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, AllCallback))
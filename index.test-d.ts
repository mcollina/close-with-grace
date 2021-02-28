import { expectType, expectAssignable } from 'tsd'
import * as closeWithGrace from '.'
import { Options, CloseWithGraceCallback, Signals } from '.'

expectAssignable<CloseWithGraceCallback>(async (param: { err: Error, manual: boolean, signal: Signals }) => { })
expectAssignable<CloseWithGraceCallback>((param: { signal: Signals }, cb) => { })

expectAssignable<Signals>('SIGINT')
expectAssignable<Signals>('SIGTERM')

expectType<Options>({ delay: 10 })

expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, function ({ err, manual, signal }) { }))
expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace(function ({ err, manual, signal }) { }))
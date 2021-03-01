import { expectType, expectAssignable } from 'tsd'
import * as closeWithGrace from '.'
import { Options, CloseWithGraceCallback, Signals } from '.'

expectAssignable<CloseWithGraceCallback>(async (param: { manual?: boolean }) => { })
expectAssignable<CloseWithGraceCallback>(async (param: { err?: Error }) => { })
expectAssignable<CloseWithGraceCallback>(async (param: { signal?: Signals }) => { })
expectAssignable<CloseWithGraceCallback>((param: { signal?: Signals }, cb: (error?: Error) => void) => { return; })

expectAssignable<Signals>('SIGINT')
expectAssignable<Signals>('SIGTERM')

expectType<Options>({ delay: 10 })

expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, async function ({ signal, err, manual }) { }))
expectType<{
  close: () => void
  uninstall: () => void
}>(closeWithGrace({ delay: 100 }, function ({ manual }: { manual?: boolean }, cb: (error?: Error) => void) { }))
import type { Hook, SideEffect } from '../types';
import runtime from '../runtime';

export type SideEffectHook = {
  kind: 'sideEffect';
  sideEffect: SideEffect;
  cleanup?: () => void;
  prevDeps?: unknown[];
};

export default function useSideEffect(
  create: SideEffect['create'],
  deps?: SideEffect['deps'],
) {
  const oldHook = runtime.wipFiber?.alternate?.hooks?.[runtime.hookIndex] as
    | SideEffectHook
    | undefined;

  if (
    runtime.wipFiber?.alternate &&
    runtime.wipFiber.alternate.hooks &&
    runtime.wipFiber.alternate.hooks.length <= runtime.hookIndex &&
    !oldHook
  ) {
    console.error(
      `Hook order changed: useEffect at index ${runtime.hookIndex}`,
    );
  }

  const hook: SideEffectHook = {
    kind: 'sideEffect',
    sideEffect: { create, deps },
    cleanup: oldHook?.cleanup,
    prevDeps: oldHook?.prevDeps,
  };

  // push into wipFiber hooks list
  (runtime.wipFiber!.hooks as Hook[]).push(hook);
  runtime.hookIndex++;
}

import runtime from '../runtime.ts';
import type { Fiber, StateHook } from '../types.ts';
import ric from '../utils/requestIdleCallback-polyfill.ts';
import { workLoop } from '../utils/render.ts';

export function useState<T>(initial: T): [T, (a: T | ((t: T) => T)) => void] {
  // this checks for the hook that's in this exact position for the previous render... this is because order matters
  const oldHook = runtime.wipFiber?.alternate?.hooks?.[runtime.hookIndex] as
    | StateHook<T>
    | undefined;

  if (
    runtime.wipFiber?.alternate &&
    runtime.wipFiber.alternate.hooks &&
    runtime.wipFiber.alternate.hooks.length <= runtime.hookIndex &&
    !oldHook
  ) {
    console.error(
      `Hook order mismatch: previous render had ${runtime.wipFiber.alternate.hooks.length} hooks, ` +
        `but current render is trying to access hook index ${runtime.hookIndex}. ` +
        `Make sure hooks are called in the same order every render.`,
    );
  }

  const initialValue =
    oldHook?.state ??
    (typeof initial === 'function' ? (initial as () => T)() : initial);

  const hook: StateHook<T> = { kind: 'state', state: initialValue, queue: [] };

  // apply queued updates from last render
  oldHook?.queue.forEach((action: any) => {
    hook.state =
      typeof action === 'function'
        ? (action as (t: T) => T)(hook.state)
        : (action as T);
  });

  runtime.wipFiber!.hooks!.push(hook);
  console.log(runtime.wipFiber, 'wipFiber');

  const setState = (action: T | ((t: T) => T)) => {
    hook.queue.push(action);

    // schedule a new render from the committed root;
    runtime.wipRoot = {
      dom: runtime.currentRoot!.dom!,
      props: runtime.currentRoot!.props!,
      alternate: runtime.currentRoot!,
    } as Fiber;
    runtime.deletions = [];
    runtime.nextBitOfWork = runtime.wipRoot;

    ric(workLoop);
  };

  runtime.hookIndex++;
  return [hook.state, setState];
}

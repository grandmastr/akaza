import runtime from '../runtime';
import { ElementProps, Hook } from '../types';

export type RefObject<T = unknown> = { current: T | null };

export type RefHook<T = unknown> = {
  kind: 'ref';
  ref: RefObject<T>;
};

export default function useRef<T>(initial: T | null = null): RefObject<T> {
  const oldHook = runtime.wipFiber?.alternate?.hooks?.[runtime.hookIndex] as
    | RefHook<T>
    | undefined;

  const refObject: RefObject<T> = oldHook ? oldHook.ref : { current: initial };

  const hook: RefHook<T> = {
    kind: 'ref',
    ref: refObject,
  };

  (runtime.wipFiber!.hooks as Hook[]).push(hook);

  runtime.hookIndex++;
  return refObject;
}

export function setRef(
  ref: ElementProps['ref'],
  node: Node | HTMLElement | null,
) {
  if (!ref) return;

  if (typeof ref === 'function') ref(node);
  else ref.current = node;
}

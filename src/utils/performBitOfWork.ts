import type { FC, Fiber, Hook, VNode } from '../types.ts';
import runtime from '../runtime';
import reconcileChildren from './reconcileChildren';
import { createDom } from './dom';
import { forceBoundaryFallback, isBoundaryFiber } from './error-boundary';

export default function performBitOfWork(fiber: Fiber): Fiber | undefined {
  const isFn = typeof fiber.type === 'function';
  if (isFn) updateFunctionComponent(fiber);
  else updateHostComponent(fiber);

  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent as Fiber;
  }
}

export function updateFunctionComponent(fiber: Fiber) {
  // prepare hook runtime
  runtime.wipFiber = fiber;
  runtime.hookIndex = 0;
  fiber.hooks = [] as Hook[];
  // check if ancestor is forced
  const isAncestorForced = (fiber as any)._forcedChildren as
    | VNode[]
    | undefined;
  let result: VNode | VNode[] | null;

  try {
    // this calls function components to trigger them
    result = isAncestorForced ?? (fiber.type as FC)(fiber.props || {});
  } catch (error) {
    // get the nearest boundary and pop in it's fallback
    let parent: Fiber | null = fiber.parent ?? null;
    while (parent && !isBoundaryFiber(parent)) parent = parent.parent ?? null;

    if (!parent) {
      throw error;
    }

    forceBoundaryFallback(parent, error);

    return;
  }
  const children = (Array.isArray(result) ? result : [result]).filter(
    Boolean,
  ) as VNode[];

  reconcileChildren(fiber, children);

  // delete forced children
  (fiber as any)._forcedChildren = undefined;
}

export function updateHostComponent(fiber: Fiber) {
  // specifically for host nodes, they are the only ones that can create DOM
  if (!fiber.dom) fiber.dom = createDom(fiber);

  const elements: VNode[] = fiber.props?.children ?? [];
  reconcileChildren(fiber, elements);
}

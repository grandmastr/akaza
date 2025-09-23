import type { Element, FC, Fiber, Hook } from '../types.ts';
import runtime from '../runtime.ts';
import reconcileChildren from './reconcileChildren.ts';
import { createDom } from './dom';

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
  console.log(
    '[updateFunctionComponent] fiber.type',
    fiber.type.name || fiber.type,
  );
  // prepare hook runtime
  runtime.wipFiber = fiber;
  runtime.hookIndex = 0;
  fiber.hooks = [] as Hook[];

  // this calls function components to trigger them
  const result = (fiber.type as FC)(fiber.props || {});
  const children = (Array.isArray(result) ? result : [result]).filter(
    Boolean,
  ) as Element[];

  reconcileChildren(fiber, children);
}

export function updateHostComponent(fiber: Fiber) {
  // specifically for host nodes, they are the only ones that can create DOM
  if (!fiber.dom) fiber.dom = createDom(fiber);
  const elements = fiber.props?.children ?? [];
  reconcileChildren(fiber, elements);
}

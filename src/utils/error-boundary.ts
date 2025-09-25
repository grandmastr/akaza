import { Fiber, VNode } from '../types';
import runtime from '../runtime';

export type ErrorBoundaryProps = {
  fallback: VNode | ((args: { error: unknown }) => VNode);
  children?: VNode | VNode[] | null;
};

export default function ErrorBoundary(
  props: ErrorBoundaryProps,
): VNode | VNode[] | null {
  // this boundary renders it's children by default; fallback is injected on error
  return props.children ?? null;
}

ErrorBoundary._isErrorBoundary = true;

export function isBoundaryFiber(fiber: Fiber | null): boolean {
  if (!fiber) return false;
  const type = fiber.type;

  return type === 'function' && !!type._isErrorBoundary;
}

export function deleteSubtree(fiber: Fiber | null) {
  // queue old fibers for submission
  const stack: Array<Fiber | null> = [fiber];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    node.effectTag = 'DELETION';
    runtime.deletions.push(node);
    stack.push(node.child ?? null, node.sibling ?? null);
  }
}

const forcedChildren = new WeakMap<Fiber, VNode[]>();

export function forceBoundaryFallback(boundary: Fiber, error: unknown) {
  const fallback = boundary.props?.fallback;
  const fallbackVNode =
    typeof fallback === 'function' ? fallback({ error }) : fallback;
  const list = Array.isArray(fallbackVNode)
    ? fallbackVNode
    : fallbackVNode
      ? [fallbackVNode]
      : [];
  forcedChildren.set(boundary, list);

  if (boundary.alternate?.child) deleteSubtree(boundary.alternate.child)
}

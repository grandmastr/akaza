import { Fiber, Key, VNode } from '../types';
import runtime from '../runtime';

export default function reconcileChildren(wipFiber: Fiber, elements: VNode[]) {
  // 1. Index old children by key (or by running index as fallback)
  const oldFiberByKey = new Map<Key | number, Fiber>();
  let oldFiber = wipFiber.alternate?.child || null;
  let index = 0;
  while (oldFiber) {
    const key =
      oldFiber.props && 'key' in oldFiber.props
        ? oldFiber.props.key
        : undefined;
    oldFiberByKey.set(key ?? index, oldFiber);
    oldFiber = oldFiber.sibling ?? null;
    index++;
  }

  // 2. This builds a new linked list
  let prevSibling: Fiber | null = null;
  for (let idx = 0; idx < elements.length; idx++) {
    const element = elements[idx];
    if (!element) continue;

    const k =
      (element.props && 'key' in element.props
        ? element.props.key
        : undefined) ?? idx;
    const matched = oldFiberByKey.get(k);

    let newFiber: Fiber;

    if (matched && matched.type === element.type) {
      // UPDATE effectTag
      newFiber = {
        type: matched.type,
        props: element.props,
        dom: matched.dom ?? null,
        parent: wipFiber,
        alternate: matched,
        effectTag: 'UPDATE',
      };
      oldFiberByKey.delete(k);
    } else {
      // PLACEMENT effectTag
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };

      // if there was an old one with the same key but different type, delete it
      if (matched && matched.type !== element.type) {
        matched.effectTag = 'DELETION';
        runtime.deletions.push(matched);
        oldFiberByKey.delete(k);
      }
    }

    if (!prevSibling)
      wipFiber.child = newFiber; // FIX: set first child on wipFiber
    else prevSibling.sibling = newFiber;
    prevSibling = newFiber;
  }

  // 3. Anything left wasn’t matched → deletions (FIX: add sweep)
  oldFiberByKey.forEach((remaining) => {
    remaining.effectTag = 'DELETION';
    runtime.deletions.push(remaining);
  });
}

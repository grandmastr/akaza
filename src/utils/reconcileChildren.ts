import { Element, Fiber } from '../types.ts';
import runtime from '../runtime.ts';

// this does position-based diffing, no keys yet
export default function reconcileChildren(
  wipFiber: Fiber,
  elements: Element[],
) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type === oldFiber.type;

    let newFiber: Fiber | undefined;

    if (sameType) {
      // reuse the existing DOM node but with new props: UPDATE tag
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber!,
        effectTag: 'UPDATE',
      } as Fiber;
    } else if (element) {
      // for brand new nodes (no reusable old at this slot)
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      // old node can't be re-used because of type change: DELETION
      oldFiber.effectTag = 'DELETION';
      runtime.deletions.push(oldFiber); // queue the old sibling for deletion
    }

    // Link the newFiber (if any) as first child or as next sibling
    if (index === 0) wipFiber.child = newFiber;
    else if (prevSibling) prevSibling.sibling = newFiber!;

    prevSibling = newFiber || null;
    index++;
    oldFiber = oldFiber && oldFiber.sibling;
  }
}

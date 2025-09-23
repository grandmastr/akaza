import type { Fiber, Element } from '../types';
import ric from './requestIdleCallback-polyfill';
import runtime from '../runtime';
import commitRoot from './dom/commitRoot';
import performBitOfWork from './performBitOfWork';

export default function render(element: Element, container: Node) {
  // here we set the root of the fiber as the next bit of work to get done
  runtime.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: runtime.currentRoot,
  } as Fiber;
  runtime.deletions = [];
  runtime.nextBitOfWork = runtime.wipRoot;

  ric(workLoop);
}

export function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (runtime.nextBitOfWork && !shouldYield) {
    runtime.nextBitOfWork = performBitOfWork(runtime.nextBitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!runtime.nextBitOfWork && runtime.wipRoot) {
    commitRoot();
  }

  ric(workLoop);
}

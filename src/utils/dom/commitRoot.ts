import runtime from '../../runtime';
import { Fiber } from '../../types';
import runSideEffects from '../runSideEffects';
import { execCleanup } from '../index.ts';
import { updateDom } from './index.ts';

export default function commitRoot() {
  // 1. Process deletions first (so insertions see a clean parent)
  runtime.deletions.forEach(commitWork);

  // 2. Commit a new tree (skip the container node)
  commitWork(runtime.wipRoot!.child);

  // 3.Run effects after DOM is committed
  runSideEffects(runtime.wipRoot!);

  // 4. promote WIP to current root;
  runtime.currentRoot = runtime.wipRoot;
  runtime.wipRoot = null;
  runtime.deletions = [];
}

/*
 * commitWork commits a completed fiber to the DOM
 */
function commitWork(fiber?: Fiber | null) {
  if (!fiber) return;
  console.log(
    '[commitWork] fiber',
    fiber.type,
    'effect',
    fiber.effectTag,
    'hasDom?',
    !!fiber.dom,
  );

  // find the nearest parent with a DOM node
  let parentFiber = fiber.parent as Fiber | null;
  while (parentFiber && !parentFiber.dom)
    parentFiber = parentFiber.parent as Fiber | null;
  const domParent = parentFiber?.dom as Node | undefined;

  // Effect application
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    console.log('[commitWork] appending', fiber.dom, 'to', domParent);
    domParent?.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(
      fiber.dom as HTMLElement,
      fiber.alternate?.props || {},
      fiber.props || {},
    );
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent as Node);
    return;
  }

  // Depth-first commit, following the child-first/sibling-next approach
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: Node | null) {
  // run cleanups before deletion(unmount)
  const runCleanups = (f: Fiber | null): void => {
    if (!f) return;
    f.hooks?.forEach((hook) => {
      if (hook.kind === 'sideEffect' && typeof hook.cleanup === 'function') {
        execCleanup(hook.cleanup);
      }
    });
    // child-first/sibling-next
    runCleanups(f.child ?? null);
    runCleanups(f.sibling ?? null);
  };
  runCleanups(fiber);

  // if the fiber has a DOM node, remove it, else descent until you find nodes
  if (fiber.dom) domParent?.removeChild(fiber.dom);
  else commitDeletion(fiber.child!, domParent);
}

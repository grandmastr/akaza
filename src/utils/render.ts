import type {
  FC,
  Fiber,
  Hook,
  Element,
  StateHook,
  SideEffectHook,
} from '../types';
import {createDom, updateDom} from './dom';
import ric from './requestIdleCallback-polyfill';

function commitRoot() {
  // 1. Process deletions first (so insertions see a clean parent)
  deletions.forEach(commitWork);

  // 2. Commit a new tree (skip the container node)
  commitWork(wipRoot!.child);

  // 3.Run effects after DOM is committed
  runSideEffects(wipRoot!);

  // 4. promote WIP to current root;
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function execCleanup(cleanup: SideEffectHook['cleanup']) {
  try {
    cleanup!();
  } catch (error) {
    console.error(`[AKAZA]: side effect cleanup error`, error);
  }
}

function runSideEffects(root: Fiber) {
  // Depth-first walk for each fiber with hooks. runup/cleanup as needed
  const walk = (fiber?: Fiber | null): void => {
    if (!fiber) return;

    fiber.hooks?.forEach(hook => {
      if (hook.kind !== 'sideEffect') return;

      const nextDeps = hook.sideEffect.deps;
      const prevDeps = hook.prevDeps;

      let shouldRun = !nextDeps;
      if (nextDeps && prevDeps) {
        // this compares deps with matching indices in both lists, if there's changes, then re-run
        shouldRun = nextDeps.some((dep, i) => !Object.is(dep, prevDeps[i]));
      } else if (nextDeps && !prevDeps) {
        shouldRun = true;
      }

      if (shouldRun) {
        // runs the cleanup first
        if (typeof hook.cleanup === 'function') {
          execCleanup(hook.cleanup);
        }

        try {
          const sideEffect = hook.sideEffect.create();
          hook.cleanup = typeof sideEffect === 'function'
            ? sideEffect
            : undefined;
        } catch (error) {
          console.error(`[AKAZA]: side effect error`, error);
        }

        hook.prevDeps = nextDeps;
      }
    });

    // child-first/next-sibling
    walk(fiber.child);
    walk(fiber.sibling);
  };
  walk(root.child);
}

/*
 * commitWork commits a completed fiber to the DOM
 */
function commitWork(fiber?: Fiber | null) {
  if (!fiber) return;
  console.log('[commitWork] fiber', fiber.type, 'effect', fiber.effectTag,
    'hasDom?', !!fiber.dom);

  // find the nearest parent with a DOM node
  let parentFiber = fiber.parent as Fiber | null;
  while (parentFiber &&
  !parentFiber.dom) parentFiber = parentFiber.parent as Fiber | null;
  const domParent = parentFiber?.dom as Node | undefined;

  // Effect application
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    console.log('[commitWork] appending', fiber.dom, 'to', domParent);
    domParent?.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom as HTMLElement, fiber.alternate?.props || {},
      fiber.props || {});
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

export function render(element: any, container: Node) {
  console.log('[RENDER]: trying to render');
  // here we set the root of the fiber as the next bit of work to get done
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  } as Fiber;
  deletions = [];
  nextBitOfWork = wipRoot;

  ric(workLoop);
}

let nextBitOfWork: Fiber | undefined;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Fiber[] = [];

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextBitOfWork && !shouldYield) {
    nextBitOfWork = performBitOfWork(nextBitOfWork);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextBitOfWork && wipRoot) {
    commitRoot();
  }

  ric(workLoop);
}

function performBitOfWork(fiber: Fiber): Fiber | undefined {
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

let wipFiber: Fiber | null = null;
let hookIndex = 0;

function updateFunctionComponent(fiber: Fiber) {
  console.log('[updateFunctionComponent] fiber.type',
    fiber.type.name || fiber.type);
  // prepare hook runtime
  wipFiber = fiber;
  hookIndex = 0;
  fiber.hooks = [] as Hook[];

  // this calls function components to trigger them
  const result = (fiber.type as FC)(fiber.props || {});
  const children = (Array.isArray(result) ? result : [result]).filter(
    Boolean) as Element[];

  reconcileChildren(fiber, children);
}

export function useState<T>(initial: T): [T, (a: T | ((t: T) => T)) => void] {
  // this checks for the hook that's in this exact position for the previous render... this is because order matters
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex] as StateHook<T> | undefined;

  if (wipFiber?.alternate && wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks.length <= hookIndex && !oldHook) {
    console.error(
      `Hook order mismatch: previous render had ${wipFiber.alternate.hooks.length} hooks, ` +
      `but current render is trying to access hook index ${hookIndex}. ` +
      `Make sure hooks are called in the same order every render.`,
    );
  }

  const initialValue = (oldHook?.state ??
    (typeof initial === 'function' ? (initial as () => T)() : initial));

  const hook: StateHook<T> = {kind: 'state', state: initialValue, queue: []};

  // apply queued updates from last render
  oldHook?.queue.forEach((action: any) => {
    hook.state = typeof action === 'function' ? (action as (t: T) => T)(
      hook.state) : action as T;
  });

  wipFiber!.hooks!.push(hook);
  console.log(wipFiber, 'wipFiber');

  const setState = (action: T | ((t: T) => T)) => {
    hook.queue.push(action);

    // schedule a new render from the committed root;
    wipRoot = {
      dom: currentRoot!.dom!,
      props: currentRoot!.props!,
      alternate: currentRoot!,
    } as Fiber;
    deletions = [];
    nextBitOfWork = wipRoot;

    ric(workLoop);
  };

  hookIndex++;
  return [hook.state, setState];
}

type Effect = { create: () => any, deps?: any[] };

export function useSideEffect(create: Effect['create'], deps?: Effect['deps']) {
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex] as SideEffectHook | undefined;

  if (wipFiber?.alternate && wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks.length <= hookIndex && !oldHook) {
    console.error(`Hook order changed: useEffect at index ${hookIndex}`);
  }

  const hook: SideEffectHook = {
    kind: 'sideEffect',
    sideEffect: {create, deps},
    cleanup: oldHook?.cleanup,
    prevDeps: oldHook?.prevDeps,
  };

  // push into wipFiber hooks list
  (wipFiber!.hooks as Hook[]).push(hook);
  hookIndex++;
}

function updateHostComponent(fiber: Fiber) {
  // specifically for host nodes, they are the only ones that can create DOM
  if (!fiber.dom) fiber.dom = createDom(fiber);
  const elements = fiber.props?.children ?? [];
  reconcileChildren(fiber, elements);
}

// this does position-based diffing, no keys yet
function reconcileChildren(wipFiber: Fiber, elements: Element[]) {
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
      deletions.push(oldFiber); // queue the old sibling for deletion
    }

    // Link the newFiber (if any) as first child or as next sibling
    if (index === 0) wipFiber.child = newFiber;
    else if (prevSibling) prevSibling.sibling = newFiber!;

    prevSibling = newFiber || null;
    index++;
    oldFiber = oldFiber && oldFiber.sibling;
  }
}

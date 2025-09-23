import type { Fiber } from '../types.ts';
import { execCleanup } from './index.ts';

export default function runSideEffects(root: Fiber) {
  // Depth-first walk for each fiber with hooks. runup/cleanup as needed
  const walk = (fiber?: Fiber | null): void => {
    if (!fiber) return;

    fiber.hooks?.forEach((hook) => {
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
          hook.cleanup =
            typeof sideEffect === 'function' ? sideEffect : undefined;
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

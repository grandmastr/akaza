import type { SideEffectHook } from '../types.ts';

export function execCleanup(cleanup: SideEffectHook['cleanup']) {
  try {
    cleanup!();
  } catch (error) {
    console.error(`[AKAZA]: side effect cleanup error`, error);
  }
}

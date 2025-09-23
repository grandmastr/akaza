import type { Fiber } from './types.ts';


interface Runtime {
  wipFiber: Fiber | null;
  hookIndex: number;
  nextBitOfWork: Fiber | undefined;
  wipRoot: Fiber | null;
  currentRoot: Fiber | null;
  deletions: Fiber[];
}

const runtime: Runtime = {
  wipFiber: null,
  wipRoot: null,
  currentRoot: null,
  hookIndex: 0,
  nextBitOfWork: undefined,
  deletions: [],
};

export default runtime;

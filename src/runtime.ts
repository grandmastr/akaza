import type { Fiber } from './types.ts';

let wipFiber: Fiber | null = null;
let hookIndex = 0;

let nextBitOfWork: Fiber | undefined;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Fiber[] = [];

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

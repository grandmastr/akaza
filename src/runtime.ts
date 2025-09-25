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
  // The root fiber node, this lasts the entire app
  wipRoot: null,
  currentRoot: null,
  deletions: [],
  nextBitOfWork: undefined,

  // The fiber node currently being worked on, this lasts per component
  wipFiber: null,
  hookIndex: 0,
};

export default runtime;

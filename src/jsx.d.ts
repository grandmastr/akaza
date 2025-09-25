import type { VNode } from './types';

declare global {
  namespace JSX {
    type Element = VNode | VNode[] | null;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [k: string]: any;
    }
  }
}

export {};

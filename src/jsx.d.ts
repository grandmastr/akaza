import type { VNode } from './types';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [k: string]: any;
    }
  }
}

export {};

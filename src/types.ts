export interface Fiber {
  dom: Node | HTMLElement | null;
  type?: 'TEXT_ELEMENT' | any;
  parent?: Fiber | null;
  sibling?: Fiber | null;
  child?: Fiber | null;
  alternate?: Fiber | null;
  props?: null | Record<string, any>;
  effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION';
  hooks?: Hook[];
}

export type SideEffect = {
  create: () => void | (() => void);
  deps?: unknown[];
};

export type StateHook<T = unknown> = {
  kind: 'state';
  state: T;
  queue: Array<T | ((prev: T) => T)>;
};

export type SideEffectHook = {
  kind: 'sideEffect';
  sideEffect: SideEffect;
  cleanup?: () => void;
  prevDeps?: unknown[];
};

export type Hook = StateHook | SideEffectHook;

export type DomProps = {
  nodeValue?: string;
  key?: string | number;
} & Record<string, unknown>;

export type ElementProps = {
  children: VNode[];
  nodeValue?: string;
  key?: Key;
  [prop: string]: unknown;
};

export type VNode =
  | {
      type: 'TEXT_ELEMENT';
      props: { nodeValue: string; children: VNode[]; key?: string | number };
    }
  | { type: string | FC; props: ElementProps };
export type FC = (props: Record<string, unknown>) => Element | Element[] | null;
export type Element = { type: any; props?: ElementProps };
export type Key = string | number;

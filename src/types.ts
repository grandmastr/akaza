import { RefHook, RefObject } from './hooks/useRef';
import { StateHook } from './hooks/useState';
import { SideEffectHook } from './hooks/useSideEffect';

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

export type Hook = StateHook | SideEffectHook | RefHook;

export type DomProps = {
  nodeValue?: string;
  key?: string | number;
} & Record<string, unknown>;

export type ElementProps = {
  children: VNode | VNode[];
  nodeValue?: string;
  key?: Key;
  ref?: RefObject<any> | ((node: any) => void);
} & Record<string, unknown>;

export type VNode =
  | {
      type: 'TEXT_ELEMENT';
      props: { nodeValue: string; children: VNode[]; key?: string | number };
    }
  | { type: string | FC; props: ElementProps };
export type Element = VNode | VNode[] | null;
export type FC = (props: Record<string, unknown>) => Element;
export type Key = string | number;

import type { ElementProps, FC, VNode } from '../../types.ts';

export default function createElement(
  type: string | FC,
  props?: ElementProps,
  ...otherChildren: Array<VNode | string | number | boolean | null | undefined>
): VNode {
  // 1. Collect children from props.children and the variadic ...children
  const childrenFromProps =
    props?.children == null
      ? []
      : Array.isArray(props.children)
        ? props.children
        : [props.children];

  const flatChildren = [...childrenFromProps, ...otherChildren].flat();

  // 2. drop null/undefined children
  const children: VNode[] = flatChildren
    .filter((child) => child !== undefined && child !== null && child !== false)
    .map((child) =>
      typeof child === 'object' ? (child as VNode) : createTextElement(child),
    );

  // 3. remove the unnormalized children from props
  const { children: _, ...rest } = props ?? {};

  return {
    type,
    props: {
      ...rest,
      children,
    }
  }
}

function createTextElement(nodeValue: unknown): VNode {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: String(nodeValue),
      children: [],
    },
  };
}

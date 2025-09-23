import type { Fiber, VNode } from '../../types.ts';

export default function createElement(
  type: string,
  props?: Fiber['props'],
  ...children: any[]
) {
  const flatChildren = children.flat();
  const filteredChildren = flatChildren.filter(
    (child) => child !== undefined && child != null && child !== false,
  );
  const mappedChildren = filteredChildren.map((child) =>
    typeof child === 'object' ? child : createTextElement(child),
  );

  return {
    type,
    props: {
      ...props,
      children: mappedChildren,
    },
  };
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

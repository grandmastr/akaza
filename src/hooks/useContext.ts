import { Fiber, VNode } from '../types';
import runtime from '../runtime';

export type Context<T> = {
  id: symbol;
  Provider: (props: { value: T; children: VNode }) => VNode | VNode[] | null;
  defaultValue: T;
};

export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol('context');

  function Provider({children}: { value: T; children: VNode | VNode[] }) {
    return children ?? null;
  }

  // tag the provider function so consumers can detect it
  Provider._contextId = id;
  Provider._defaultValue = defaultValue;

  return {
    id,
    Provider,
    defaultValue,
  };
}

export function useContext<T>(ctx: Context<T>): T {
  // walk up from the current component's fiber to find the nearest Provider
  let fiber = runtime.wipFiber as Fiber | null;
  while (fiber) {
    const type: ReturnType<typeof fiber.type> = fiber.type;
    if (typeof type === 'function' && type._contextId === ctx.id) {
      // the value lives on that provider fiber's props
      return fiber.props?.value as T;
    }

    fiber = fiber.parent ?? null;
  }

  return ctx.defaultValue;
}

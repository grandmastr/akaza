const isEvent = (prop: string): prop is `on${string}` => /^on[A-Z]/.test(prop);

export default isEvent;

export const toEvent = (prop: `on${string}`) => prop.slice(2).toLowerCase();

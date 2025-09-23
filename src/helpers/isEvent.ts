const isEvent = (prop: string): prop is `on${string}` => /^on[A-Z]/.test(prop);

export default isEvent;

enum EventTags {
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA',
}

export const toEventName = (dom: Node, prop: `on${string}`) => {
  const propName = prop.slice(2).toLowerCase();
  if (!(dom instanceof HTMLElement)) return propName;

  if (propName === 'change') {
    const tag = dom.tagName;

    if (tag === EventTags.INPUT) {
      const type = (dom as HTMLInputElement).type;

      return type === 'checkbox' || type === 'radio' ? 'change' : 'input';
    }

    if (tag === EventTags.TEXTAREA) return 'input';
  }

  if (propName === 'change' && dom.getAttribute('contenteditable') === 'true')
    return 'input';

  return propName;
};

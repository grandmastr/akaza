import isEvent, { toEventName } from '../../helpers/isEvent';
import isProp from '../../helpers/isProp';
import { DomProps } from '../../types';

export default function updateDom(
  dom: HTMLElement | Text,
  prev: DomProps = {},
  next: DomProps = {},
) {
  // 1. Remove changed event listeners
  Object.keys(prev)
  .filter(isEvent)
  .forEach((event) => {
    const evt = toEventName(dom, event);
    const oldValue = prev[event] as EventListener;
    const newValue = next
      ? next[event]
      : (undefined as EventListener | undefined);

    if (oldValue && oldValue !== newValue)
      dom.removeEventListener(evt, oldValue);
  });

  // 2. Remove props no longer present
  Object.keys(prev)
  .filter(isProp)
  .forEach((prop) => {
    if (!(prop in next)) {
      if (dom.nodeType !== Node.TEXT_NODE && prop === 'style')
        (dom as HTMLElement).style.cssText = '';
      else dom[prop] = '';
    }
  });

  // 3. Sent new/changed props
  Object.keys(next)
  .filter(isProp)
  .forEach((prop) => {
    const value = next[prop];

    if ((dom as any).nodeType !== Node.TEXT_NODE && prop === 'style')
      (dom as HTMLElement).style.cssText = String(value);
    else dom[prop] = value;
  });

  // 4. Add new/changed event listeners
  Object.keys(next)
  .filter(isEvent)
  .forEach((event) => {
    const evt = toEventName(dom, event);
    const oldValue = prev[event] as EventListener;
    const newValue = next[event] as EventListener;

    if (newValue && oldValue !== newValue)
      dom.addEventListener(evt, newValue);
  });

  // 5. Text content
  if (dom.nodeType === Node.TEXT_NODE && next.nodeValue !== null) {
    dom.nodeValue = String(next.nodeValue);
  }
}

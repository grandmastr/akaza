import type { Fiber } from '../../types';
import { updateDom } from './index';

export default function createDom(fiber: Fiber) {
  if (fiber.type === 'TEXT_ELEMENT') {
    return document.createTextNode(String(fiber.props?.nodeValue ?? ''));
  }

  const dom = document.createElement(fiber.type as string);

  updateDom(dom as HTMLElement, {}, fiber.props ?? {});
  return dom;
}

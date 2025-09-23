import type {Fiber} from '../../types';
import {updateDom} from './index.ts';

export default function createDom(fiber: Fiber) {
  console.log('CREATING DOM');
  if (fiber.type === 'TEXT_ELEMENT') {
    return document.createTextNode(String(fiber.props?.nodeValue ?? ''));
  }

  console.log('NOT A TEXT ELEMENT');

  const dom = document.createElement(fiber.type as string);

  updateDom(dom as HTMLElement, {}, fiber.props ?? {});
  return dom;
}

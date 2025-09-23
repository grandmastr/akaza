import isEvent from './isEvent.ts';

const isProp = (prop: string) =>
  prop !== 'children' && prop !== 'nodeValue' && !isEvent(prop);

export default isProp;

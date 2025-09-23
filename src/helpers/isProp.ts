import isEvent from './isEvent';

const isProp = (prop: string) =>
  prop !== 'children' &&
  prop !== 'nodeValue' &&
  prop !== 'key' &&
  !isEvent(prop);

export default isProp;

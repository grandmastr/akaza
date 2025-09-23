import isEvent from './isEvent';

const isProp = (prop: string) =>
  prop !== 'children' && prop !== 'nodeValue' && !isEvent(prop);

export default isProp;

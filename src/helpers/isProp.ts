import isEvent from './isEvent';

const specialProps = ['children', 'nodeValue', 'key', 'ref'];

const isProp = (prop: string) => !specialProps.includes(prop) && !isEvent(prop);

export default isProp;

import { Pen } from '../../models/pen';
import { Node } from '../../models/node';

export function flatNodes(nodes: Pen[]): Node[] {
  const result: Node[] = [];

  result.push.apply(result, nodes);
  for (const item of nodes) {
    if (!(item instanceof Node)) {
      continue;
    }
    result.push(item);
    if (item.children) {
      result.push.apply(result, flatNodes(item.children));
    }
  }

  return result;
}

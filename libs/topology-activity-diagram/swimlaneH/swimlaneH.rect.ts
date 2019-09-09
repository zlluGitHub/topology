import { Node } from 'topology-core/models/node';
import { Rect } from 'topology-core/models/rect';

export function swimlaneHIconRect(node: Node) {
  node.iconRect = new Rect(0, 0, 0, 0);
}

export function swimlaneHTextRect(node: Node) {
  node.textRect = new Rect(node.rect.x + 10, node.rect.y, 20, node.rect.height);
  node.fullTextRect = node.textRect;
}

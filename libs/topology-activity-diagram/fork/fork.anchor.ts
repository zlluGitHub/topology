import { Point } from 'topology-core/models/point';
import { Node } from 'topology-core/models/node';
import { Direction } from 'topology-core/models/direction';

export function forkHAnchors(node: Node) {
  node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left));
  node.anchors.push(new Point(node.rect.ex, node.rect.y + node.rect.height / 2, Direction.Right));

  const dis = node.rect.width / 4;
  for (let i = 1; i < 4; ++i) {
    node.anchors.push(new Point(node.rect.x + dis * i, node.rect.y, Direction.Up));
    node.anchors.push(new Point(node.rect.x + dis * i, node.rect.ey, Direction.Bottom));
  }
}

export function forkVAnchors(node: Node) {
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up));
  node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.ey, Direction.Bottom));

  const dis = node.rect.height / 4;
  for (let i = 1; i < 4; ++i) {
    node.anchors.push(new Point(node.rect.x, node.rect.y + dis * i, Direction.Left));
    node.anchors.push(new Point(node.rect.ex, node.rect.y + dis * i, Direction.Right));
  }
}

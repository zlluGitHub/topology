import { Node } from 'topology-core/models/node';

export function activityFinal(ctx: CanvasRenderingContext2D, node: Node) {
  ctx.beginPath();
  ctx.ellipse(
    node.rect.x + ((node.rect.width / 2) << 0),
    node.rect.y + ((node.rect.height / 2) << 0),
    (node.rect.width / 2) << 0,
    (node.rect.height / 2) << 0,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.ellipse(
    node.rect.x + ((node.rect.width / 2) << 0),
    node.rect.y + ((node.rect.height / 2) << 0),
    (node.rect.width / 4) << 0,
    (node.rect.height / 4) << 0,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

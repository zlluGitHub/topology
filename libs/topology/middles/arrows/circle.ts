import { Point } from '../../models/point';
import { Rect } from '../../models/rect';

export function circleSolid(ctx: CanvasRenderingContext2D, from: Point, to: Point, fillStyle?: string) {
  const rect = new Rect(to.x - 12, to.y - 5, 10, 10);
  ctx.translate(to.x, to.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
  ctx.translate(-to.x, -to.y);
  ctx.arc(rect.center.x, rect.center.y, 5, 0, 2 * Math.PI);
  ctx.lineWidth = 2;
  ctx.stroke();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  ctx.fill();
}

export function circle(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  circleSolid(ctx, from, to, '#fff');
}

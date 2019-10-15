import { Point } from '../../models/point';
import { Rect } from '../../models/rect';

export function circleSolid(ctx: CanvasRenderingContext2D, from: Point, to: Point, scale?: number, fillStyle?: string) {
  const rect = new Rect(to.x - 12, to.y - 5, 10, 10);
  if (scale && scale !== 1) {
    rect.scale(scale, new Point(rect.x + 9, rect.y + 5));
  }
  ctx.translate(to.x, to.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
  ctx.translate(-to.x, -to.y);
  ctx.arc(rect.center.x, rect.center.y, rect.width / 2, 0, 2 * Math.PI);
  ctx.lineWidth = 2;
  ctx.stroke();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  ctx.fill();
}

export function circle(ctx: CanvasRenderingContext2D, from: Point, to: Point, scale?: number) {
  circleSolid(ctx, from, to, scale, '#fff');
}

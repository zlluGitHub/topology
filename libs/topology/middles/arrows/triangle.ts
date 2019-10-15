import { Point } from '../../models/point';
import { Rect } from '../../models/rect';

export function triangleSolid(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  scale?: number,
  fillStyle?: string
) {
  const rect = new Rect(to.x - 17, to.y - 5, 15, 10);
  if (scale && scale !== 1) {
    rect.scale(scale, new Point(rect.x + 15, rect.y + 5));
  }
  ctx.translate(to.x, to.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
  ctx.translate(-to.x, -to.y);
  ctx.moveTo(rect.x, rect.y);
  ctx.lineTo(rect.x + rect.width, rect.y + rect.height / 2);
  ctx.lineTo(rect.x, rect.y + rect.height);
  ctx.closePath();
  ctx.lineWidth = 2;
  ctx.stroke();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  ctx.fill();
}

export function triangle(ctx: CanvasRenderingContext2D, from: Point, to: Point, scale?: number) {
  triangleSolid(ctx, from, to, scale, '#fff');
}

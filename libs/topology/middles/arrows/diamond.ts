import { Point } from '../../models/point';

export function diamondSolid(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  size: number,
  fillStyle?: string
) {
  size += ctx.lineWidth * 3;
  const r = size / 2;
  if (ctx.lineWidth < 2) {
    ctx.lineWidth = 2;
  }
  ctx.translate(to.x, to.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x));
  ctx.translate(-to.x - ctx.lineWidth, -to.y - ctx.lineWidth / 10);
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - r, to.y - r / 2);
  ctx.lineTo(to.x - size, to.y);
  ctx.lineTo(to.x - r, to.y + r / 2);
  ctx.closePath();
  ctx.stroke();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
  }
  ctx.fill();
}

export function diamond(ctx: CanvasRenderingContext2D, from: Point, to: Point, size: number) {
  diamondSolid(ctx, from, to, size, '#fff');
}

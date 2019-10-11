import { Pen } from './pen';
import { Point } from './point';
import { drawLineFns, drawArrowFns } from '../middles';
import { getBezierPoint } from '../middles/lines/curve';
import { Store } from '../store/store';

export class Line extends Pen {
  from: Point;
  to: Point;
  controlPoints: Point[] = [];
  fromArrow: string;
  toArrow: string;

  animateColor = '';
  animateSpan = 1;
  animatePos = 0;
  constructor(json?: any) {
    super(json);

    if (json) {
      if (json.from) {
        this.from = new Point(json.from.x, json.from.y, json.from.direction, json.from.anchorIndex, json.from.id);
      }
      if (json.to) {
        this.to = new Point(json.to.x, json.to.y, json.to.direction, json.to.anchorIndex, json.to.id);
      }
      for (const item of json.controlPoints) {
        this.controlPoints.push(new Point(item.x, item.y, item.direction, item.anchorIndex, item.id));
      }
      this.fromArrow = json.fromArrow || '';
      this.toArrow = json.toArrow || '';
      if (json.animateColor) {
        this.animateColor = json.animateColor;
      }
      if (json.animateSpan) {
        this.animateSpan = json.animateSpan;
      }
    } else {
      this.name = 'curve';
      this.fromArrow = 'triangleSolid';
    }
  }

  setFrom(from: Point, fromArrow: string = '') {
    from.x = from.x << 0;
    from.y = from.y << 0;
    this.from = from;
    this.fromArrow = fromArrow;
  }

  setTo(to: Point, toArrow: string = 'triangleSolid') {
    to.x = to.x << 0;
    to.y = to.y << 0;
    this.to = to;
    this.toArrow = toArrow;
  }

  calcControlPoints() {
    if (this.to && drawLineFns[this.name]) {
      drawLineFns[this.name].controlPointsFn(this);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (drawLineFns[this.name]) {
      drawLineFns[this.name].drawFn(ctx, this);
    }

    // For debug
    // this.fromArrow = 'triangle';
    // this.toArrow = 'triangle';
    // end.

    if (this.fromArrow && drawArrowFns[this.fromArrow]) {
      ctx.save();
      ctx.beginPath();
      if (this.strokeStyle) {
        ctx.fillStyle = this.strokeStyle;
      } else {
        ctx.fillStyle = ctx.strokeStyle;
      }
      let f = this.to;
      if (this.name === 'curve') {
        f = getBezierPoint(0.9, this.to, this.controlPoints[1], this.controlPoints[0], this.from);
      } else if (this.name !== 'line' && this.controlPoints.length) {
        f = this.controlPoints[0];
      }
      drawArrowFns[this.fromArrow](ctx, f, this.from);
      ctx.restore();
    }
    if (this.toArrow && drawArrowFns[this.toArrow]) {
      ctx.save();
      ctx.beginPath();
      if (this.strokeStyle) {
        ctx.fillStyle = this.strokeStyle;
      } else {
        ctx.fillStyle = ctx.strokeStyle;
      }
      let f = this.from;
      if (this.name === 'curve') {
        f = getBezierPoint(0.9, this.from, this.controlPoints[0], this.controlPoints[1], this.to);
      } else if (this.name !== 'line' && this.controlPoints.length) {
        f = this.controlPoints[this.controlPoints.length - 1];
      }
      drawArrowFns[this.toArrow](ctx, f, this.to);
      ctx.restore();
    }
  }

  pointIn(pt: Point) {
    return drawLineFns[this.name].pointIn(pt, this);
  }

  animate(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineCap = 'round';
    this.animatePos += this.animateSpan;
    ctx.setLineDash([this.animatePos, this.data - this.animatePos + 1]);
    this.render(ctx);
    ctx.restore();
    if (this.animatePos > this.data + this.animateSpan) {
      if (++this.animateCycleIndex > this.animateCycle && this.animateCycle > 0) {
        this.animateStart = 0;
        Store.set('animateEnd', {
          type: 'line',
          data: this
        });
        return;
      }

      this.animatePos = this.animateSpan;
    }
  }
}

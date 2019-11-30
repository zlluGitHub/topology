import { Pen } from './pen';
import { Point } from './point';
import { drawLineFns, drawArrowFns } from '../middles';
import { getBezierPoint } from '../middles/lines/curve';
import { Store } from 'le5le-store';
import { lineLen, curveLen } from '../utils';
import { text } from '../middles/nodes/text';
import { Rect } from './rect';

export class Line extends Pen {
  from: Point;
  to: Point;
  controlPoints: Point[] = [];
  fromArrow: string;
  toArrow: string;

  length: number;

  borderWidth = 0;
  borderColor = '#000000';

  animateColor = '';
  animateSpan = 1;
  animatePos = 0;

  animateDot: { x: number, y: number };
  animateDotSize = 3;
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
      if (json.length) {
        this.length = json.length;
      }
      if (json.borderWidth) {
        this.borderColor = json.borderColor;
        this.borderWidth = json.borderWidth;
      }
      this.animateDotSize = json.animateDotSize || 3;
    } else {
      this.name = 'curve';
      this.fromArrow = 'triangleSolid';
    }
  }

  setFrom(from: Point, fromArrow: string = '') {
    this.from = from;
    this.fromArrow = fromArrow;
  }

  setTo(to: Point, toArrow: string = 'triangleSolid') {
    this.to = to;
    this.toArrow = toArrow;
  }

  calcControlPoints() {
    this.textRect = null;
    if (this.to && drawLineFns[this.name]) {
      drawLineFns[this.name].controlPointsFn(this);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.animateDot) {
      ctx.fillStyle = this.strokeStyle;
      if (this.animateType === '2') {
        ctx.beginPath();
        ctx.arc(this.animateDot.x, this.animateDot.y, this.animateDotSize, 0, 2 * Math.PI, false);
        ctx.fill();
        return;
      } else if (this.animateType === '3') {
        const bulles = this.getBubbles();
        for (const item of bulles) {
          ctx.globalAlpha = item.a;
          ctx.beginPath();
          ctx.arc(item.pos.x, item.pos.y, item.r, 0, 2 * Math.PI, false);
          ctx.fill();
        }
        return;
      }
    }

    if (this.borderWidth > 0 && this.borderColor) {
      ctx.save();
      ctx.lineWidth = this.lineWidth + this.borderWidth;
      ctx.strokeStyle = this.borderColor;
      if (drawLineFns[this.name]) {
        drawLineFns[this.name].drawFn(ctx, this);
      }
      ctx.restore();
    }

    if (drawLineFns[this.name]) {
      drawLineFns[this.name].drawFn(ctx, this);
    }

    const scale = Store.get('LT:scale');
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
      drawArrowFns[this.fromArrow](ctx, f, this.from, scale);
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
      drawArrowFns[this.toArrow](ctx, f, this.to, scale);
      ctx.restore();
    }

    if (this.text) {
      if (!this.textRect) {
        this.calcTextRect();
      }
      text(ctx, this);
    }
  }

  pointIn(pt: Point) {
    return drawLineFns[this.name].pointIn(pt, this);
  }

  getLen() {
    switch (this.name) {
      case 'line':
        return lineLen(this.from, this.to);
      case 'polyline':
        if (!this.controlPoints || !this.controlPoints.length) {
          return lineLen(this.from, this.to);
        }

        let len = 0;
        let curPt = this.from;
        for (const pt of this.controlPoints) {
          len += lineLen(curPt, pt);
          curPt = pt;
        }
        len += lineLen(curPt, this.to);
        return len | 0;

      case 'curve':
        return curveLen(this.from, this.controlPoints[0], this.controlPoints[1], this.to);
    }

    return 0;
  }

  calcTextRect() {
    const center = this.getCenter();
    let width = Math.abs(this.from.x - this.to.x);
    if (width < 200) {
      width = 200;
    }
    const height = this.font.lineHeight * this.font.fontSize * (this.textMaxLine || 1);
    this.textRect = new Rect(
      center.x - width / 2,
      center.y - height / 2,
      width,
      height
    );
  }

  getTextRect() {
    return this.textRect;
  }

  getCenter() {
    let center = new Point(this.from.x, this.from.y);
    switch (this.name) {
      case 'line':
        center = this.getLineCenter(this.from, this.to);
        break;
      case 'polyline':
        if (!this.controlPoints || !this.controlPoints.length) {
          center = this.getLineCenter(this.from, this.to);
          break;
        }

        let curPt = this.from;
        let len = 0;
        for (const pt of this.controlPoints) {
          if (curPt.y === pt.y) {
            const pos = Math.abs(curPt.x - pt.x);
            if (pos > len) {
              len = pos;
              center = this.getLineCenter(curPt, pt);
            }
          }
          curPt = pt;
        }
        if (curPt.y === this.to.y) {
          const pos = Math.abs(curPt.x - this.to.x);
          if (pos > len) {
            len = pos;
            center = this.getLineCenter(curPt, this.to);
          }
        }
        break;
      case 'curve':
        center = getBezierPoint(0.5, this.to, this.controlPoints[1], this.controlPoints[0], this.from);
    }

    return center;
  }

  getLineCenter(from: Point, to: Point) {
    return new Point((from.x + to.x) / 2, (from.y + to.y) / 2);
  }

  getPointByPos(pos: number): Point {
    if (pos <= 0) {
      return this.from;
    }
    switch (this.name) {
      case 'line':
        return this.getLinePtByPos(this.from, this.to, pos);
      case 'polyline':
        if (!this.controlPoints || !this.controlPoints.length) {
          return this.getLinePtByPos(this.from, this.to, pos);
        } else {
          const points = [].concat(this.controlPoints, this.to);
          let curPt = this.from;
          for (const pt of points) {
            const l = lineLen(curPt, pt);
            if (pos > l) {
              pos -= l;
              curPt = pt;
            } else {
              return this.getLinePtByPos(curPt, pt, pos);
            }
          }
          return this.to;
        }
      case 'curve':
        return getBezierPoint(pos / this.getLen(), this.from, this.controlPoints[0], this.controlPoints[1], this.to);
    }
    return null;
  }

  getLinePtByPos(from: Point, to: Point, pos: number) {
    const length = lineLen(from, to);
    if (pos <= 0) {
      return from;
    }
    if (pos >= length) {
      return to;
    }
    let x: number, y: number;
    x = from.x + (to.x - from.x) * (pos / length);
    y = from.y + (to.y - from.y) * (pos / length);
    return new Point(x, y);
  }

  animate() {
    this.animatePos += this.animateSpan;
    this.animateDot = null;
    switch (this.animateType) {
      case '1':
        this.lineDashOffset = -this.animatePos;
        let len = this.lineWidth;
        if (len < 5) {
          len = 5;
        }
        this.lineDash = [len, len * 2];
        break;
      // tslint:disable-next-line:no-switch-case-fall-through
      case '3':
      case '2':
        this.lineDash = null;
        this.animateDot = this.getPointByPos(this.animatePos);
        break;
      default:
        this.lineDash = [this.animatePos, this.length - this.animatePos + 1];
        break;
    }
    if (this.animatePos > this.length + this.animateSpan) {
      if (++this.animateCycleIndex >= this.animateCycle && this.animateCycle > 0) {
        this.animateStart = 0;
        Store.set('animateEnd', {
          type: 'line',
          data: this
        });
        return this.nextAnimate;
      }

      this.animatePos = this.animateSpan;
    }
  }

  getBubbles() {
    const bubbles: any[] = [];
    for (let i = 0; i < 30 && this.animatePos - i > 0; ++i) {
      bubbles.push({
        pos: this.getPointByPos(this.animatePos - i * 2),
        a: 1 - i * .03,
        r: this.lineWidth * .7 - i * .01,
      });
    }

    return bubbles;
  }

  round() {
    this.from.round();
    this.to.round();
  }
}

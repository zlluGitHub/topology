import { TopologyData } from './models/data';
import { Rect } from './models/rect';
import { Point } from './models/point';
import { Line } from './models/line';
import { Node } from './models/node';
import { Store } from 'le5le-store';
import { drawLineFns } from './middles';
import { Options } from './options';

export class HoverLayer {
  protected data: TopologyData = Store.get('topology-data');

  anchorRadius = 4;

  line: Line;
  // for move line.
  initLine: Line;
  node: Node;
  hoverLineCP: Point;
  lasthoverLineCP: Point;
  // The dock of to point of line.
  dockAnchor: Point;

  hoverAnchorIndex = -1;

  dockLineX = 0;
  dockLineY = 0;

  dragRect: Rect;
  constructor(public options: Options = {}) {
    Store.set('LT:HoverLayer', this);

    if (!this.options.hoverColor) {
      this.options.hoverColor = '#d4380d';
    }
    // The backgournd color of selecting nodes by draging.
    if (!this.options.dragColor) {
      this.options.dragColor = '#d4380d';
    }
  }

  setLine(from: Point, fromArrow = '', lineName = 'curve') {
    this.line = new Line();
    this.line.name = lineName;
    this.line.setFrom(from, fromArrow);
    this.data.lines.push(this.line);
  }

  lineTo(to: Point, toArrow: string = 'triangleSolid') {
    if (!this.line || this.line.locked) {
      return;
    }
    this.line.setTo(to, toArrow);
    if (this.line.from.id || this.line.to.id) {
      this.line.calcControlPoints();
    }
  }

  lineFrom(from: Point) {
    if (this.line.locked) {
      return;
    }
    this.line.setFrom(from, this.line.fromArrow);
    if (this.line.from.id || this.line.to.id) {
      this.line.calcControlPoints();
    }
  }

  lineMove(pt: Point, initPos: { x: number; y: number }) {
    if (this.line.locked) {
      return;
    }
    const x = pt.x - initPos.x;
    const y = pt.y - initPos.y;
    this.line.setTo(new Point(this.initLine.to.x + x, this.initLine.to.y + y), this.line.toArrow);
    this.line.setFrom(new Point(this.initLine.from.x + x, this.initLine.from.y + y), this.line.fromArrow);
    if (this.line.from.id || this.line.to.id) {
      this.line.calcControlPoints();
    } else {
      for (let i = 0; i < this.initLine.controlPoints.length; ++i) {
        this.line.controlPoints[i].x = this.initLine.controlPoints[i].x + x;
        this.line.controlPoints[i].y = this.initLine.controlPoints[i].y + y;
      }
      Store.set('pts-' + this.line.id, null);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.data.locked < 0) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = this.options.hoverColor;
    ctx.fillStyle = '#fff';
    // anchors
    if (this.node && !this.data.locked) {
      for (let i = 0; i < this.node.rotatedAnchors.length; ++i) {
        if (this.node.locked || (this.node.rotatedAnchors[i].hidden && this.hoverAnchorIndex !== i)) {
          continue;
        }
        ctx.beginPath();
        ctx.arc(this.node.rotatedAnchors[i].x, this.node.rotatedAnchors[i].y, this.anchorRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    const activeLine = Store.get('activeLine');
    if (activeLine) {
      drawLineFns[activeLine.name].drawControlPointsFn(ctx, activeLine);
    }

    ctx.fillStyle = this.options.hoverColor;
    if (this.dockAnchor) {
      ctx.beginPath();
      ctx.arc(this.dockAnchor.x, this.dockAnchor.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.hoverLineCP) {
      ctx.beginPath();
      ctx.arc(this.hoverLineCP.x, this.hoverLineCP.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = this.options.dragColor + '50';
    ctx.fillStyle = this.options.dragColor + '30';
    ctx.lineWidth = 1;

    if (this.dockLineX > 0) {
      const size = Store.get('LT:size');
      ctx.beginPath();
      ctx.moveTo(this.dockLineX, 0);
      ctx.lineTo(this.dockLineX, size.height);
      ctx.stroke();
    }

    if (this.dockLineY > 0) {
      const size = Store.get('LT:size');
      ctx.beginPath();
      ctx.moveTo(0, this.dockLineY);
      ctx.lineTo(size.width, this.dockLineY);
      ctx.stroke();
    }

    // Select nodes by drag.
    if (this.dragRect) {
      ctx.strokeStyle = this.options.dragColor;
      ctx.beginPath();
      ctx.strokeRect(this.dragRect.x, this.dragRect.y, this.dragRect.width, this.dragRect.height);
      ctx.fillRect(this.dragRect.x, this.dragRect.y, this.dragRect.width, this.dragRect.height);
    }

    ctx.restore();
  }

  clear() {
    this.node = null;
    this.line = null;
  }
}

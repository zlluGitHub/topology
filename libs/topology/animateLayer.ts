import { Node } from './models/node';
import { Line } from './models/line';
import { lineLen, curveLen } from './middles/utils';

export class AnimateLayer {
  canvas = document.createElement('canvas');
  nodes: Node[] = [];
  lines: Line[] = [];

  private last = Date.now();
  private timer: any;
  constructor(parent: HTMLElement, public options: any) {
    if (!this.options.animateColor) {
      this.options.animateColor = '#ff6600';
    }

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.outline = 'none';
    parent.appendChild(this.canvas);
  }

  render() {
    if (this.timer) {
      return;
    }

    this.animate();
  }

  addLine(line: Line) {
    const l = new Line(line);
    l.fromArrow = '';
    l.toArrow = '';
    l.lineWidth += 1;
    l.strokeStyle = l.animateColor || this.options.animateColor;
    l.data = this.getLen(l);
    l.animateStart = line.animateStart;
    this.lines.push(l);
  }

  animate() {
    if (!this.lines.length && !this.nodes.length) {
      // clear
      this.canvas.height = this.canvas.height;
      this.timer = null;
      return;
    }

    this.timer = requestAnimationFrame(() => {
      const now = Date.now();
      const interval = now - this.last;
      this.last = now;

      // Not need too fast.
      if (interval > 15) {
        // clear
        this.canvas.height = this.canvas.height;

        const ctx = this.canvas.getContext('2d');
        for (let i = 0; i < this.lines.length; ++i) {
          this.lines[i].animate(ctx);
          if (!this.lines[i].animateStart) {
            this.lines.splice(i, 1);
          }
        }
        for (let i = 0; i < this.nodes.length; ++i) {
          this.nodes[i].animate(ctx, now);
          if (!this.nodes[i].animateStart) {
            this.nodes.splice(i, 1);
          }
        }
      }
      this.animate();
    });
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getLen(line: Line) {
    switch (line.name) {
      case 'line':
        return lineLen(line.from, line.to);
      case 'polyline':
        if (!line.controlPoints || !line.controlPoints.length) {
          return lineLen(line.from, line.to);
        }

        let len = 0;
        let curPt = line.from;
        for (const pt of line.controlPoints) {
          len += lineLen(curPt, pt);
          curPt = pt;
        }
        len += lineLen(curPt, line.to);
        return len | 0;

      case 'curve':
        return curveLen(line.from, line.controlPoints[0], line.controlPoints[1], line.to);
    }

    return 0;
  }

  nextAnimatePos() {}
}

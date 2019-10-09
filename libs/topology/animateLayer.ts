import { Node } from './models/node';
import { Line } from './models/line';
import { Store } from './store/store';
import { lineLen, curveLen } from './middles/utils';

export class AnimateLayer {
  canvas = document.createElement('canvas');
  private nodes: Node[] = [];
  private lines: Line[] = [];
  private animateId: any;
  private last = Date.now();
  constructor(parent: HTMLElement, public options: any) {
    if (!this.options.animateColor) {
      this.options.animateColor = '#ff6600';
    }

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    parent.appendChild(this.canvas);
  }

  render() {
    this.nodes = [];
    this.lines = [];

    if (this.animateId) {
      cancelAnimationFrame(this.animateId);
    }

    const nodes = Store.get('nodes');
    for (const node of nodes) {
      if (!node.animate) {
        continue;
      }
      const n = new Node(node);
      this.nodes.push(n);
    }

    const lines = Store.get('lines');
    for (const line of lines) {
      if (!line.animate || !line.to) {
        continue;
      }
      const l = new Line(line);
      l.fromArrow = '';
      l.toArrow = '';
      l.lineWidth += 1;
      l.strokeStyle = l.animateColor || this.options.animateColor;
      l.data = this.getLen(l);
      this.lines.push(l);
    }

    this.animate();
  }

  animate() {
    if (!this.lines.length && !this.nodes.length) {
      // clear
      this.canvas.height = this.canvas.height;
      return;
    }

    this.animateId = requestAnimationFrame(() => {
      // clear
      this.canvas.height = this.canvas.height;

      const now = Date.now();
      this.renderLines(now);
      for (const item of this.nodes) {
        item.renderFrame(now);
      }

      this.animate();
    });
  }

  renderLines(now: number) {
    const interval = now - this.last;
    // Not need too fast.
    if (interval < 15) {
      return;
    }
    this.last = now;
    const ctx = this.canvas.getContext('2d');
    ctx.lineCap = 'round';
    for (const item of this.lines) {
      item.animatePos += item.animateSpan;
      if (item.animatePos > item.data + item.animateSpan) {
        item.animatePos = item.animateSpan;
      }
      ctx.save();
      ctx.setLineDash([item.animatePos, item.data - item.animatePos + 1]);
      item.render(ctx);
      ctx.restore();
    }
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

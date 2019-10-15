import { Node } from './models/node';
import { Line } from './models/line';
import { lineLen, curveLen } from './middles/utils';
import { Store } from './store/store';

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

  render(force = true) {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }

    if (force) {
      this.nodes = [];
      this.lines = [];
    }

    const nodes = Store.get('nodes');
    const lines = Store.get('lines');
    for (const item of nodes) {
      let found = false;
      for (let i = 0; i < this.nodes.length; ++i) {
        if (this.nodes[i].id === item.id) {
          item.animateCycleIndex = 1;
          found = true;
          if (!item.animateStart) {
            this.nodes.splice(i, 1);
          }
        }
      }

      if (!found && item.animateStart) {
        this.addNode(item);
      }
    }
    for (const item of lines) {
      let found = false;
      for (let i = 0; i < this.lines.length; ++i) {
        if (this.lines[i].id === item.id) {
          this.lines[i].animateCycle = item.animateCycle;
          this.lines[i].animateCycleIndex = 1;
          this.lines[i].animateColor = item.animateColor || this.options.animateColor;
          this.lines[i].strokeStyle = item.animateColor || this.options.animateColor;
          this.lines[i].animateSpan = item.animateSpan;
          found = true;
          if (item.animateStart) {
            this.lines[i].animateStart = item.animateStart;
          } else {
            this.lines.splice(i, 1);
          }
        }
      }

      if (!found && item.animateStart) {
        this.addLine(item);
      }
    }

    this.animate();
  }

  addNode(node: Node) {
    let passed = 0;
    for (let i = 0; i < node.animateFrames.length; ++i) {
      node.animateFrames[i].start = passed;
      passed += node.animateFrames[i].duration;
      node.animateFrames[i].end = passed;
      node.animateFrames[i].initState = Node.cloneState(i ? node.animateFrames[i - 1].state : node);
    }
    this.nodes.push(node);
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

      // Not too fast.
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
          if (this.nodes[i].animateDuration && this.nodes[i].animateStart) {
            this.nodes[i].animate(ctx, now);
          } else {
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

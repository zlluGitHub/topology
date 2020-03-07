import { Store } from 'le5le-store';

import { Pen } from './models/pen';
import { Node } from './models/node';
import { Line } from './models/line';
import { TopologyData } from './models/data';
import { Options } from './options';

export class AnimateLayer {
  protected data: TopologyData = Store.get('topology-data');
  pens: Pen[] = [];

  private timer: any;
  private lastNow = 0;
  private subcribeUpdate;
  constructor(public options: Options = {}) {
    Store.set('LT:AnimateLayer', this);

    if (!this.options.animateColor) {
      this.options.animateColor = '#ff6600';
    }

    this.subcribeUpdate = Store.subscribe('LT:updateLines', (lines: Line[]) => {
      this.updateLines(lines);
    });
  }

  getPens(nextPlay = '', pens: Pen[] = null) {
    if (!pens) {
      this.pens = [];
      pens = this.data.pens;
    }

    for (const item of pens) {
      if (item instanceof Node && item.children) {
        this.getPens(nextPlay, item.children);
      }
      if (nextPlay && item.tags.indexOf(nextPlay) > -1) {
        item.animateStart = Date.now();
      }

      if (item.animateStart) {
        if (item instanceof Node) {
          item.initAnimateProps();
          this.pens.push(item);
        } else {
          const l = new Line(item);
          l.isAnimate = true;
          l.toArrow = '';
          if (l.fromArrow && l.fromArrow.indexOf('line') < 0) {
            l.animateFromSize = l.fromArrowSize + l.lineWidth * 5;
          }
          if (l.toArrow && l.toArrow.indexOf('line') < 0) {
            l.animateToSize = l.toArrowSize + l.lineWidth * 5;
          }
          l.animateStart = item.animateStart;
          l.lineCap = 'round';
          l.fillStyle = '#fff';
          l.strokeStyle = l.animateColor || this.options.animateColor;
          l.length = l.getLen();
          if (!l.fromArrowColor) {
            l.fromArrowColor = l.strokeStyle || '#222';
          }
          if (!l.toArrowColor) {
            l.toArrowColor = l.strokeStyle || '#222';
          }
          this.pens.push(l);
        }
      }
    }
  }

  findNext(nextPlay: string) {
    const pens: Pen[] = [];
    for (const item of this.data.pens) {
      if (!item.animateStart && nextPlay && item.tags.indexOf(nextPlay) > -1) {
        item.animateStart = Date.now();
        if (item instanceof Node) {
          item.initAnimateProps();
        }
        pens.push(item);
      }
    }

    return pens;
  }

  animate() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
    this.timer = requestAnimationFrame(() => {
      const now = Date.now();
      if (now - this.lastNow < 30) {
        this.animate();
        return;
      }
      this.lastNow = now;
      let animated = false;
      for (let i = 0; i < this.pens.length; ++i) {
        if (this.pens[i].animateStart > now) {
          continue;
        }
        const next = this.pens[i].animate(now);
        if (next) {
          this.pens.splice(i, 1);
          this.pens.push.apply(this.pens, this.findNext(next));
        } else if (this.pens[i] && !this.pens[i].animateStart) {
          this.pens.splice(i, 1);
        }
        animated = true;
      }
      if (animated) {
        Store.set('LT:render', true);
        this.animate();
      }
    });
  }

  updateLines(lines: Line[]) {
    for (const line of this.pens) {
      if (!(line instanceof Line)) {
        continue;
      }

      for (const item of lines) {
        if (line.id === item.id) {
          line.from = item.from;
          line.to = item.to;
          line.controlPoints = item.controlPoints;
          line.length = line.getLen();
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const item of this.pens) {
      if (item instanceof Line) {
        item.render(ctx);
      }
    }
  }

  stop() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
  }

  destroy() {
    this.stop();
    this.subcribeUpdate.unsubcribe();
  }
}

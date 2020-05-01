import { Store } from 'le5le-store';

import { Pen, PenType } from './models/pen';
import { Node } from './models/node';
import { Line } from './models/line';
import { TopologyData } from './models/data';
import { Options } from './options';

export class AnimateLayer {
  protected data: TopologyData = Store.get('topology-data');
  pens: Pen[] = [];
  readyPens: Pen[];

  private timer: any;
  private lastNow = 0;
  private subscribeUpdate: any;
  private subscribePlay: any;
  constructor(public options: Options = {}) {
    Store.set('LT:AnimateLayer', this);

    if (!this.options.animateColor) {
      this.options.animateColor = '#ff6600';
    }

    this.subscribeUpdate = Store.subscribe('LT:updateLines', (lines: Line[]) => {
      this.updateLines(lines);
    });
    this.subscribePlay = Store.subscribe('LT:AnimatePlay', (params: { tag: string; pen: Pen; }) => {
      if (params.tag) {
        this.readyPlay(params.tag, false);
      } else if (!this.find(params.pen)) {
        params.pen.animateStart = Date.now();
        if (params.pen instanceof Node) {
          params.pen.initAnimateProps();
          this.readyPens = [params.pen];
        } else {
          this.readyPens = [this.getAnimateLine(params.pen)];
        }
      }
      this.animate();
    });
  }

  find(pen: Pen) {
    for (const item of this.pens) {
      if (item.id === pen.id) {
        return item;
      }
    }
  }

  remove(pen: Pen) {
    for (let i = 0; i < this.pens.length; i++) {
      if (this.pens[i].id === pen.id) {
        this.pens.splice(i, 1);
      }
    }
  }

  getAnimateLine(item: Pen) {
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

    return l;
  }

  readyPlay(tag?: string, auto?: boolean, pens?: Pen[]) {
    if (!pens) {
      pens = this.data.pens;
      this.readyPens = [];
    }

    for (const item of pens) {
      if (item.animatePlay || (tag && item.tags.indexOf(tag) > -1)) {
        item.animateStart = Date.now();
      }
      if (item.animateStart > 0) {
        if (item instanceof Node) {
          item.initAnimateProps();
          this.readyPens.push(item);
          if ((tag || auto) && item.children) {
            this.readyPlay(tag, auto, item.children);
          }
        } else {
          this.readyPens.push(this.getAnimateLine(item));
        }
      } else if (item.animateStart === 0) {
        const pen = this.find(item);
        if (pen) {
          pen.animateStart = 0;
        }
      }

      if (item.type === PenType.Node) {
        this.readyPlay(tag, auto, (item as Node).children || []);
      }
    }
  }

  animate() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }

    if (this.readyPens) {
      for (const pen of this.readyPens) {
        let found = false;
        for (const item of this.pens) {
          if (pen.id === item.id) {
            found = true;
            break;
          }
        }
        if (!found) {
          this.pens.push(pen);
        }
      }

      this.readyPens = null;
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
        if (this.pens[i].animateStart < 1) {
          this.pens.splice(i, 1);
          continue;
        }
        if (this.pens[i].animateStart > now) {
          continue;
        }
        const next = this.pens[i].animate(now);
        if (next) {
          this.pens.splice(i, 1);
          this.readyPlay(next, false);
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
    this.subscribeUpdate.unsubscribe();
    this.subscribePlay.unsubscribe();
  }
}

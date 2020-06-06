import { Store } from 'le5le-store';

import { Pen, PenType } from './models/pen';
import { Node } from './models/node';
import { Line } from './models/line';
import { TopologyData } from './models/data';
import { Options } from './options';
import { s8 } from './utils';
import { Canvas } from './canvas';
import { RenderLayer } from './renderLayer';

export class AnimateLayer extends Canvas {
  protected data: TopologyData;
  pens = new Map();
  readyPens = new Map();

  private timer: any;
  private lastNow = 0;
  private subscribeUpdate: any;
  private subscribePlay: any;
  private subscriResize: any;
  private renderLayer: RenderLayer;

  constructor(public parentElem: HTMLElement, public options: Options = {}, TID: String) {
    super(parentElem, options, TID);
    this.data = Store.get(this.generateStoreKey('topology-data'));
    Store.set(this.generateStoreKey('LT:AnimateLayer'), this);

    if (!this.options.animateColor) {
      this.options.animateColor = '#ff6600';
    }

    this.subscribeUpdate = Store.subscribe(this.generateStoreKey('LT:updateLines'), (lines: Line[]) => {
      this.updateLines(lines);
    });
    this.subscribePlay = Store.subscribe(this.generateStoreKey('LT:AnimatePlay'), (params: { tag: string; pen: Pen; }) => {
      this.readyPlay(params.tag, false);
      this.animate();
    });
    // Other layers should listen in the same way,hoverLayer,ActiveLayer ,offScreenLayer etc..
    this.subscriResize = Store.subscribe(this.generateStoreKey('LT:resize'), (size?: { width: number; height: number; }) => {
      this.resize(size);
    });
  }

  getAnimateLine(item: Pen) {
    const l = new Line(item);
    l.id = s8();
    l.setTID(this.TID);
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

  find(pen: Pen) {
    for (const item of this.data.pens) {
      if (item.id === pen.id) {
        return item;
      }
    }
  }

  readyPlay(tag?: string, auto?: boolean, pens?: Pen[]) {
    this.readyPens.clear();
    if (!pens) {
      pens = this.data.pens;
    }

    pens.forEach((pen: Pen) => {
      pen.setTID(this.TID);
      if (!pen.visible || this.readyPens.get(pen.id)) {
        return;
      }

      if (this.pens.get(pen.id)) {
        if (!pen.animateStart || pen.animateStart < 1) {
          this.pens.delete(pen.id);
        }
        return;
      }

      if ((auto && pen.animatePlay) || (tag && pen.tags.indexOf(tag) > -1)) {
        if (!pen.animateStart || pen.animateStart < 1) {
          pen.animateStart = Date.now();
        }
      }

      if (!pen.animateStart || pen.animateStart < 1) {
        return;
      }

      if (pen instanceof Node) {
        pen.initAnimateProps();
        this.readyPens.set(pen.id, pen);
        if ((tag || auto) && pen.children && pen.children.length) {
          this.readyPlay(tag, auto, pen.children);
        }
      } else {
        this.readyPens.set(pen.id, this.getAnimateLine(pen));
      }
    });
  }

  animate() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }

    this.readyPens.forEach((pen: Pen, key) => {
      this.readyPens.delete(key);
      this.pens.set(key, pen);
    });

    this.timer = requestAnimationFrame(() => {
      const now = Date.now();
      if (now - this.lastNow < 30) {
        this.animate();
        return;
      }
      this.lastNow = now;
      let animated = false;
      this.pens.forEach((pen: Pen, key) => {
        if (pen.animateStart < 1) {
          this.pens.delete(key);
          return;
        }

        if (pen.animateStart > now) {
          return;
        }

        if (pen.animateFn) {
          if (typeof pen.animateFn === 'function') {
            pen.animateFn();
          } else if ((window as any)[pen.animateFn]) {
            (window as any)[pen.animateFn]();
          } else {
            // pen.render();
          }
        } else {
          pen.animate(now);
        }
        if (pen.animateStart < 1) {
          this.pens.delete(key);
          if (pen.type === PenType.Line) {
            const line = this.find(pen);
            line && (line.animateStart = 0);
          }
          if (pen.nextAnimate) {
            this.readyPlay(pen.nextAnimate, false);
          }
        }

        animated = true;
      });

      if (animated) {
        // Store.set(this.generateStoreKey('LT:render'), true);
        this.render();
        if (!this.renderLayer) {
          this.renderLayer = Store.get(this.generateStoreKey('LT:RenderLayer'));
        }
        this.renderLayer && this.renderLayer.render();
        this.animate();
      }
    });
  }

  updateLines(lines: Line[]) {
    this.pens.forEach((line: Pen, key) => {
      if (!(line instanceof Line)) {
        return;
      }

      for (const item of lines) {
        if (line.id === item.id) {
          line.from = item.from;
          line.to = item.to;
          line.controlPoints = item.controlPoints;
          line.length = line.getLen();
        }
      }
    });
  }

  render() {
    super.render();

    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.options.color;

    this.pens.forEach((pen: Pen, key) => {
      if (pen.visible) {
        if (!pen.getTID()) {
          pen.setTID(this.TID);
        }
        pen.render(ctx);
      }
    });
  }

  stop() {
    this.readyPens.clear();
    this.pens.clear();
    if (this.timer) {
      cancelAnimationFrame(this.timer);
    }
  }

  destroy() {
    this.stop();
    this.subscribeUpdate.unsubscribe();
    this.subscribePlay.unsubscribe();
    this.subscriResize.unsubscribe();
  }
}

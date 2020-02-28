import { Store } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';
import { ActiveLayer } from './activeLayer';
import { HoverLayer } from './hoverLayer';
import { AnimateLayer } from './animateLayer';

export class Offscreen extends Canvas {
  public activeLayer: ActiveLayer = Store.get('LT:ActiveLayer');
  public hoverLayer: HoverLayer = Store.get('LT:HoverLayer');
  public animateLayer: AnimateLayer = Store.get('LT:AnimateLayer');
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    super(parentElem, options);
    Store.set('LT:offscreen', this.canvas);
  }

  render() {
    super.render();

    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.options.color;

    for (const item of this.data.pens) {
      item.render(ctx);
    }

    this.activeLayer.render(ctx);
    this.animateLayer.render(ctx);
    this.hoverLayer.render(ctx);
  }


}

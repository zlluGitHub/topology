import { Store } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';
import { ActiveLayer } from './activeLayer';
import { HoverLayer } from './hoverLayer';
import { AnimateLayer } from './animateLayer';
import { Node, Line } from './models';

export class Offscreen extends Canvas {
  public activeLayer: ActiveLayer;
  public hoverLayer: HoverLayer;
  public animateLayer: AnimateLayer;
  constructor(public parentElem: HTMLElement, public options: Options = {}, TID: String) {
    super(parentElem, options, TID);
    this.activeLayer = Store.get(this.generateStoreKey('LT:ActiveLayer'));
    this.hoverLayer = Store.get(this.generateStoreKey('LT:HoverLayer'));
    this.animateLayer = Store.get(this.generateStoreKey('LT:AnimateLayer'));
    Store.set(this.generateStoreKey('LT:offscreen'), this);
  }

  render() {
    super.render();

    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.options.color;

    for (const item of this.data.pens) {
      if (!item.getTID()) {
        item.setTID(this.TID);
      }
      /**
       *Nodes requiring animation ignore rendering,Rendering with animatelayer
       *Lines associated with animation nodes should also have animatelayer to complete the rendering
       *
       */
      if (item instanceof Node && item.animatePlay) {
        continue;
      }
      if (item instanceof Line && item.linkToAnimateNode) {
        continue;
      }
      item.render(ctx);
    }

    this.activeLayer.render(ctx);
    // this.animateLayer.render(ctx);
    this.hoverLayer.render(ctx);
  }


}

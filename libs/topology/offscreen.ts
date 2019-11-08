import { Store } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';

export class Offscreen extends Canvas {
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    super(parentElem, options);
    Store.set('offscreen', this.canvas);
  }

  render() {
    super.render();

    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.options.color;

    this.renderNodes();
    this.renderLines();
    Store.set('render', 'offscreen');
  }

  renderNodes() {
    if (!this.data.nodes.length) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    for (const item of this.data.nodes) {
      if (item.animateStart && item.animateDuration) {
        continue;
      }
      item.render(ctx);
    }
  }

  renderLines() {
    if (!this.data.lines.length) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    let i = 0;
    for (const item of this.data.lines) {
      if (!item.to) {
        this.data.lines.splice(i++, 1);
        continue;
      }
      item.render(ctx);
      ++i;
    }
  }
}

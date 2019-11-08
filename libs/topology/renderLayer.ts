import { Store } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';

export class RenderLayer extends Canvas {
  offscreen = Store.get('LT:offscreen');

  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    super(parentElem, options);
    this.parentElem.appendChild(this.canvas);
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.offscreen, 0, 0, this.width, this.height);
  }
}

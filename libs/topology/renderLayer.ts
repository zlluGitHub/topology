import { Store } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';

export class RenderLayer extends Canvas {
  offscreen = Store.get('offscreen');
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    super(parentElem, options);
    this.canvas.style.zIndex = '-1';
    this.parentElem.appendChild(this.canvas);
  }

  render() {
    super.render();

    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.offscreen, 0, 0);
  }

  resize(size?: { width: number; height: number }) {
    super.resize(size);

    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.width = this.width * this.dpiRatio;
    this.canvas.height = this.height * this.dpiRatio;
  }
}

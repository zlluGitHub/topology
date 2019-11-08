import { Store, Observer } from 'le5le-store';
import { Options } from './options';
import { Canvas } from './canvas';

export class RenderLayer extends Canvas {
  offscreen = Store.get('offscreen');
  animateLayer = Store.get('animateLayer');
  activeLayer = Store.get('activeLayer');
  hoverLayer = Store.get('hoverLayer');

  private subcribe: Observer;
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    super(parentElem, options);
    this.parentElem.appendChild(this.canvas);

    this.subcribe = Store.subscribe('render', () => {
      this.render();
    });
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.offscreen, 0, 0, this.width, this.height);
    ctx.drawImage(this.animateLayer, 0, 0, this.width, this.height);
    ctx.drawImage(this.activeLayer, 0, 0, this.width, this.height);
    ctx.drawImage(this.hoverLayer, 0, 0, this.width, this.height);
  }

  destory() {
    this.subcribe.unsubscribe();
  }
}

import { Options } from './options';

export class Canvas {
  canvas = document.createElement('canvas');
  dpiRatio = 1;
  width = 0;
  height = 0;
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.outline = 'none';

    const ctx = this.canvas.getContext('2d');
    const bsr =
      ctx['webkitBackingStorePixelRatio'] ||
      ctx['mozBackingStorePixelRatio'] ||
      ctx['msBackingStorePixelRatio'] ||
      ctx['oBackingStorePixelRatio'] ||
      ctx['backingStorePixelRatio'] ||
      1;

    this.dpiRatio = window.devicePixelRatio / bsr + 0.25;
  }

  resize(size?: { width: number; height: number }) {
    if (size) {
      this.width = size.width;
      this.height = size.height;
    } else {
      if (this.options.width && this.options.width !== 'auto') {
        this.width = +this.options.width;
      } else {
        this.width = this.parentElem.clientWidth;
      }
      if (this.options.height && this.options.height !== 'auto') {
        this.height = +this.options.height;
      } else {
        this.height = this.parentElem.clientHeight - 8;
      }
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  render() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

import { Pen } from './pen';
import { Rect } from './rect';
import { Point } from './point';
import { anchorsFns, iconRectFns, textRectFns, drawNodeFns } from '../middles';
import { defaultAnchors } from '../middles/default.anchor';
import { defaultIconRect, defaultTextRect } from '../middles/default.rect';
import { text, iconfont } from '../middles/nodes/text';
import { Store } from 'le5le-store';
import { Direction } from './direction';
import { abs } from '../utils';

export class Node extends Pen {
  is3D = false;
  z: number;
  zRotate = 0;

  // 0 -1 之间的小数
  borderRadius: number;

  // icon
  icon: string;
  iconFamily: string;
  iconSize: number;
  iconColor: string;

  image: string;
  lastImage: string;
  imgNaturalWidth: number;
  imgNaturalHeight: number;
  imageWidth: number;
  imageHeight: number;
  imageRatio = true;
  imageAlign: Direction;
  private img: HTMLImageElement;

  // 0 - 纯色；1 - 图片；2 - 线性渐变；3 - 径向渐变
  bkType: number;
  bkImage: string;
  lastBkImage: string;
  bkImgNaturalWidth: number;
  bkImgNaturalHeight: number;
  private bkImg: HTMLImageElement;

  paddingTop: number | string;
  paddingBottom: number | string;
  paddingLeft: number | string;
  paddingRight: number | string;

  paddingTopNum: number;
  paddingBottomNum: number;
  paddingLeftNum: number;
  paddingRightNum: number;

  iconRect: Rect;
  fullIconRect: Rect;

  text: string;
  textMaxLine: number;
  textRect: Rect;
  fullTextRect: Rect;

  anchors: Point[] = [];
  rotatedAnchors: Point[] = [];
  parentId: string;
  rectInParent: {
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    rotate: number;
  };
  children: Node[];

  // nodes移动时，停靠点的参考位置
  dockWatchers: Point[];

  // animateType仅仅是辅助标识
  animateType = 0;
  animateDuration = 0;
  animateFrames: {
    duration: number;
    start?: number;
    end?: number;
    initState?: Node;
    linear: boolean;
    state: Node;
  }[] = [];

  constructor(json: any) {
    super(json);

    this.is3D = json.is3D;
    this.z = json.z;
    this.zRotate = json.zRotate || 0;

    this.borderRadius = +json.borderRadius || 0;
    if (this.borderRadius > 1) {
      this.borderRadius = 1;
    }

    this.icon = json.icon;
    this.iconFamily = json.iconFamily;
    this.iconSize = +json.iconSize;
    this.iconColor = json.iconColor;

    this.image = json.image;
    if (json.imgNaturalWidth) {
      this.imgNaturalWidth = json.imgNaturalWidth;
    }
    if (json.imgNaturalHeight) {
      this.imgNaturalHeight = json.imgNaturalHeight;
    }
    if (json.imageWidth) {
      this.imageWidth = json.imageWidth;
    }
    if (json.imageHeight) {
      this.imageHeight = json.imageHeight;
    }
    this.imageRatio = json.imageRatio;
    this.imageAlign = json.imageAlign;

    this.paddingTop = json.paddingTop || 0;
    this.paddingBottom = json.paddingBottom || 0;
    this.paddingLeft = json.paddingLeft || 0;
    this.paddingRight = json.paddingRight || 0;

    this.text = json.text;
    if (json.textMaxLine) {
      this.textMaxLine = +json.textMaxLine || 0;
    }

    if (json.children && json.children[0] && json.children[0].parentRect) {
      this.paddingLeft = json.children[0].parentRect.offsetX;
      this.paddingRight = 0;
      this.paddingTop = json.children[0].parentRect.offsetY;
      this.paddingBottom = 0;
    }

    if (json.parentRect) {
      this.rectInParent = {
        x: json.parentRect.x * 100 + '%',
        y: json.parentRect.y * 100 + '%',
        width: json.parentRect.width * 100 + '%',
        height: json.parentRect.height * 100 + '%',
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        rotate: json.parentRect.rotate
      };
      this.paddingTop = json.parentRect.marginY;
      this.paddingBottom = json.parentRect.marginY;
      this.paddingLeft = json.parentRect.marginX;
      this.paddingRight = json.parentRect.marginX;
    }
    if (json.rectInParent) {
      this.rectInParent = json.rectInParent;
    }
    if (json.animateFrames) {
      this.animateFrames = json.animateFrames;
    }
    if (json.animateDuration) {
      this.animateDuration = json.animateDuration;
    }
    this.animateType = json.animateType ? json.animateType : json.animateDuration ? '8' : '';
    this.init();

    this.setChild(json);
  }

  static cloneState(json: any) {
    const n = new Node(json);
    delete n.animateFrames;
    return n;
  }

  init() {
    this.calcAbsPadding();

    // Calc rect of text.
    if (textRectFns[this.name]) {
      textRectFns[this.name](this);
    } else {
      defaultTextRect(this);
    }

    // Calc rect of icon.
    if (iconRectFns[this.name]) {
      iconRectFns[this.name](this);
    } else {
      defaultIconRect(this);
    }

    this.calcAnchors();
  }

  calcAbsPadding() {
    this.paddingLeftNum = abs(this.rect.width, this.paddingLeft);
    this.paddingRightNum = abs(this.rect.width, this.paddingRight);
    this.paddingTopNum = abs(this.rect.height, this.paddingTop);
    this.paddingBottomNum = abs(this.rect.height, this.paddingBottom);
  }

  setChild(json: any) {
    if (!json.children) {
      return;
    }

    this.children = [];
    for (let i = 0; i < json.children.length; ++i) {
      const child = new Node(json.children[i]);
      child.parentId = this.id;
      child.calcChildRect(this);
      child.init();
      child.setChild(json.children[i]);
      this.children.push(child);
    }
  }

  // 根据父节点rect计算自己（子节点）的rect
  calcChildRect(parent: Node) {
    const parentW = parent.rect.width - parent.paddingLeftNum - parent.paddingRightNum;
    const parentH = parent.rect.height - parent.paddingTopNum - parent.paddingBottomNum;
    let x =
      parent.rect.x +
      parent.paddingLeftNum +
      abs(parentW, this.rectInParent.x) +
      abs(parentW, this.rectInParent.marginLeft);
    let y =
      parent.rect.y +
      parent.paddingTopNum +
      abs(parentH, this.rectInParent.y) +
      abs(parentW, this.rectInParent.marginTop);
    const w = abs(parentW, this.rectInParent.width);
    const h = abs(parentH, this.rectInParent.height);
    if (this.rectInParent.marginLeft === undefined && this.rectInParent.marginRight) {
      x -= abs(parentW, this.rectInParent.marginRight);
    }
    if (this.rectInParent.marginTop === undefined && this.rectInParent.marginBottom) {
      y -= abs(parentW, this.rectInParent.marginBottom);
    }
    this.rect = new Rect(x, y, w, h);

    if (!this.rectInParent.rotate) {
      this.rectInParent.rotate = 0;
    }
    this.rotate = this.rectInParent.rotate + parent.rotate + parent.offsetRotate;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!drawNodeFns[this.name]) {
      return;
    }

    // Draw shape.
    drawNodeFns[this.name](ctx, this);

    // DrawBk
    switch (this.bkType) {
      case 1:
        this.drawBkImg(ctx);
        break;
      case 2:
        this.drawBkLinearGradient(ctx);
        break;
      case 3:
        this.drawBkRadialGradient(ctx);
        break;
    }
    this.drawBkImg(ctx);

    // Draw text.
    if (this.name !== 'text' && this.text) {
      ctx.save();
      ctx.shadowColor = '';
      ctx.shadowBlur = 0;
      text(ctx, this);
      ctx.restore();
    }

    // Draw image.
    if (this.image) {
      this.drawImg(ctx);
      return;
    }

    // Draw icon
    if (this.icon) {
      ctx.save();
      ctx.shadowColor = '';
      ctx.shadowBlur = 0;
      iconfont(ctx, this);
      ctx.restore();
    }
  }

  drawBkImg(ctx: CanvasRenderingContext2D) {
    if (!this.bkImage) {
      return;
    }

    if (this.lastBkImage !== this.bkImage) {
      this.bkImg = null;
    }
    if (this.bkImg) {
      // console.log(123123);
      return;
    }

    this.bkImg = new Image();
    this.bkImg.crossOrigin = 'anonymous';
    this.bkImg.src = this.bkImage || '/assets/img/favicon.ico';
    this.bkImg.onload = () => {
      this.lastBkImage = this.bkImage;
      this.bkImgNaturalWidth = this.bkImg.naturalWidth;
      this.bkImgNaturalHeight = this.bkImg.naturalHeight;
      this.drawBkImg(ctx);
      this.emitRender();
    };
  }

  drawBkLinearGradient(ctx: CanvasRenderingContext2D) {}
  drawBkRadialGradient(ctx: CanvasRenderingContext2D) {}

  drawImg(ctx: CanvasRenderingContext2D) {
    if (this.lastImage !== this.image) {
      this.img = null;
    }

    if (this.img) {
      ctx.save();
      ctx.shadowColor = '';
      ctx.shadowBlur = 0;

      const rect = this.getIconRect().clone();
      const w = rect.width;
      const h = rect.height;
      if (this.imageWidth) {
        rect.width = this.imageWidth;
      }
      if (this.imageHeight) {
        rect.height = this.imageHeight;
      }
      if (this.imageRatio) {
        if (this.imageWidth) {
          rect.height = (this.imgNaturalHeight / this.imgNaturalWidth) * rect.width;
        } else {
          rect.width = (this.imgNaturalWidth / this.imgNaturalHeight) * rect.height;
        }
      }
      if (this.name !== 'image') {
        rect.x += (w - rect.width) / 2;
        rect.y += (h - rect.height) / 2;
      }

      ctx.drawImage(this.img, rect.x, rect.y, rect.width, rect.height);
      ctx.restore();

      this.emitRender();
      return;
    }

    // Load image and draw it.
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = this.image;
    this.img.onload = () => {
      this.lastImage = this.image;
      this.imgNaturalWidth = this.img.naturalWidth;
      this.imgNaturalHeight = this.img.naturalHeight;
      this.drawImg(ctx);
    };
  }

  emitRender() {
    Store.set('render', 1);
  }

  calcAnchors() {
    this.anchors = [];
    if (anchorsFns[this.name]) {
      anchorsFns[this.name](this);
    } else {
      defaultAnchors(this);
    }

    this.calcRotateAnchors();
  }

  calcRotateAnchors(angle?: number) {
    if (angle === undefined) {
      angle = this.rotate;
    }
    this.rotatedAnchors = [];
    for (const item of this.anchors) {
      this.rotatedAnchors.push(item.clone().rotate(angle, this.rect.center));
    }
  }

  getTextRect() {
    let textRect = this.textRect;
    if (!this.icon && !this.image) {
      textRect = this.fullTextRect;
    }

    return textRect;
  }

  getIconRect() {
    let rect = this.iconRect;
    if (!this.text) {
      rect = this.fullIconRect || this.fullTextRect || this.rect;
    }

    return rect;
  }

  getDockWatchers() {
    this.dockWatchers = this.rect.toPoints();
    this.dockWatchers.unshift(this.rect.center);
  }

  clearImg() {
    this.img = null;
    this.bkImg = null;
  }

  updateAnimateProps() {
    let passed = 0;
    for (let i = 0; i < this.animateFrames.length; ++i) {
      this.animateFrames[i].start = passed;
      passed += this.animateFrames[i].duration;
      this.animateFrames[i].end = passed;
      this.animateFrames[i].initState = Node.cloneState(i ? this.animateFrames[i - 1].state : this);
    }
  }

  animate(ctx: CanvasRenderingContext2D, now: number) {
    let timeline = now - this.animateStart;
    if (timeline > this.animateDuration) {
      if (++this.animateCycleIndex >= this.animateCycle && this.animateCycle > 0) {
        this.animateStart = 0;
        this.animateCycleIndex = 0;
        const item = this.animateFrames[this.animateFrames.length - 1];
        this.dash = item.state.dash;
        this.strokeStyle = item.state.strokeStyle;
        this.fillStyle = item.state.fillStyle;
        this.font = item.state.font;

        this.lineWidth = item.state.lineWidth;
        this.rotate = item.state.rotate;
        this.globalAlpha = item.state.globalAlpha;
        if (item.state.rect && item.state.rect.width) {
          this.rect = new Rect(item.state.rect.x, item.state.rect.y, item.state.rect.width, item.state.rect.height);
          this.init();
        }
        Store.set('animateEnd', {
          type: 'node',
          data: this
        });
        return this.nextAnimate;
      }
      this.animateStart = now;
      timeline = 0;
      this.animateFrames[0].initState = Node.cloneState(this);
    }

    let rectChanged = false;
    for (let i = 0; i < this.animateFrames.length; ++i) {
      const item = this.animateFrames[i];
      if (timeline >= item.start && timeline < item.end) {
        this.dash = item.state.dash;
        this.strokeStyle = item.state.strokeStyle;
        this.fillStyle = item.state.fillStyle;
        this.font = item.state.font;

        const rate = (timeline - item.start) / item.duration;

        if (item.linear) {
          if (item.state.rect.x !== item.initState.rect.x) {
            this.rect.x = item.initState.rect.x + (item.state.rect.x - item.initState.rect.x) * rate;
            rectChanged = true;
          }
          if (item.state.rect.y !== item.initState.rect.y) {
            this.rect.y = item.initState.rect.y + (item.state.rect.y - item.initState.rect.y) * rate;
            rectChanged = true;
          }
          if (item.state.rect.width !== item.initState.rect.width) {
            this.rect.width = item.initState.rect.width + (item.state.rect.width - item.initState.rect.width) * rate;
            rectChanged = true;
          }
          if (item.state.rect.height !== item.initState.rect.height) {
            this.rect.height =
              item.initState.rect.height + (item.state.rect.height - item.initState.rect.height) * rate;
            rectChanged = true;
          }
          this.rect.ex = this.rect.x + this.rect.width;
          this.rect.ey = this.rect.y + this.rect.height;
          this.rect.calceCenter();

          if (item.initState.z !== undefined && item.state.z !== item.initState.z) {
            this.z = item.initState.z + (item.state.z - item.initState.z) * rate;
            rectChanged = true;
          }

          if (item.state.borderRadius !== item.initState.borderRadius) {
            this.borderRadius =
              item.initState.borderRadius + (item.state.borderRadius - item.initState.borderRadius) * rate;
          }

          if (item.state.lineWidth !== item.initState.lineWidth) {
            this.lineWidth = item.initState.lineWidth + (item.state.lineWidth - item.initState.lineWidth) * rate;
          }

          if (item.state.rotate !== item.initState.rotate) {
            this.rotate = item.initState.rotate + (item.state.rotate - item.initState.rotate) * rate;
            rectChanged = true;
          }

          if (item.state.globalAlpha !== item.initState.globalAlpha) {
            this.globalAlpha =
              item.initState.globalAlpha + (item.state.globalAlpha - item.initState.globalAlpha) * rate;
          }
        } else {
          this.rect = item.state.rect;
          this.lineWidth = item.state.lineWidth;
          this.rotate = item.state.rotate;
          this.globalAlpha = item.state.globalAlpha;
        }
      }
    }
    if (rectChanged) {
      this.init();
      Store.set('nodeMovedInAnimate', this);
    }

    this.render(ctx);
  }

  scale(scale: number, center?: Point) {
    if (!center) {
      center = this.rect.center;
    }
    this.rect.x = center.x - (center.x - this.rect.x) * scale;
    this.rect.y = center.y - (center.y - this.rect.y) * scale;
    this.rect.width *= scale;
    this.rect.height *= scale;
    if (this.imageWidth) {
      this.imageWidth *= scale;
    }
    if (this.imageHeight) {
      this.imageHeight *= scale;
    }
    this.font.fontSize *= scale;
    this.iconSize *= scale;
    this.rect.ex = this.rect.x + this.rect.width;
    this.rect.ey = this.rect.y + this.rect.height;
    this.rect.calceCenter();
    this.init();

    if (this.children) {
      for (const item of this.children) {
        item.scale(scale, center);
      }
    }
  }

  round() {
    this.rect.round();
    if (this.children) {
      for (const item of this.children) {
        item.rect.round();
      }
    }
  }
}

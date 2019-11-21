import { Pen } from './pen';
import { Rect } from './rect';
import { Point } from './point';
import { anchorsFns, iconRectFns, textRectFns, drawNodeFns } from '../middles';
import { defaultAnchors } from '../middles/default.anchor';
import { defaultIconRect, defaultTextRect } from '../middles/default.rect';
import { text, iconfont } from '../middles/nodes/text';
import { Store } from 'le5le-store';
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
  imageAlign: string;
  img: HTMLImageElement;

  // 0 - 纯色；1 - 线性渐变；2 - 径向渐变
  bkType: number;
  gradientFromColor: string;
  gradientToColor: string;
  gradientAngle: number;
  gradientRadius: number;

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
  // Can selected as child.
  stand: boolean;
  children: Node[];
  // Has stand children
  childStand: boolean;

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

  gif: boolean;
  video: string;
  audio: string;
  // 0 - 人工播放；1 - auto自动播放；2 - animate play
  play: number;
  playLoop: boolean;
  iframe: string;
  nextPlay: string;

  private imgLoaded = false;
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
    this.imageAlign = json.imageAlign || 'center';

    this.bkType = json.bkType;
    this.gradientFromColor = json.gradientFromColor;
    this.gradientToColor = json.gradientToColor;
    this.gradientAngle = json.gradientAngle || 0;
    this.gradientRadius = json.gradientRadius || 0.01;

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
    this.childStand = json.childStand;
    this.stand = json.stand;
    if (json.rectInParent) {
      this.rectInParent = json.rectInParent;
    }
    if (json.animateFrames) {
      this.animateFrames = json.animateFrames;
    }
    if (json.animateDuration) {
      this.animateDuration = json.animateDuration;
    }
    this.animateType = json.animateType ? json.animateType : json.animateDuration ? 'custom' : '';

    this.iframe = json.iframe;
    this.audio = json.audio;
    this.video = json.video;
    this.play = json.play;
    this.nextPlay = json.nextPlay;

    this.init();

    this.setChild(json.children);
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

    if (this.audio || this.video || this.iframe || this.gif) {
      Store.set('LT:addDiv', this);
    }
  }

  calcAbsPadding() {
    this.paddingLeftNum = abs(this.rect.width, this.paddingLeft);
    this.paddingRightNum = abs(this.rect.width, this.paddingRight);
    this.paddingTopNum = abs(this.rect.height, this.paddingTop);
    this.paddingBottomNum = abs(this.rect.height, this.paddingBottom);
  }

  setChild(children: any[]) {
    if (!children) {
      return;
    }

    this.children = [];
    for (let i = 0; i < children.length; ++i) {
      const child = new Node(children[i]);
      child.parentId = this.id;
      child.calcChildRect(this);
      child.init();
      child.setChild(children[i]);
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

    // DrawBk
    switch (this.bkType) {
      case 1:
        this.drawBkLinearGradient(ctx);
        break;
      case 2:
        this.drawBkRadialGradient(ctx);
        break;
    }

    // Draw shape.
    drawNodeFns[this.name](ctx, this);

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

  drawBkLinearGradient(ctx: CanvasRenderingContext2D) {
    const from = new Point(this.rect.x, this.rect.center.y);
    const to = new Point(this.rect.ex, this.rect.center.y);
    if (this.gradientAngle) {
      from.rotate(this.gradientAngle, this.rect.center);
      to.rotate(this.gradientAngle, this.rect.center);
    }

    // contributor: https://github.com/sunnyguohua/topology
    const grd = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    grd.addColorStop(0, this.gradientFromColor);
    grd.addColorStop(1, this.gradientToColor);
    ctx.fillStyle = grd;
  }

  drawBkRadialGradient(ctx: CanvasRenderingContext2D) {
    let r = this.rect.width;
    if (r < this.rect.height) {
      r = this.rect.height;
    }
    r *= 0.5;
    const grd = ctx.createRadialGradient(
      this.rect.center.x,
      this.rect.center.y,
      r * this.gradientRadius,
      this.rect.center.x,
      this.rect.center.y,
      r
    );
    grd.addColorStop(0, this.gradientFromColor);
    grd.addColorStop(1, this.gradientToColor);

    ctx.fillStyle = grd;
  }

  drawImg(ctx: CanvasRenderingContext2D) {
    if (this.lastImage !== this.image) {
      this.img = null;
      Store.set('LT:clearImg', this);
    }

    if (this.img) {
      ctx.save();
      ctx.shadowColor = '';
      ctx.shadowBlur = 0;

      const rect = this.getIconRect();
      let x = rect.x;
      let y = rect.y;
      let w = rect.width;
      let h = rect.height;
      if (this.imageWidth) {
        w = this.imageWidth;
      }
      if (this.imageHeight) {
        h = this.imageHeight;
      }
      if (this.imageRatio) {
        if (this.imageWidth) {
          h = (this.imgNaturalHeight / this.imgNaturalWidth) * w;
        } else {
          w = (this.imgNaturalWidth / this.imgNaturalHeight) * h;
        }
      }
      if (this.name !== 'image') {
        x += (rect.width - w) / 2;
        y += (rect.height - h) / 2;
      }
      switch (this.imageAlign) {
        case 'top':
          y = rect.y;
          break;
        case 'bottom':
          y = rect.ey - h;
          break;
        case 'left':
          x = rect.x;
          break;
        case 'right':
          x = rect.ex - w;
          break;
        case 'left-top':
          x = rect.x;
          y = rect.y;
          break;
        case 'right-top':
          x = rect.ex - w;
          y = rect.y;
          break;
        case 'left-bottom':
          x = rect.x;
          y = rect.ey - h;
          break;
        case 'right-bottom':
          x = rect.ex - w;
          y = rect.ey - h;
          break;
      }
      ctx.drawImage(this.img, x, y, w, h);
      ctx.restore();

      if (!this.imgLoaded) {
        this.imgLoaded = true;
        Store.set('LT:render', true);
      }

      return;
    }

    // Load image and draw it.
    this.img = new Image();
    this.img.crossOrigin = 'anonymous';
    this.img.src = this.image;
    if (!this.gif && this.image.indexOf('.gif') > 0) {
      this.gif = true;
      Store.set('LT:addDiv', this);
    }
    this.img.onload = () => {
      this.imgLoaded = false;
      this.lastImage = this.image;
      this.imgNaturalWidth = this.img.naturalWidth;
      this.imgNaturalHeight = this.img.naturalHeight;
      this.drawImg(ctx);
    };
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

  calcRectInParent(parent: Node) {
    this.rectInParent = {
      x: ((this.rect.x - parent.rect.x) / parent.rect.width) * 100 + '%',
      y: ((this.rect.y - parent.rect.y) / parent.rect.height) * 100 + '%',
      width: (this.rect.width / parent.rect.width) * 100 + '%',
      height: (this.rect.height / parent.rect.height) * 100 + '%',
      rotate: this.rotate
    };
  }

  getDockWatchers() {
    this.dockWatchers = this.rect.toPoints();
    this.dockWatchers.unshift(this.rect.center);
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

  animate(now: number) {
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
        this.round();
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
      Store.set('nodeRectChanged', this);
    }
  }

  scale(scale: number, center?: Point) {
    if (!center) {
      center = this.rect.center;
    }
    this.rect.x = center.x - (center.x - this.rect.x) * scale;
    this.rect.y = center.y - (center.y - this.rect.y) * scale;
    this.rect.width *= scale;
    this.rect.height *= scale;
    this.rect.ex = this.rect.x + this.rect.width;
    this.rect.ey = this.rect.y + this.rect.height;
    if (this.imageWidth) {
      this.imageWidth *= scale;
    }
    if (this.imageHeight) {
      this.imageHeight *= scale;
    }
    this.font.fontSize *= scale;
    this.iconSize *= scale;
    this.rect.calceCenter();

    if (this.animateFrames) {
      for (const item of this.animateFrames) {
        if (item.state) {
          item.state = new Node(item.state);
          item.state.scale(scale, center);
        }
      }
    }

    this.init();

    if (this.children) {
      for (const item of this.children) {
        item.scale(scale, center);
      }
    }
  }

  translate(x: number, y: number) {
    this.rect.x += x;
    this.rect.y += y;
    this.rect.ex = this.rect.x + this.rect.width;
    this.rect.ey = this.rect.y + this.rect.height;
    this.rect.calceCenter();

    if (this.animateFrames) {
      for (const frame of this.animateFrames) {
        if (frame.state) {
          frame.state.rect.x += x;
          frame.state.rect.y += y;
          frame.state.rect.ex = frame.state.rect.x + frame.state.rect.width;
          frame.state.rect.ey = frame.state.rect.y + frame.state.rect.height;
        }
      }
    }

    this.init();

    if (this.children) {
      for (const item of this.children) {
        item.translate(x, y);
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

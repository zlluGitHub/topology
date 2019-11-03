import { Rect } from 'topology-core/models/rect';
import { Point } from 'topology-core/models/point';
import { Node } from 'topology-core/models/node';

export interface Props {
  type: string;
  data?: {
    id?: string;
    name?: string;
    dash: number;
    lineWidth: number;
    strokeStyle: string;
    fillStyle: string;
    bkType: number;
    gradientFromColor: string;
    gradientToColor: string;
    gradientAngle: number;
    gradientRadius: number;
    globalAlpha: number;
    rotate: number;
    font: {
      color: string;
      fontFamily: string;
      fontSize: number;
      fontStyle: string;
      fontWeight: string;
      lineHeight: number;
      textAlign: CanvasTextAlign;
      textBaseline: CanvasTextBaseline;
    };
    animateStart?: number;
    animateCycle: number;
    animateColor: string;
    animateSpan: number;
    animateType?: string;
    animateDuration?: number;
    animateFrames?: {
      duration: number;
      linear: boolean;
      state: Node;
    }[];
    nextAnimate?: string;
    tags: string[];
    data?: any;

    // Node
    rect?: Rect;
    is3D?: boolean;
    z?: number;
    zRotate?: number;
    borderRadius?: number;
    icon?: string;
    iconFamily?: string;
    iconSize?: number;
    iconColor?: string;
    image?: string;
    imgNaturalWidth?: number;
    imgNaturalHeight?: number;
    imageWidth?: number;
    imageHeight?: number;
    imageRatio?: boolean;
    imageAlign?: string;
    text?: string;
    textMaxLine?: number;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    // End

    // Line
    from?: Point;
    to?: Point;
    fromArrow?: string;
    toArrow?: string;
    // End

    dirty?: boolean;
  };
}

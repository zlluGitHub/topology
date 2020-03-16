export enum KeyType {
  None = -1,
  CtrlOrAlt,
  Ctrl,
  Shift,
  Alt
}

export enum KeydownType {
  None = -1,
  Document,
  Canvas,
}

export interface Options {
  extDpiRatio?: number;
  width?: string | number;
  height?: string | number;
  color?: string;
  activeColor?: string;
  hoverColor?: string;
  dragColor?: string;
  animateColor?: string;
  font?: {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    textAlign?: string;
    textBaseline?: string;
  };
  rotateCursor?: string;
  hideInput?: boolean;
  hideRotateCP?: boolean;
  hideSizeCP?: boolean;
  disableEmptyLine?: boolean;
  disableScale?: boolean;
  playIcon?: string;
  pauseIcon?: string;
  fullScreenIcon?: string;
  loopIcon?: string;
  translateKey?: KeyType;
  scaleKey?: KeyType;
  minScale?: number;
  maxScale?: number;
  keydown?: KeydownType;
  on?: (event: string, data: any) => void;
}

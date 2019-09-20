export interface Options {
  width?: string | number;
  height?: string | number;
  color?: string;
  activeColor?: string;
  hoverColor?: string;
  dragColor?: string;
  font?: {
    color: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    textAlign: string;
    textBaseline: string;
  };
  rotateCursor?: string;
  hideInput?: boolean;
  hideRotateCP?: boolean;
  disableEmptyLine?: boolean;
  on?: (event: string, data: any) => void;
}

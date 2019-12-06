import { Node } from './node';
import { Line } from './line';
import { Lock } from './status';

export class TopologyData {
  nodes: Node[] = [];
  lines: Line[] = [];
  lineName = 'curve';
  fromArrowType = '';
  toArrowType = 'triangleSolid';
  scale = 1;
  locked = Lock.None;
  constructor(json?: any) {
    if (json) {
      this.nodes = [];
      for (const item of json.nodes) {
        this.nodes.push(new Node(item));
      }
      this.lines = [];
      for (const item of json.lines) {
        this.lines.push(new Line(item));
      }
      this.lineName = json.lineName || 'curve';
      this.fromArrowType = json.fromArrowType || '';
      this.toArrowType = json.toArrowType || 'triangleSolid';
      this.scale = json.scale || 1;
      this.locked = json.locked || Lock.None;
    }
  }
}

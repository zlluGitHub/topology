import { Topology } from 'topology-core';
import { registerNode } from 'topology-core/middles';
import { Pen } from 'topology-core/models/pen';
import { Node } from 'topology-core/models/node';
import { Point } from 'topology-core/models/point';
import { Line } from 'topology-core/models/line';
import { Rect } from 'topology-core/models/rect';
import { Store, Observer } from 'le5le-store';
import { s8 } from 'topology-core/uuid/uuid';

import { register as registerFlow } from 'topology-flow-diagram';
import { register as registerActivity } from 'topology-activity-diagram';
import { register as registerClass } from 'topology-class-diagram';
import { register as registerSequence } from 'topology-sequence-diagram';
import { register as registerChart } from 'topology-chart-diagram';

registerFlow();
registerActivity();
registerClass();
registerSequence();
registerChart();

(window as any).Le5leTopology = {
  Topology,
  registerNode,
  Pen,
  Node,
  Point,
  Line,
  Rect,
  Store,
  Observer,
  s8
};

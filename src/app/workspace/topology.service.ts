import { Injectable } from '@angular/core';
import { register as registerFlow } from 'topology-flow-diagram';
import { register as registerActivity } from 'topology-activity-diagram';
import { register as registerClass } from 'topology-class-diagram';
import { register as registerSequence } from 'topology-sequence-diagram';
import { register as registerChart } from 'topology-chart-diagram';

@Injectable()
export class TopologyService {

  constructor() { }

  canvasRegister() {
    registerFlow();
    registerActivity();
    registerClass();
    registerSequence();
    registerChart();
  }
}

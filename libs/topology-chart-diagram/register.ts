import { registerNode } from 'topology-core/middles';
import { loadJS } from 'topology-core/utils';
import {
  antvG2
} from './g2';


export function register() {
  if (!(window as any).G2) {
    loadJS('https://gw.alipayobjects.com/os/lib/antv/g2/3.5.8/dist/g2.min.js');
  }
  registerNode('antvG2', antvG2, null, null, null);
}

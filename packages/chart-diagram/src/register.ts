import { registerNode, loadJS } from '@topology/core';
import {
  echarts
} from './echarts';

export function register() {
  if (!(window as any).echarts) {
    loadJS('https://cdn.bootcss.com/echarts/4.3.0/echarts.min.js', null, true);
  }
  registerNode('echarts', echarts, null, null, null);
}

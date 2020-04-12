import { Node } from 'topology-core/models/node';
import { rectangle } from 'topology-core/middles/nodes/rectangle';
import { s8 } from 'topology-core/utils/uuid';
import { createDiv } from 'topology-core/utils/dom';

const echartsData: any = {};

export function echarts(ctx: CanvasRenderingContext2D, node: Node) {
  // 绘制一个底图，类似于占位符。
  rectangle(ctx, node);

  // tslint:disable-next-line:no-shadowed-variable
  const echarts = (window as any).echarts;
  if (!node.data || !echarts) {
    return;
  }

  if (typeof node.data === 'string') {
    node.data = JSON.parse(node.data);
  }

  if (!node.data.echarts) {
    return;
  }

  if (!node.elementId) {
    node.elementId = s8();
  }

  if (!node.elementLoaded) {
    echartsData[node.id] = {
      div: createDiv(node)
    };
    node.elementLoaded = true;
    document.body.appendChild(echartsData[node.id].div);
    // 添加当前节点到div层
    node.addToDiv();
    echartsData[node.id].chart = echarts.init(echartsData[node.id].div, node.data.echarts.theme);
    node.elementRendered = false;

    // 等待父div先渲染完成，避免初始图表控件太大
    setTimeout(() => {
      echartsData[node.id].chart.resize();
    });
  }

  if (!node.elementRendered) {
    // 初始化时，等待父div先渲染完成，避免初始图表控件太大。
    setTimeout(() => {
      echartsData[node.id].chart.setOption(node.data.echarts.option);
      echartsData[node.id].chart.resize();
      node.elementRendered = true;
    });
  }
}

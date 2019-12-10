import { Node } from 'topology-core/models/node';
import { rectangle } from 'topology-core/middles/nodes/rectangle';
import { s8 } from 'topology-core/uuid/uuid';
import { createDiv } from 'topology-core/utils';

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
    node.elementLoaded = {
      div: createDiv(node)
    };
    document.body.appendChild(node.elementLoaded.div);
    // 添加当前节点到div层
    node.addToDiv();
    node.elementLoaded.chart = echarts.init(node.elementLoaded.div, node.data.echarts.theme);
    node.elementRendered = false;

    // 等待父div先渲染完成，避免初始图表控件太大
    setTimeout(() => {
      node.elementLoaded.chart.resize();
    });
  }

  if (!node.elementRendered) {
    // 初始化时，等待父div先渲染完成，避免初始图表控件太大。
    setTimeout(() => {
      node.elementLoaded.chart.setOption(node.data.echarts.option);
      node.elementLoaded.chart.resize();
      node.elementRendered = true;
    });
  }
}

import { Node } from 'topology-core/models/node';
import { rectangle } from 'topology-core/middles/nodes/rectangle';
import { s8 } from 'topology-core/uuid/uuid';
import { createDiv } from 'topology-core/utils';

export function antvG2(ctx: CanvasRenderingContext2D, node: Node) {
  rectangle(ctx, node);

  const G2 = (window as any).G2;
  if (!node.data || !G2) {
    return;
  }

  if (typeof node.data === 'string') {
    node.data = JSON.parse(node.data);
  }

  if (!node.data.g2) {
    return;
  }

  if (!node.elementId) {
    node.elementId = s8();
  }

  if (!node.elementLoaded) {
    node.elementLoaded = {
      div: createDiv(node)
    };
    node.elementLoaded.chart = new G2.Chart({
      container: node.elementId,
      forceFit: true,
      height: node.rect.height,
      renderer: node.data.g2.renderer
    });
    node.elementLoaded.chart.source(node.data.g2.data);
    for (const item of node.data.g2.fns) {
      node.elementLoaded.chart[item.name](item.params);
    }
    node.elementLoaded.chart.render();
    node.elementRendered = true;
  }

  if (!node.elementRendered) {
    node.elementLoaded.chart.changeData(node.data.g2.data);
  }
}

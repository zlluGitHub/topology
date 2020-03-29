import { Pen } from 'topology-core/models/pen';
import { Node } from 'topology-core/models/node';
import { Rect } from 'topology-core/models/rect';

export function alignNodes(pens: Pen[], rect: Rect, align: string) {
  for (const item of pens) {
    if (!(item instanceof Node)) {
      continue;
    }
    switch (align) {
      case 'left':
        item.rect.x = rect.x;
        break;
      case 'right':
        item.rect.x = rect.ex - item.rect.width;
        break;
      case 'top':
        item.rect.y = rect.y;
        break;
      case 'bottom':
        item.rect.y = rect.ey - item.rect.height;
        break;
      case 'center':
        item.rect.x = rect.center.x - item.rect.width / 2;
        break;
      case 'middle':
        item.rect.y = rect.center.y - item.rect.height / 2;
        break;
    }

    item.rect.floor();
    item.rect.calceCenter();
    item.init();
    item.clacChildrenRect();
  }
}

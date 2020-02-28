import { Component, Input, OnInit } from '@angular/core';
import { Topology } from 'topology-core';
import { Clipboard } from 'ts-clipboard';
import { Props } from '../props/props.model';
import { NoticeService } from 'le5le-components/notice';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
  @Input() canvas: Topology;
  @Input() selected: Props;
  @Input() selections: any;
  @Input() locked = false;
  @Input() contextmenu: any;

  constructor() { }

  ngOnInit() {
  }

  onTop() {
    if (!this.selections) {
      return;
    }
    for (const item of this.selections) {
      this.canvas.top(item);
    }
    this.canvas.render();
  }

  onBottom() {
    if (!this.selections) {
      return;
    }
    for (const item of this.selections) {
      this.canvas.bottom(item);
    }
    this.canvas.render();
  }

  onCombine(stand: boolean) {
    if (!this.selections || this.selections.length < 2) {
      return;
    }

    this.canvas.combine(this.selections, stand);
  }

  onUncombine() {
    if (!this.selections || this.selections.length > 1) {
      return;
    }
    this.canvas.uncombine(this.selections[0]);
    this.canvas.render();
  }

  onLock() {
    this.locked = !this.locked;
    if (this.selected.type === 'multi') {
      if (this.selected.data.nodes) {
        for (const item of this.selected.data.nodes) {
          item.locked = this.locked;
        }
      }
      if (this.selected.data.lines) {
        for (const item of this.selected.data.lines) {
          item.locked = this.locked;
        }
      }
    } else {
      this.selected.data.locked = this.locked;
      // this.readonly = this.locked;
    }
    this.canvas.render(true);
  }

  onDel() {
    this.canvas.delete();
  }

  onCopyImage() {
    if (!this.selections || this.selections.length > 1 || !this.selections[0].image) {
      return;
    }

    Clipboard.copy(this.selections[0].image);
    const _noticeService: NoticeService = new NoticeService();
    _noticeService.notice({
      body: `图片地址已复制：${this.selections[0].image}`,
      theme: 'success'
    });
  }
}

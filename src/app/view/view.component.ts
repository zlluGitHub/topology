import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Topology, Rect } from 'topology-core';

import { ViewService } from './view.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [ViewService]
})
export class ViewComponent implements OnInit, OnDestroy {
  id = '';
  version = '';
  locked = 1;
  back = false;
  hideTool = false;
  data: any;
  rect: Rect;
  canvas: Topology;
  subRoute: any;
  constructor(
    private service: ViewService,
    private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    setTimeout(() => {
      this.canvas = new Topology('topology-canvas');
      this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
        this.id = params.get('id');
        this.version = params.get('version') || '';
        this.locked = +params.get('locked') || 1;
        this.back = !!params.get('r');
        this.hideTool = params.get('tool') != '0';
        this.open();
      });

      // For debug
      (window as any).canvas = this.canvas;
      // End
    });
  }


  async open() {
    this.data = await this.service.Get({
      id: this.id,
      version: this.version
    });
    this.data.data.locked = this.locked;
    this.canvas.open(this.data.data);
    this.rect = this.canvas.getRect();
  }

  onBack() {
    history.back();
  }

  onSizeWindow() {
    const w = document.body.clientWidth - 100;
    const h = document.body.clientHeight - 100;
    if (this.rect.height * w / this.rect.width > h) {
      this.canvas.scaleTo(h / this.rect.height);
    } else {
      this.canvas.scaleTo(w / this.rect.width);
    }
    const r = this.canvas.getRect();
    this.canvas.translate(document.body.clientWidth / 2 - r.center.x, document.body.clientHeight / 2 - r.center.y);
  }

  onSizeOri() {
    this.canvas.open(this.data.data);
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
  }
}

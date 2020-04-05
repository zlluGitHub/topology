import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Topology } from 'topology-core';

@Component({
  selector: 'app-file-props',
  templateUrl: './fileProps.component.html',
  styleUrls: ['./fileProps.component.scss']
})
export class FilePropsComponent implements OnInit {
  @Input() canvas: Topology;
  @Input() data: any = {};

  @Output() gridChange = new EventEmitter<any>();

  show: any = {};
  cpPresetColors = [
    '#1890ff',
    '#096dd9',
    '#bae7ff',
    '#52c41a',
    '#3fad09',
    '#c6ebb4',
    '#faad14',
    '#d9a116',
    '#fff6dd',
    '#f50000',
    '#ff0000',
    '#ffc2c5',
    '#fa541c',
    '#531dab',
    '#314659',
    '#777777'
  ];
  constructor() { }

  ngOnInit() {
  }

  onGrid() {
    this.canvas.data.grid = !this.canvas.data.grid;
    this.gridChange.emit(this.canvas.data.grid);
  }

  onChangeBkImage() {
    this.canvas.clearBkImg();
    this.canvas.render();
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-props',
  templateUrl: './fileProps.component.html',
  styleUrls: ['./fileProps.component.scss']
})
export class FilePropsComponent implements OnInit {
  @Input() data: any = {};

  @Input() gridSize = 0;
  @Output() gridSizeChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  onGrid() {
    this.gridSize = this.gridSize ? 0 : 30;
    this.gridSizeChange.emit(this.gridSize);
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pen-tree-item',
  templateUrl: './tree-item.component.html',
  styleUrls: ['./tree-item.component.scss']
})
export class PenTreeItemComponent implements OnInit {
  @Input() pen: any;
  constructor() { }

  ngOnInit() {
  }

}

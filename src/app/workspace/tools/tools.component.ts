import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ToolsService } from './tools.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss'],
  providers: [ToolsService]
})
export class ToolsComponent implements OnInit, OnDestroy {
  search = '';
  tab = 1;
  search$ = new Subject<string>();
  constructor(private service: ToolsService) {
  }

  ngOnInit() {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(text => {
        this.onSearch(text);
      });
  }

  onSearch(text: string) {

  }

  ngOnDestroy() {
    this.search$.unsubscribe();
  }
}

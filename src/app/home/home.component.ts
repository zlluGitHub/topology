import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [HomeService]
})
export class HomeComponent implements OnInit, OnDestroy {
  search = {
    text: '',
    class: ''
  };
  pageIndex = 1;
  pageCount = 10;
  searched = false;

  configs = {
    bars: [],
    classes: [],
    vision: []
  };

  curBar = 0;
  inBar = false;

  timer: any;
  constructor(private service: HomeService, private router: Router) { }

  async ngOnInit() {

    this.configs = this.service.Configs();

    this.timer = setInterval(() => {
      if (this.configs.bars && this.configs.bars.length && !this.inBar) {
        this.curBar = (this.curBar + 1) % this.configs.bars.length;
      }
    }, 10000);
  }

  onMouseEnter() {
    this.inBar = true;
  }

  onMouseOut() {
    this.inBar = false;
  }



  onOpen(item: any) {
    this.router.navigate(['/workspace'], {
      queryParams: {
        id: item.id
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}

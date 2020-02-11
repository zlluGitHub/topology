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
  constructor(
    private service: HomeService,
    private router: Router
  ) { }

  async ngOnInit() {

    this.configs = this.service.Configs();

    this.timer = setInterval(() => {
      if (this.configs.bars && this.configs.bars.length && !this.inBar) {
        this.curBar = (this.curBar + 1) % this.configs.bars.length;
      }
    }, 10000);

    // this.elementRef.nativeElement.onscroll = (event: Event) => {
    //   this.onScroll(event);
    // };
  }

  // onScroll(event: Event) {
  //   const elem = event.target as HTMLElement;
  //   if (!this.loading && this.next && elem.scrollTop + elem.clientHeight + 100 > elem.scrollHeight) {
  //     ++this.pageIndex;
  //     this.list();
  //   }
  // }

  onMouseEnter() {
    this.inBar = true;
  }

  onMouseOut() {
    this.inBar = false;
  }

  // async list(pageIndex?: number) {
  //   if (pageIndex > 0) {
  //     this.pageIndex = pageIndex;
  //   }

  //   this.loading = true;
  //   const data = await this.service.Topologies(Object.assign({}, this.search, {
  //     pageIndex: this.pageIndex,
  //     pageCount: this.pageCount
  //   }));
  //   this.next = data.list.length === this.pageCount;
  //   if (this.pageIndex === 1) {
  //     this.data.list = [];
  //   }
  //   this.data.list.push.apply(this.data.list, data.list);
  //   this.data.count = data.count;
  //   this.searched = !!this.search.text;
  //   this.loading = false;
  //   Store.set('home-list', this.data.list);
  // }

  onOpen(item: any) {
    this.router.navigate(['/workspace'], {
      queryParams: {
        id: item.id
      }
    });
  }

  // onFavorite(event: MouseEvent, item: any) {
  //   event.stopPropagation();

  //   if (!Store.get('user')) {
  //     const _noticeService: NoticeService = new NoticeService();
  //     _noticeService.notice({
  //       body: '请先登录',
  //       theme: 'error'
  //     });
  //     return;
  //   }

  //   this.service.Favorite(item);
  // }

  // onStar(event: MouseEvent, item: any) {
  //   event.stopPropagation();

  //   if (!Store.get('user')) {
  //     const _noticeService: NoticeService = new NoticeService();
  //     _noticeService.notice({
  //       body: '请先登录',
  //       theme: 'error'
  //     });
  //     return;
  //   }

  //   this.service.Star(item);
  // }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}

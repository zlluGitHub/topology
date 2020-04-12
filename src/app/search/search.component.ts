import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Store } from 'le5le-store';
import { NoticeService } from 'le5le-components/notice';

import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchService]
})
export class SearchComponent implements OnInit, OnDestroy {
  classes: any[] = [];

  search = {
    c: '',
    q: ''
  };
  pageIndex = 1;
  pageCount = 15;
  next = false;

  data = {
    list: [],
    count: 0
  };
  hots: any[] = [];
  loading = true;

  subRoute: any;
  subConfigs: any;
  constructor(
    private service: SearchService,
    private router: Router,
    private activateRoute: ActivatedRoute) {
    window.onscroll = () => {
      this.onScroll();
    };
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
      this.search.c = params.get('c') || '';
      this.search.q = params.get('q') || '';
      this.list(1);
    });

    this.subConfigs = Store.subscribe('app-configs', () => {
      this.classes = Store.get('app-classes');
    });
    this.getHots();
  }

  onScroll() {
    if (!this.loading && this.next && window.pageYOffset + window.innerHeight + 300 > document.body.clientHeight) {
      ++this.pageIndex;
      this.list();
    }
  }

  async list(pageIndex?: number) {
    if (pageIndex > 0) {
      this.pageIndex = pageIndex;
    }

    this.loading = true;
    const data = await this.service.Topologies(Object.assign({}, this.search, {
      pageIndex: this.pageIndex,
      pageCount: this.pageCount
    }));
    this.next = data.list.length === this.pageCount;
    if (this.pageIndex === 1) {
      this.data.list = [];
    }
    this.data.list.push.apply(this.data.list, data.list);
    this.data.count = data.count;
    this.loading = false;
  }

  async getHots() {
    this.hots = (await this.service.Topologies({
      pageIndex: 1,
      pageCount: 10
    })).list;
  }

  onOpen(item: any) {
    this.router.navigate(['/workspace'], {
      queryParams: {
        id: item.id
      }
    });
  }

  onAdd() {
    this.router.navigate(['/workspace'], {
      queryParams: {
        c: this.search.c
      }
    });
  }

  onStar(event: MouseEvent, item: any) {
    event.stopPropagation();

    if (!Store.get('user')) {
      const _noticeService: NoticeService = new NoticeService();
      _noticeService.notice({
        body: '请先登录',
        theme: 'error'
      });
      return;
    }

    this.service.Star(item);
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
    this.subConfigs.unsubscribe();
  }
}

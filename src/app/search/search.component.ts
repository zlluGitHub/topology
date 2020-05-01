import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

  stars: any = {};

  subRoute: any;
  subConfigs: any;
  constructor(
    private service: SearchService,
    private router: Router,
    private activateRoute: ActivatedRoute) {
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

  @HostListener('window:scroll', ['$event'])
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

    const ids: string[] = [];
    for (const item of data.list) {
      this.data.list.push(item);
      ids.push(item.id);
    }

    const user = Store.get('user');
    if (user) {
      const idList = await this.service.StarIds({ ids });
      for (const item of idList) {
        this.stars[item.id] = true;
      }
    }

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

  async onStar(event: MouseEvent, item: any) {
    event.stopPropagation();

    if (!Store.get('user')) {
      const _noticeService: NoticeService = new NoticeService();
      _noticeService.notice({
        body: '请先登录',
        theme: 'error'
      });
      return;
    }

    if (await this.service.Star(item.id, !this.stars[item.id])) {
      if (this.stars[item.id]) {
        this.stars[item.id] = false;
        --item.star;
      } else {
        this.stars[item.id] = true;
        ++item.star;
      }
    }
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
    this.subConfigs.unsubscribe();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Store } from 'le5le-store';
import { NoticeService } from 'le5le-components/notice';

import { UserHomeService } from './home.service';

@Component({
  selector: 'app-user-home',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [UserHomeService]
})
export class UserHomeComponent implements OnInit, OnDestroy {
  search = {
    text: '',
    component: '',
    pageIndex: 1,
    pageCount: 8
  };
  data = {
    list: [],
    count: 0
  };
  loading = true;

  subRoute: any;
  constructor(private service: UserHomeService, private router: Router, private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
      this.search.pageIndex = +params.get('pageIndex') || 1;
      this.search.pageCount = +params.get('pageCount') || 8;
      this.search.component = params.get('component');
      this.list();
    });
  }

  async list(pageIndex?: number) {
    if (pageIndex > 0) {
      this.search.pageIndex = pageIndex;
    }

    this.loading = true;
    this.data = await this.service.Topologies(this.search);
    this.loading = false;

    if (this.search.component) {
      Store.set('user-statistics', { component: this.data.count });
    } else {
      Store.set('user-statistics', { topology: this.data.count });
    }
  }

  onOpen(item: any) {
    this.router.navigate(['/workspace'], {
      queryParams: {
        id: item.id
      }
    });
  }

  onDel(item: any) {
    const _noticeService: NoticeService = new NoticeService();
    _noticeService.dialog({
      title: '提示',
      theme: '',
      body: '确定删除此文件？',
      callback: async (ret: boolean) => {
        if (ret && (await this.service.Del(item.id))) {
          this.list();
          _noticeService.notice({
            body: '已删除文件！',
            theme: 'success'
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
  }
}

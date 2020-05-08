import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from 'le5le-store';
import { NoticeService } from 'le5le-components/notice';

import { UserHistoryService } from './history.service';
import { CoreService } from 'src/app/core/core.service';

@Component({
  selector: 'app-user-history',
  templateUrl: 'history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [UserHistoryService]
})
export class UserHistoryComponent implements OnInit, OnDestroy {
  name = '';
  search = {
    id: '',
    pageIndex: 1,
    pageCount: 10
  };
  data = {
    list: [],
    count: 0
  };
  loading = true;
  next = false;

  user: any;
  subUser: any;
  isVip = false;
  showVip = false;

  desc = '';
  edited: any = {};

  subRoute: any;
  constructor(
    private service: UserHistoryService,
    private activateRoute: ActivatedRoute,
    private coreService: CoreService
  ) { }

  ngOnInit() {
    this.user = Store.get('user');
    this.subUser = Store.subscribe('user', (user: any) => {
      this.user = user;
      this.isVip = this.coreService.isVip(this.user);
    });

    this.isVip = this.coreService.isVip(this.user);

    this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
      this.name = params.get('name');
      this.search.id = params.get('id');
      this.list();
    });
  }

  async list(pageIndex?: number) {
    if (pageIndex > 0) {
      this.search.pageIndex = pageIndex;
    }

    this.loading = true;
    const data = await this.service.List(this.search);
    this.next = data.list.length === this.search.pageCount;
    this.data.list.push.apply(this.data.list, data.list);
    this.data.count = data.count;
    this.loading = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!this.loading && this.next && window.pageYOffset + window.innerHeight + 300 > document.body.clientHeight) {
      ++this.search.pageIndex;
      this.list();
    }
  }

  onEditDesc(event: MouseEvent, item: any) {
    event.stopPropagation();

    this.desc = item.desc;
    item.edited = true;
    this.edited = item;
  }

  @HostListener('document:click', ['$event'])
  onclickDocument(event: MouseEvent) {
    if ((event.target as any).nodeName === 'TEXTAREA') {
      return;
    }
    this.edited.edited = false;
  }

  async onSubmitDesc() {
    if (
      !(await this.service.Patch({
        id: this.edited.id,
        desc: this.desc
      }))
    ) {
      return;
    }

    this.edited.desc = this.desc;
    this.edited.edited = false;
  }

  onDel(item: any) {
    const noticeService: NoticeService = new NoticeService();
    noticeService.dialog({
      title: '删除历史',
      theme: '',
      body: '确定删除此历史文件，将不可恢复？',
      callback: async (ret: boolean) => {
        if (ret && (await this.service.Del(item.id))) {
          noticeService.notice({
            body: '删除成功！',
            theme: 'success'
          });
          this.list();
          this.service.DelImage(item.image);
        }
      }
    });
  }

  onBack() {
    history.back();
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
    this.subRoute.unsubscribe();
  }
}

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Store } from 'le5le-store';

@Component({
  selector: 'app-workspace-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  host: {
    '(document:onscroll)': 'onscroll($event)'
  }
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
  user: any;
  subUser: any;

  menuClicked = false;
  showFigure = false;
  recently: any[] = [];

  dialogs: any = {};

  menus: any[] = [{
    name: '查看',
    children: [{
      name: '行业解决方案',
      router: '/search'
    }, {}, {
      name: '产品介绍',
      url: 'https://juejin.im/post/5d6c88726fb9a06b0e54ab35'
    }, {
      name: '技术支持',
      url: 'https://www.yuque.com/alsmile/topology/aboutus#gWc5X'
    }]
  }, {
    name: '社区',
    children: [{
      name: 'Github官网',
      url: 'https://github.com/le5le-com'
    }, {
      name: '核心库',
      url: 'https://github.com/le5le-com/topology'
    }, {
      name: '版本发布',
      url: 'https://github.com/le5le-com/topology/releases'
    }, {
      name: '技术交流群',
      url: 'http://topology.le5le.com/assets/img/topology_wechat.jpg'
    }]
  }, {
    name: '帮助',
    children: [{
      name: '使用教程',
      url: 'https://juejin.im/user/58b1336c570c3500696559f8/posts'
    }, {
      name: '开发文档',
      url: 'https://www.yuque.com/alsmile/topology/umsiq3'
    }, {}, {
      name: '许可与申明',
      dialog: true
    }, {
      name: '合作支持',
      url: 'https://www.yuque.com/alsmile/topology/aboutus#gWc5X'
    }, {}, {
      name: '关于我们',
      url: 'https://www.yuque.com/alsmile/topology/aboutus'
    }]
  }];
  constructor(private router: Router, private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    const menus = Store.get('AppWorkspaceMenus');
    if (menus) {
      this.menus = menus;
    }

    Store.subscribe('recently', (item: any) => {
      for (let i = 0; i < this.recently.length; ++i) {
        if (this.recently[i].id === item.id || i > 19) {
          this.recently.splice(i, 1);
        }
      }
      this.recently.unshift(item);
      if (this.user) {
        localStorage.setItem('recently_' + this.user.id, JSON.stringify(this.recently));
      }
    });

    this.subUser = Store.subscribe('user', (user: any) => {
      this.user = user;
      this.getRecently();
    });
  }

  onRemoveRecently(event: MouseEvent, i: number) {
    event.stopPropagation();
    event.preventDefault();
    this.recently.splice(i, 1);
    localStorage.setItem('recently_' + this.user.id, JSON.stringify(this.recently));
  }

  getRecently() {
    if (!this.user) {
      return;
    }

    try {
      this.recently = JSON.parse(localStorage.getItem('recently_' + this.user.id));
    } catch (e) { }
    if (!this.recently) {
      this.recently = [];
    }
  }

  onMenu(name: string) {

  }

  onClickMenu(event: MouseEvent) {
    if ((event.target as HTMLElement).nodeName === 'A') {
      let node = (event.target as HTMLElement).parentElement;
      let isDropdown = false;
      let disabled = false;
      while (node) {
        if (node.className.indexOf('dropdown') > -1) {
          isDropdown = true;
        }
        if (node.className.indexOf('disabled') > -1) {
          disabled = true;
          break;
        }
        node = node.parentElement;
      }

      if (disabled) {
        return;
      }

      if (isDropdown) {
        this.menuClicked = true;
        setTimeout(() => {
          this.menuClicked = false;
        }, 500);
      }
    }
  }

  onLeaveFigure() {
    setTimeout(() => {
      this.showFigure = false;
    }, 1000);
  }

  ngOnDestroy() {
  }
}

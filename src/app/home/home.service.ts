import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from '../core/core.service';

@Injectable()
export class HomeService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  Configs() {
    const configs = {
      bars: [{
        bkColor: '#2589ff',
        styles: null,
        image: '/assets/img/bar1.png',
        title: '高效的绘图工具',
        desc: '在线制作、云存储、多端分享，丰富功能、舒适体验\n包含流程图、UML图、微服务架构图、拓扑图、SCADA、脑图等多场景支持',
        button: '免费使用',
        url: '',
        router: '/workspace',
      }, {
        bkColor: '#3b6bee',
        styles: null,
        image: '/assets/img/bar2.png',
        title: '丰富的资源图形库',
        desc: '在线系统平台资源库、自定义组件库等多场景支持\n多种行业分类，欢迎大家一起共同创建、共享',
        button: '开始设计',
        url: '',
        router: '/workspace',
      }, {
        bkColor: '#ff5870',
        styles: null,
        image: '/assets/img/bar3.png',
        title: '开源共享',
        desc: '开源精神，互惠共享\n组件式设计，插件式开发，欢迎一起共同创建一个强大、丰富的图库平台',
        button: '开发文档',
        url: 'https://www.yuque.com/alsmile/topology',
        router: '',
      }],
      classes: ['架构图', 'UML图', '拓扑图', '物联网', '电力', '水利', '安防', '标识']
    };

    for (const item of configs.bars) {
      item.styles = {
        background: item.bkColor
      };
    }
    return configs;
  }


  async Topologies(params: any) {
    const ret = await this.http.QueryString(params).Get('/api/topologies');
    if (ret.error || !ret.list) {
      return {
        list: [],
        count: 0
      };
    }
    this.parseData(ret);
    return ret;
  }

  async Star(data: any) {
    let ret: any;
    if (data.stared) {
      ret = await this.http.Delete('/api/user/star/' + data.id);
    } else {
      ret = await this.http.Post('/api/user/star', { id: data.id });
    }

    if (ret.error) {
      return null;
    }

    data.stared = !data.stared;
    if (data.stared) {
      ++data.star;
    } else {
      --data.star;
    }
    return ret;
  }

  async Favorite(data: any) {
    let ret: any;
    if (data.favorited) {
      ret = await this.http.Delete('/api/user/favorite/' + data.id);
    } else {
      ret = await this.http.Post('/api/user/favorite', { id: data.id });
    }

    if (ret.error) {
      return null;
    }

    data.favorited = !data.favorited;
    if (data.favorited) {
      ++data.hot;
    } else {
      --data.hot;
    }
    return ret;
  }

  parseData(ret: any) {
    for (const item of ret.list) {
      item.usernamePinyin = this.coreService.getPinyin(item.username);
      if (ret.stars) {
        for (const t of ret.stars) {
          if (t.id === item.id) {
            item.stared = true;
            break;
          }
        }
      }
      if (ret.favorites) {
        for (const t of ret.favorites) {
          if (t.id === item.id) {
            item.favorited = true;
            break;
          }
        }
      }
    }
  }
}

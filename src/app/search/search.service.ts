import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from '../core/core.service';

@Injectable()
export class SearchService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  Classes() {
    return [{
      name: '架构拓扑图',
    }, {
      name: 'UML图',
    }, {
      name: '拓扑图',
    }, {
      name: '物联网',
    }, {
      name: '电力',
    }, {
      name: '水利',
    }, {
      name: '安防',
    }, {
      name: '标识',
    }];
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

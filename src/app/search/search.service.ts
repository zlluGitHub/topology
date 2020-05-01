import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from '../core/core.service';

@Injectable()
export class SearchService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  async Topologies(params: any) {
    const ret = await this.http.QueryString(params).Get('/api/topologies');
    if (ret.error || !ret.list) {
      return {
        list: [],
        count: 0
      };
    }
    return ret;
  }

  async Star(id: string, star: boolean) {
    let ret: any;
    if (star) {
      ret = await this.http.Post('/api/user/star', { id });

    } else {
      ret = await this.http.Delete('/api/user/star/' + id);
    }

    if (ret.error) {
      return false;
    }

    return true;
  }

  async StarIds(params: any) {
    const ret = await this.http.Post('/api/user/star/ids', params);
    if (ret.error || !ret.list) {
      return [];
    }
    return ret.list;
  }
}

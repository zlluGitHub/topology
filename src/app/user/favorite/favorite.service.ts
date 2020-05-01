import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from 'src/app/core/core.service';

@Injectable()
export class UserFavoriteService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  async Topologies(params: any) {
    const ret = await this.http.QueryString(params).Get('/api/user/stars');
    if (ret.error || !ret.list) {
      return {
        list: [],
        count: 0
      };
    }
    return ret;
  }

  async Remove(data: any) {
    const ret = await this.http.Delete('/api/user/star/' + data.id);
    return !ret.error;
  }
}

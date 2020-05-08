import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from '../core/core.service';

@Injectable()
export class ViewService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  async Get(data: any) {
    const ret = await this.http.QueryString({ version: data.version, view: 1 }).Get('/api/topology/' + data.id);
    if (ret.error) {
      return null;
    }

    return ret;
  }
}

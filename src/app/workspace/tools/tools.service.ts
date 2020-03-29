import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from 'src/app/core/core.service';

@Injectable()
export class ToolsService {
  constructor(protected http: HttpService, private coreService: CoreService) { }

  async Get() {
    const ret = await this.http.Get('/api/tools');
    if (ret.error) {
      return [];
    }

    for (const item of ret) {
      item.py = this.coreService.getPinyin(item.name, true);
    }

    return ret;
  }
}

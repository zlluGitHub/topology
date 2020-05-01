import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';
import { CoreService } from 'src/app/core/core.service';

@Injectable()
export class UserService {
  constructor(protected http: HttpService, protected coreService: CoreService) { }

  async Statistics() {
    const ret = await this.http.Get('/api/user/statistics');
    if (ret.error) {
      return {
      };
    }

    return ret;
  }

}

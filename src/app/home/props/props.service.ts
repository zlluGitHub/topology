import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';

@Injectable()
export class PropsService {
  constructor(protected http: HttpService) {}

  async Get(data: any) {
    const ret = await this.http.QueryString({ fileId: data.fileId }).Get('/api/topology/' + data.id);
    if (ret.error) {
      return null;
    }

    return ret;
  }

  async Upload(blob: Blob, filename: string) {
    const form = new FormData();
    form.append('path', filename);
    form.append('randomName', '1');
    form.append('public', 'true');
    form.append('file', blob);
    const ret = await this.http.PostForm('/api/image', form);
    if (ret.error) {
      return null;
    }

    return ret;
  }

  async DelImage(image: string) {
    const ret = await this.http.Delete('/api' + image);
    if (ret.error) {
      return false;
    }

    return true;
  }
}

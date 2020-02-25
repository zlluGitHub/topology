import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';

@Injectable()
export class PropsService {
  constructor(protected http: HttpService) { }

}

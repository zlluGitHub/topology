import { Injectable } from '@angular/core';

import { HttpService } from 'src/app/http/http.service';

@Injectable()
export class ToolsService {
  constructor(protected http: HttpService) { }

}

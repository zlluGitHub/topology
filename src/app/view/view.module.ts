import { NgModule } from '@angular/core';


import { SharedModule } from '../shared/shared.module';

import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';

@NgModule({
  declarations: [ViewComponent],
  imports: [
    SharedModule, ViewRoutingModule
  ]
})
export class ViewModule { }

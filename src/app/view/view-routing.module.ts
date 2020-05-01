import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewComponent } from './view.component';


const homeRoutes: Routes = [
  {
    path: '',
    component: ViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }

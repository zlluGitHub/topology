import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { PropsComponent } from './props/props.component';

@NgModule({
  imports: [SharedModule, HomeRoutingModule],
  declarations: [HomeComponent, PropsComponent]
})
export class HomeModule {}

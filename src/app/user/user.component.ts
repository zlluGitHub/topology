import { Component, OnInit, OnDestroy } from '@angular/core';

import { Store } from 'le5le-store';

import { CoreService } from 'src/app/core/core.service';
import { environment } from 'src/environments/environment';

import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [UserService]
})
export class UserComponent implements OnInit, OnDestroy {
  user: any;
  subUser: any;
  isVip = false;

  statistics: any = {};
  subStatistics: any;

  urls = environment.urls;
  constructor(private coreService: CoreService, private service: UserService) { }

  async ngOnInit() {
    this.user = Store.get('user');
    this.subUser = Store.subscribe('user', (user: any) => {
      this.user = user;
      this.isVip = this.coreService.isVip(this.user);
    });

    this.subStatistics = Store.subscribe('user-statistics', (ret: any) => {
      Object.assign(this.statistics, ret);
    });

    this.statistics = await this.service.Statistics();
  }


  ngOnDestroy() {
    this.subUser.unsubscribe();
    this.subStatistics.unsubscribe();
  }
}

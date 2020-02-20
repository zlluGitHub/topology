import { Component } from '@angular/core';

import { Store } from 'le5le-store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() {
    window.addEventListener(
      'message',
      (e: any) => {
        if (this[e.data.event]) {
          this[e.data.event](e.data.params);
        }
      });
  }

  workspaceMenus(params: any) {
    Store.set('AppWorkspaceMenus', params);
  }
}

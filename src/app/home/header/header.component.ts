import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  menuClicked = false;

  search = '';
  constructor(private router: Router) { }

  ngOnInit() {
  }

  onClickMenu(event: MouseEvent) {
    if ((event.target as HTMLElement).nodeName === 'A') {
      let node = (event.target as HTMLElement).parentElement;
      let isDropdown = false;
      let disabled = false;
      while (node) {
        if (node.className.indexOf('dropdown') > -1) {
          isDropdown = true;
        }
        if (node.className.indexOf('disabled') > -1) {
          disabled = true;
          break;
        }
        node = node.parentElement;
      }

      if (disabled) {
        return;
      }

      if (isDropdown) {
        this.menuClicked = true;
        setTimeout(() => {
          this.menuClicked = false;
        }, 500);
      }
    }
  }

  onSearch() {
    this.router.navigate(['/', 'search'], {
      queryParams: {
        q: this.search
      }
    });
  }

}

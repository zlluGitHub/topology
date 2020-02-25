import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  host: {
    '(document:onscroll)': 'onscroll($event)'
  }
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() theme = '';

  menuClicked = false;
  search = '';

  subRoute: any;
  constructor(private router: Router, private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
      this.search = params.get('q') || '';
    });
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
        q: this.search,
        c: this.activateRoute.snapshot.queryParamMap.get('c')
      }
    });
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
  }
}

import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  appSidebarDefaultMinimizeDefault: boolean = true;
  toggleButtonClass: string = '';
  toggleEnabled: boolean = false;
  toggleType: string = '';
  toggleState: string = '';

  constructor() { }

  ngOnInit(): void { }

  ngOnDestroy() { }
}

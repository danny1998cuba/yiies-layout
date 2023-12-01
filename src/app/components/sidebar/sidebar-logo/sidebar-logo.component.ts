import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

export type LayoutType =
  | 'dark-sidebar'
  | 'light-sidebar'
  | 'dark-header'
  | 'light-header'
  | 'light-glass-sidebar'
  | 'light-glass-header'
  | 'dark-glass-sidebar'
  | 'dark-glass-header';

@Component({
  selector: 'app-sidebar-logo',
  templateUrl: './sidebar-logo.component.html',
  styleUrls: ['./sidebar-logo.component.scss'],
})
export class SidebarLogoComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'flex-center'

  @Input() toggleButtonClass: string = '';
  @Input() toggleEnabled: boolean = false;
  @Input() toggleType: string = '';
  @Input() toggleState: string = '';
  currentLayoutType: LayoutType | null = 'dark-sidebar';

  constructor() { }

  ngOnInit(): void { }

  ngOnDestroy() { }
}

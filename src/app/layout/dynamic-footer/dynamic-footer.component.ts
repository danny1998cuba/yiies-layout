import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'app-dynamic-footer',
  templateUrl: './dynamic-footer.component.html',
  styleUrls: ['./dynamic-footer.component.scss']
})
export class DynamicFooterComponent implements OnInit {
  @HostBinding('class') class = 'custom-footer p-1'

  constructor() { }

  ngOnInit(): void {
  }

}

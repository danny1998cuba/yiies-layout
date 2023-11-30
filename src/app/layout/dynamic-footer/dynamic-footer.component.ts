import { Component, OnInit, HostBinding, Input, EventEmitter, Output } from '@angular/core';
import { POSITION, Position } from 'src/app/data/utils.model';

@Component({
  selector: 'app-dynamic-footer',
  templateUrl: './dynamic-footer.component.html',
  styleUrls: ['./dynamic-footer.component.scss']
})
export class DynamicFooterComponent implements OnInit {
  @HostBinding('class') class = 'custom-footer p-1'

  // Logo
  _showingLogo: boolean = false
  @Input() set showingLogo(val: boolean) { this._showingLogo = val }
  _overlapLogo: boolean = false
  @Input() set overlapLogo(val: boolean) { this._overlapLogo = val }
  @Input() position: Position = POSITION.BOTTOM
  @Input('with-navigation') withNavigation: boolean = false

  // Action button
  @Input('button-name') buttonName: string = 'Main action'
  @Output() buttonAction: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
    this.class += ` ${this.position}`
  }

}

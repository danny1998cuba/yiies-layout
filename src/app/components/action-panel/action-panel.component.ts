import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { IButtonMenuData } from '../button-menu/button-menu.component';
import { remToPixels } from 'src/app/utils/utils';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit {
  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
  }

  _data!: IButtonMenuData
  @Input() set data(val: IButtonMenuData) {
    this._data = val
    this.initialize()
  }

  _position!: 'left' | 'right'
  @Input() set position(val: 'left' | 'right') {
    this.ref.nativeElement.classList.add(val)
    this._position = val
  }

  translate: number = 0
  translatePx: string = '0'

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
  }

  initialize() {
    console.log('initialized', this._data.index);

    const down = 60.4 + remToPixels(1.875)
    this.translate = -1 * ((this._data.index) * 45) - down;
    this.translatePx = `${this.translate}px`
  }

}

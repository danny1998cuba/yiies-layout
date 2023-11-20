import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { IActionButton } from 'src/app/data/utils.model';

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

  @Input() data!: IActionButton

  _position!: 'left' | 'right'
  @Input() set position(val: 'left' | 'right') {
    this.ref.nativeElement.classList.add(val)
    this._position = val
  }

  @Input('min-heigh-opened') minHeightOpened: number = 0

  @ViewChild('content') content!: ElementRef

  styleInner: any = {}
  styleCollapsible: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.initialize()
  }

  initialize() {
    // TODO: When min-heigh-opened is smaller than 40%, set it as 40%

    const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    const translate = (vpHeight - 55 - this.data.bound.bottom)
    this.styleCollapsible['height'] = this.minHeightOpened

    this.styleInner['--translate'] = `-${translate}px`
    this.styleInner['minHeight'] = `${this.data.bound.height}px`
    this.styleInner['height'] = `${this.data.bound.height}px`

    setTimeout(() => {
      this.styleInner['height'] = this.minHeightOpened
      this.styleInner['bottom'] = `-${translate}px`
    }, 150);
  }

}

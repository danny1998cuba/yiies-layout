import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IActionButton } from 'src/app/data/utils.model';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit {
  @Input() data!: IActionButton

  _position!: 'left' | 'right'
  @Input() set position(val: 'left' | 'right') {
    this.ref.nativeElement.classList.add(val)
    this._position = val
  }

  @Input('min-heigh-opened') minHeightOpened: string = ''
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()

  @ViewChild('content') content!: ElementRef

  styleInner: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.initialize()
  }

  initialize() {
    // TODO: When height based on content height up to 70%

    const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    const translate = (vpHeight - 55 - this.data.bound.bottom)
    const forty = 0.4 * (vpHeight - 98)

    this.styleInner['--translate'] = `-${translate}px`
    this.styleInner['minHeight'] = `${this.data.bound.height}px`
    this.styleInner['height'] = `${this.data.bound.height}px`

    setTimeout(() => {
      let height = 0
      if (parseFloat(this.minHeightOpened) < forty) {
        height = forty
        this.emitHeight.emit(height)
      } else {
        height = parseFloat(this.minHeightOpened)
      }
      this.styleInner['height'] = `${height}px`
      this.styleInner['bottom'] = `-${translate}px`
    }, 150);
  }

  click($event: Event) {
    $event.stopPropagation()
  }

}

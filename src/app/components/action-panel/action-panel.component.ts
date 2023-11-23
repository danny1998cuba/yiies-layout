import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IActionButton } from 'src/app/data/utils.model';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit, AfterViewInit {
  @Input() data!: IActionButton

  _position!: 'left' | 'right'
  @Input() set position(val: 'left' | 'right') {
    this.ref.nativeElement.classList.add(val)
    this._position = val
  }

  _orientation!: 'portrait' | 'landscape'
  @Input() set orientation(val: 'portrait' | 'landscape') {
    this._orientation = val
  }

  @Input('min-heigh-opened') minHeightOpened: string = ''
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()

  @ViewChild('component') component!: ElementRef

  styleInner: any = {}
  vpHeight: number = 0
  minPercent = { portrait: 0.4, landscape: 0.75 }
  maxPercent = { portrait: 0.75, landscape: 1 }

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    this.initialize();
  }

  ngAfterViewInit(): void {
    // TODO: When it's landscape, change max to 100%
    this.adjustHeight()
  }

  initialize() {
    const translate = (this.vpHeight - 55 - this.data.bound.bottom)

    this.styleInner['--translate'] = `-${translate}px`
    this.styleInner['minHeight'] = `${this.data.bound.height}px`
    this.styleInner['height'] = `${this.data.bound.height}px`
  }

  adjustHeight() {
    setTimeout(() => {
      const translate = (this.vpHeight - 55 - this.data.bound.bottom)
      const min = this.minPercent[this._orientation] * (this.vpHeight - 98)
      const max = this.maxPercent[this._orientation] * (this.vpHeight - 98)

      let contentHeight = this.component.nativeElement.offsetHeight
      if (this.component.nativeElement?.style?.height) {
        contentHeight = parseFloat(this.component.nativeElement?.style?.height)
      } else if (this.component.nativeElement.offsetHeight > this.component.nativeElement.scroll) {
        contentHeight = this.component.nativeElement.offsetHeight
      } else {
        contentHeight = this.component.nativeElement.scrollHeight
      }
      let height = 0

      if (contentHeight > min && contentHeight > parseFloat(this.minHeightOpened)) {
        height = contentHeight > max ? max : contentHeight
        this.emitHeight.emit(height)
      } else if (parseFloat(this.minHeightOpened) < min) {
        height = min
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

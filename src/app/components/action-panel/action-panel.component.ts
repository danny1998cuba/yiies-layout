import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit, AfterViewInit {
  @HostBinding('style.height') height = '100%'

  @Input() data!: IActionButton

  _position!: Position
  @Input() set position(val: Position) {
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
  vpWidth: number = 0
  minPercent = { portrait: 0.4, landscape: 0.75 }
  maxPercent = { portrait: 0.75, landscape: 1 }

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    this.vpWidth = parseFloat(getComputedStyle(document.documentElement).width)
    this.initialize();
  }

  ngAfterViewInit(): void {
    this.adjustHeight()
  }

  initialize() {
    if (this._position === POSITION.LEFT || this._position === POSITION.RIGHT) {
      const translate = (this.vpHeight - 55 - this.data.bound.bottom)

      this.styleInner['--translate'] = `-${translate}px`
      this.styleInner['minHeight'] = `${this.data.bound.height}px`
      this.styleInner['height'] = `${this.data.bound.height}px`
    } else {
      const translate = this.data.bound.left

      this.styleInner['--translate'] = `${translate}px`
      this.styleInner['minWidth'] = `${this.data.bound.height}px`
      this.styleInner['width'] = `${this.data.bound.height}px`
    }
  }

  adjustHeight() {
    if (this._position === POSITION.LEFT || this._position === POSITION.RIGHT) {
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
        } else if (parseFloat(this.minHeightOpened) < min) {
          height = min
        } else {
          height = parseFloat(this.minHeightOpened)
        }
        this.emitHeight.emit(height)

        this.styleInner['height'] = `${height}px`
        this.styleInner['bottom'] = `-${translate}px`
        this.height = `${height}px`
      }, 150);
    } else {
      setTimeout(() => {
        const translate = this.data.bound.left
        const min = this.minPercent[this._orientation] * (this.vpHeight - 55 - (this._position === POSITION.LEFT || this._position === POSITION.RIGHT ? 43 : 0))
        const max = this.maxPercent[this._orientation] * (this.vpHeight - 55 - (this._position === POSITION.LEFT || this._position === POSITION.RIGHT ? 43 : 0))

        let contentHeight = this.component.nativeElement.offsetHeight
        if (this.component.nativeElement?.style?.height) {
          contentHeight = parseFloat(this.component.nativeElement?.style?.height)
        } else if (this.component.nativeElement.offsetHeight > this.component.nativeElement.scroll) {
          contentHeight = this.component.nativeElement.offsetHeight
        } else {
          contentHeight = this.component.nativeElement.scrollHeight
        }
        let height = 0

        if (contentHeight > min) {
          height = contentHeight > max ? max : contentHeight
          this.emitHeight.emit(height)
        } else if (parseFloat(this.minHeightOpened) < min) {
          height = min
          this.emitHeight.emit(height)
        } else {
          height = parseFloat(this.minHeightOpened)
        }

        this.styleInner['height'] = `${height - 45}px`
        this.styleInner['left'] = `-${translate}px`
        this.styleInner['width'] = `${this.vpWidth}px`
        this.styleInner['minWidth'] = `${this.vpWidth}px`
        this.height = `${height}px`
      }, 150);
    }
  }

  click($event: Event) {
    $event.stopPropagation()
  }
}

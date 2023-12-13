import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { ButtonMenuType } from 'src/app/data/button-menu.model';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss']
})
export class ActionPanelComponent implements OnInit, AfterViewInit {
  @HostBinding('style.height') height = ''
  @HostBinding('class') class = ''

  _data!: IActionButton | null
  @Input() set data(val: IActionButton | null) {
    if (!!val && !!this._data) {
      this.styleInner = {}
    }
    this.height = ''
    this._data = val
    this.initialize()
  }

  _position!: Position | null
  @Input() set position(val: Position | null) {
    this._position = val
  }

  _orientation!: 'portrait' | 'landscape'
  @Input() set orientation(val: 'portrait' | 'landscape') {
    this._orientation = val
    this.vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    this.vpWidth = parseFloat(getComputedStyle(document.documentElement).width)

    if (!!this._data) {
      this.styleInner = {}
      this.height = ''
      this.initialize()
      this.adjustHeight()
    }
  }

  @Input('min-heigh-opened') minHeightOpened: string = ''
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()

  @ViewChild('component') component!: ElementRef

  styleInner: any = {}
  vpHeight: number = 0
  vpWidth: number = 0
  minPercent = { portrait: 0.4, landscape: 0.75 }
  maxPercent = { portrait: 0.75, landscape: 1 }

  whenOpenWidth: string = ''
  whenOpenHeight: string = ''
  previousType: ButtonMenuType | null = null

  constructor(
    private ref: ElementRef,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    window.addEventListener('resize', () => {
      this.vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
      this.vpWidth = parseFloat(getComputedStyle(document.documentElement).width)

      if (!!this._data) {
      }

      this.adjustHeight()
    })

    this.vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    this.vpWidth = parseFloat(getComputedStyle(document.documentElement).width)

    this.initialize();
  }

  ngAfterViewInit(): void {
    this.adjustHeight()
  }

  initialize() {
    if (!!this._data) {
      this.previousType = this._data.button.type
      if (this._position === POSITION.LEFT || this._position === POSITION.RIGHT) {
        if (this._data.button.type !== ButtonMenuType.SIDEBAR) {
          const translate = (this.vpHeight - 55 - this._data.bound.bottom)

          this.styleInner['--translate'] = `${translate * -1}px`
          this.styleInner['minHeight'] = `${this._data.bound.height}px`
          this.styleInner['height'] = `${this._data.bound.height}px`
          this.whenOpenHeight = `${this._data.bound.height}px`
        }
      } else {
        if (this._data.button.type !== ButtonMenuType.SIDEBAR) {
          const translate = this._data.bound.left

          this.styleInner['--translate'] = `${translate}px`
          this.styleInner['minWidth'] = `${this._data.bound.width}px`
          this.styleInner['width'] = `${this._data.bound.width}px`
          this.whenOpenWidth = `${this._data.bound.width}px`
        }
      }
    } else {
      const translate = cloneDeep(this.styleInner['--translate'])
      this.styleInner = {
        '--translate': translate
      }

      if (this.previousType !== ButtonMenuType.SIDEBAR) {
        if (this._position === POSITION.LEFT || this._position === POSITION.RIGHT) {
          this.styleInner['minHeight'] = this.whenOpenHeight
          this.styleInner['height'] = this.whenOpenHeight
        } else {
          this.styleInner['minWidth'] = this.whenOpenWidth
          this.styleInner['width'] = this.whenOpenWidth
        }

        setTimeout(() => {
          this.height = ''
          setTimeout(() => {
            this.styleInner = {}
            this.whenOpenHeight = ''
            this.whenOpenWidth = ''
          }, 200);
        }, 50);
      } else {
        setTimeout(() => {
          this.styleInner = {}
          this.height = ''
        }, 200);
      }
      this.previousType = null
    }
    this._cdr.detectChanges()
  }

  adjustHeight() {
    if (!!this._data) {
      if (this._data.button.type !== ButtonMenuType.SIDEBAR) {
        if (this._position === POSITION.LEFT || this._position === POSITION.RIGHT) {
          setTimeout(() => {
            this._resizeLateral()
          }, 150);
        } else {
          setTimeout(() => {
            this._resizeTopBottom()
          }, 150);
        }
      }
    }
    this._cdr.detectChanges()
  }

  private _resizeTopBottom() {
    const translate = this._data ? this._data.bound.left : 0
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
    } else if (parseFloat(this.minHeightOpened) < min) {
      height = min
    } else {
      height = parseFloat(this.minHeightOpened)
    }
    this.emitHeight.emit(height)

    this.styleInner['height'] = `${height - 45}px`
    this.styleInner['left'] = `-${translate}px`
    this.styleInner['width'] = `${this.vpWidth}px`
    this.styleInner['minWidth'] = `${this.vpWidth}px`
    this.styleInner['bottom.px'] = 45
    this.height = `${height}px`
  }

  private _resizeLateral() {
    const translate = (this.vpHeight - 55 - (this._data ? this._data.bound.bottom : 0))
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
    this.styleInner['bottom'] = this.styleInner['--translate'] ? this.styleInner['--translate'] : `${translate * -1}px`
    this.height = `${height}px`
  }

  click($event: Event) {
    $event.stopPropagation()
  }
}

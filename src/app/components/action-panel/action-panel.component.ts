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

  @Input('min-heigh-opened') minHeightOpened: string = ''
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()

  @ViewChild('component') component!: ElementRef

  styleInner: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.initialize()
  }

  ngAfterViewInit(): void {
    // TODO: When it's landscape, change max to 100%

    setTimeout(() => {
      const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
      const translate = (vpHeight - 55 - this.data.bound.bottom)
      const min = 0.4 * (vpHeight - 98)
      const max = 0.75 * (vpHeight - 98)

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

  initialize() {
    const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    const translate = (vpHeight - 55 - this.data.bound.bottom)

    this.styleInner['--translate'] = `-${translate}px`
    this.styleInner['minHeight'] = `${this.data.bound.height}px`
    this.styleInner['height'] = `${this.data.bound.height}px`
  }

  click($event: Event) {
    $event.stopPropagation()
  }
}

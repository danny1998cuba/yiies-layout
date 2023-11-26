import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';

export interface IButtonMenuData {
  icon: string;
  token: string;
  index: number;
  name?: string;
  show: boolean;
  active: boolean;
  subOptions?: IButtonMenuData[];
}

@Component({
  selector: 'app-button-menu',
  templateUrl: './button-menu.component.html',
  styleUrls: ['./button-menu.component.scss']
})
export class ButtonMenuComponent implements OnInit {
  @HostBinding('class') class = 'glass-btn d-flex align-items-center'
  @HostBinding('style.--index-btn') index: number = 0

  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.expand('click')
    if (this.isAction) this.action(this.buttonData, $event)
  }

  @Input('button-data') buttonData: IButtonMenuData = { icon: 'default', token: 'default', index: 0, show: true, active: false }
  @Input() direction: 'vertical' | 'horizontal' = 'vertical'
  @Input() position: Position = 'left'

  @Output() expanding: EventEmitter<{ token: string, isColladpsed: boolean }> = new EventEmitter()
  @Output() selectedAction: EventEmitter<IActionButton> = new EventEmitter()

  @ViewChild('options') options!: ElementRef

  isAction: boolean = true
  collapsed: boolean = true
  expandedHeight: string = '0px'
  expandedWidth: string = '0px'

  optionsStyle: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  get element(): ElementRef {
    return this.ref
  }

  ngOnInit(): void {
    this.isAction = !this.buttonData.subOptions || this.buttonData.subOptions.length === 0
    this.index = this.buttonData.index
    this.class += (this.position === POSITION.TOP || this.position === POSITION.BOTTOM) ? ' flex-row' : ' flex-column-reverse'
    this.class += ` ${this.position}`
  }

  action(data: IButtonMenuData, $event: Event) {
    $event.stopPropagation()
    const target = $event.currentTarget as Element
    this.selectedAction.emit({
      button: data,
      bound: target.getBoundingClientRect()
    })
  }

  expand(from: 'click' | 'remote') {
    this.collapsed = false
    this.element.nativeElement.classList.add('ellapsed')
    if (from === 'click') this.expanding.emit({ token: this.buttonData.token, isColladpsed: false })

    if (this.direction === 'vertical') {
      this.expandedHeight = getComputedStyle(this.options.nativeElement).height
      this.optionsStyle['height'] = this.expandedHeight
    } else {
      this.expandedWidth = getComputedStyle(this.options.nativeElement).width
      this.optionsStyle['width'] = this.expandedWidth
    }

    setTimeout(() => {
      this.ref.nativeElement.style.overflow = 'scroll'
    }, 250);
  }

  collapse($event: MouseEvent | null, from: 'click' | 'remote') {
    if ($event) $event.stopPropagation()
    this.collapsed = true
    this.element.nativeElement.classList.remove('ellapsed')
    if (from === 'click') this.expanding.emit({ token: this.buttonData.token, isColladpsed: true })

    if (this.direction === 'vertical') {
      this.expandedHeight = ''
      delete this.optionsStyle['height']
    } else {
      this.expandedWidth = ''
      delete this.optionsStyle['width']
    }

    this.ref.nativeElement.style.overflow = 'visible'
  }

  adaptContentHeight(height: number | null) {
    this.optionsStyle['height'] = height ? `${height}px` : this.expandedHeight
  }

  adaptContentWidth(setNull: boolean) {
    this.optionsStyle['width'] = setNull ? this.expandedWidth : getComputedStyle(document.documentElement).width
  }

}

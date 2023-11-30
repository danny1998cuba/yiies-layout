import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ButtonMenuType, IButtonMenuData, SelectionButtonMenu, SelectionOptionButtonMenu } from 'src/app/data/button-menu.model';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';
import { remToPixels } from 'src/app/utils/utils';

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

  @Input('button-data') buttonData: IButtonMenuData = { icon: 'default', token: 'default', index: 0, show: true, active: false, type: ButtonMenuType.WITH_CONTENT }
  @Input() direction: 'vertical' | 'horizontal' = 'vertical'
  @Input() position: Position = 'left'

  @Output() expanding: EventEmitter<{ token: string, isColladpsed: boolean }> = new EventEmitter()
  @Output() selectedAction: EventEmitter<IActionButton> = new EventEmitter()
  @Output() selectionEvent: EventEmitter<IButtonMenuData | null> = new EventEmitter()

  @ViewChild('options') options!: ElementRef

  isAction: boolean = true
  collapsed: boolean = true
  expandedHeight: string = '0px'
  expandedWidth: string = '0px'

  optionsStyle: any = {}
  ButtonMenuType = ButtonMenuType

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
    this.checkAction(data, this.buttonData, $event)
  }

  checkAction(emmiter: IButtonMenuData, parent: IButtonMenuData, $event: Event) {
    const target = $event.currentTarget as Element
    switch (parent.type) {
      case ButtonMenuType.WITH_CONTENT:
      case ButtonMenuType.WITH_CONTENT_AND_MENU:
        this.selectedAction.emit({
          button: emmiter,
          bound: target.getBoundingClientRect()
        })
        break;
      case ButtonMenuType.SIMPLE_SELECTION:
        const btn = this.buttonData as SelectionButtonMenu
        btn._change(emmiter as SelectionOptionButtonMenu, s => this.selectionEvent.emit(s))
        this.collapse(null, 'click')
        break;
      case ButtonMenuType.MENU:
        this.checkAction(emmiter, emmiter, $event)
        break;
      case ButtonMenuType.ACTION:
      case ButtonMenuType.SIDEBAR:
        console.log(this.buttonData.token);
        break;
      default:
        this.selectedAction.emit({
          button: emmiter,
          bound: target.getBoundingClientRect()
        })
    }
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

    if (this.buttonData.type === ButtonMenuType.SIMPLE_SELECTION && !!this.buttonData.selected) {
      this.buttonData.selected.active = true
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
    delete this.optionsStyle['margin']
    delete this.optionsStyle['justifyContent']

    this.ref.nativeElement.style.overflow = 'visible'
  }

  adaptContentHeight(height: number | null) {
    this.optionsStyle['height'] = height ? `${height}px` : this.expandedHeight
  }

  adaptContentWidth(setNull: boolean) {
    let w = parseFloat(getComputedStyle(document.documentElement).width) - 60 - remToPixels(1.5) - remToPixels(2 * 0.375)
    const centered = parseFloat(this.expandedWidth) < w

    if (!setNull && centered) {
      w += remToPixels(1.5)
      this.optionsStyle['margin'] = '0'
      this.optionsStyle['justifyContent'] = 'center'
    } else {
      delete this.optionsStyle['margin']
      delete this.optionsStyle['justifyContent']
    }

    this.optionsStyle['width'] = setNull ? this.expandedWidth : `${w}px`
  }

}

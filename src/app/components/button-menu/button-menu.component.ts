import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { OnChange } from 'on-property-change';
import { animations } from 'src/app/data/animations';
import { ButtonMenuType, IButtonMenuData, MenuButtonMenu, SelectionButtonMenu, SelectionOptionButtonMenu, clearActive } from 'src/app/data/button-menu.model';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';
import { remToPixels } from 'src/app/utils/utils';

@Component({
  selector: 'app-button-menu',
  templateUrl: './button-menu.component.html',
  styleUrls: ['./button-menu.component.scss'],
  animations: [animations]
})
export class ButtonMenuComponent implements OnInit {
  @HostBinding('class') class = 'button-menu glass-btn d-flex align-items-center'
  @HostBinding('style.--index-btn') index: number = 0

  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    if (this.collapsed) {
      this.expand('click')
      if (this.isAction || this.isInner) this.action(this.buttonData, $event)
    }
    else this.collapse(null, 'click')
  }

  @Input('button-data') buttonData: IButtonMenuData = { icon: 'default', token: 'default', index: 0, show: true, active: false, type: ButtonMenuType.WITH_CONTENT }
  @Input() direction: 'vertical' | 'horizontal' = 'vertical'
  @Input() position: Position = 'left'

  @Output() expanding: EventEmitter<{ token: string, isColladpsed: boolean, parentToken?: string }> = new EventEmitter()
  @Output() syncInnerExpanding: EventEmitter<{ data: IButtonMenuData | null, isColladpsed: boolean, src: Position }> = new EventEmitter()
  @Output() selectedAction: EventEmitter<IActionButton> = new EventEmitter()
  @Output() selectionEvent: EventEmitter<IButtonMenuData | null> = new EventEmitter()

  @ViewChild('options') options!: ElementRef
  @ViewChildren(ButtonMenuComponent) innerButtons!: QueryList<ButtonMenuComponent>;

  isAction: boolean = true
  isInner: boolean = false
  innerOpenend: string | null = null
  collapsed: boolean = true
  expandedHeight: string = '0px'
  expandedWidth: string = '0px'
  currentExpandedHeight: string = '0px'
  currentExpandedWidth: string = '0px'

  optionsStyle: any = {}
  ButtonMenuType = ButtonMenuType

  constructor(
    private ref: ElementRef
  ) { }

  get element(): ElementRef {
    return this.ref
  }

  ngOnInit(): void {
    this.isAction = this.buttonData.type === ButtonMenuType.ACTION
    this.isInner = this.ref.nativeElement.classList.contains('bm-inner')
    this.index = this.buttonData.index

    this.class += (this.position === POSITION.TOP || this.position === POSITION.BOTTOM) ? ' flex-row' : ' flex-column-reverse'
    this.class += ` ${this.position}`
    this.class += ` ${this.buttonData.type}`
    this.class += ` ${this.buttonData.token}`
  }

  action(data: IButtonMenuData, $event: Event) {
    $event.stopPropagation()
    const target = $event.currentTarget as Element
    switch (this.buttonData.type) {
      case ButtonMenuType.MENU:
      case ButtonMenuType.WITH_CONTENT:
      case ButtonMenuType.WITH_CONTENT_AND_MENU:
        this.selectedAction.emit({
          button: data,
          bound: target.getBoundingClientRect()
        })
        break;
      case ButtonMenuType.SIMPLE_SELECTION:
        const btn = this.buttonData as SelectionButtonMenu
        btn._change(data as SelectionOptionButtonMenu, s => this.selectionEvent.emit(s))
        this.collapse(null, 'click')
        break;
      case ButtonMenuType.ACTION:
        break;
    }
  }

  expand(from: 'click' | 'remote') {
    this.collapsed = false
    this.element.nativeElement.classList.add('ellapsed')
    if (from === 'click') {
      this.expanding.emit({ token: this.buttonData.token, isColladpsed: false })
      if (this.isInner) this.syncInnerExpanding.emit({ data: this.buttonData, isColladpsed: false, src: this.position })
    }

    if (this.direction === 'vertical') {
      this.expandedHeight = getComputedStyle(this.options.nativeElement).height
      this.currentExpandedHeight = this.expandedHeight
      this.optionsStyle['height'] = this.expandedHeight
    } else {
      this.expandedWidth = getComputedStyle(this.options.nativeElement).width
      this.currentExpandedWidth = this.expandedWidth
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
    if (from === 'click') {
      this.expanding.emit({ token: this.buttonData.token, isColladpsed: true })
      if (this.isInner) this.syncInnerExpanding.emit({ data: this.buttonData, isColladpsed: true, src: this.position })
    }

    if (this.direction === 'vertical') {
      this.expandedHeight = ''
      this.currentExpandedHeight = ''
      delete this.optionsStyle['height']
    } else {
      this.expandedWidth = ''
      this.currentExpandedWidth = ''
      delete this.optionsStyle['width']
    }
    delete this.optionsStyle['margin']
    delete this.optionsStyle['justifyContent']

    this.ref.nativeElement.style.overflow = 'hidden'
  }

  adaptContentHeight(height: number | null) {
    if (!!this.innerOpenend) {
      this.optionsStyle['height'] = height ? `${height + 60.4 + remToPixels(1.5)}px` : this.currentExpandedHeight
      this.innerButtons.find(i => i.buttonData.token === this.innerOpenend)?.adaptContentHeight(height)
    } else {
      this.optionsStyle['height'] = height ? `${height}px` : this.currentExpandedHeight
    }
  }

  adaptContentWidth(setNull: boolean) {
    const vpWidth = parseFloat(getComputedStyle(document.documentElement).width)

    if (!!this.innerOpenend) {
      this.optionsStyle['width'] = setNull ? this.currentExpandedWidth : this.isInner ? `${vpWidth - remToPixels(2 * 0.375)}px` : `${vpWidth}px`
      this.innerButtons.find(i => i.buttonData.token === this.innerOpenend)?.adaptContentWidth(setNull)
    } else {
      let w = vpWidth - 60 - remToPixels(1.5) - remToPixels(2 * 0.375)
      const centered = parseFloat(this.currentExpandedWidth) < w

      if (!setNull && centered) {
        w += remToPixels(1.5)
        this.optionsStyle['margin'] = '0'
        this.optionsStyle['justifyContent'] = 'center'
      } else {
        delete this.optionsStyle['margin']
        delete this.optionsStyle['justifyContent']
      }

      this.optionsStyle['width'] = setNull ? this.currentExpandedWidth : `${w}px`
    }
  }

  togglingInner(options: { token: string, isColladpsed: boolean, parentToken?: string }, src: 'event' | 'remote') {
    const bd = this.buttonData as MenuButtonMenu
    const isDirectParent = bd.subOptions.findIndex(op => op.token === options.token) !== -1

    if (src === 'remote') {
      if (isDirectParent) {
        const btn = this.innerButtons.find(bt => bt.buttonData.token === options.token)
        if (btn) {
          options.isColladpsed ? btn.collapse(null, 'remote') : btn.expand('remote')
        }
      }
    }

    if (!options.isColladpsed) {
      if (!isDirectParent) this.innerOpenend = options.parentToken ? options.parentToken : null
      else this.innerOpenend = options.token
    } else {
      if (!isDirectParent) this.innerOpenend = options.parentToken ? options.parentToken : null
      else this.innerOpenend = null
    }

    if (options.isColladpsed) {
      clearActive(bd.subOptions)
    }

    bd.subOptions.forEach(bt => {
      if (bt.token !== options.token) {
        if (!options.isColladpsed) {
          if (bt.token === options.parentToken) bt.show = true
          else bt.show = false
        } else {
          if (!isDirectParent) {
            if (bt.token === options.parentToken) bt.show = true
            else bt.show = false
          } else {
            bt.show = true
          }
        }
      }
    })

    let el: Element | null = document.querySelector(`.${this.position}.${options.token}.bm-inner.ellapsed`)
    if (options.isColladpsed && !isDirectParent) el = document.querySelector(`.${this.position}.${this.buttonData.token} .bm-inner`)

    setTimeout(() => {
      if (this.direction === 'vertical') {
        this.optionsStyle['height'] = !!el ? getComputedStyle(el).height : this.expandedHeight
        this.currentExpandedHeight = this.optionsStyle['height']
      } else {
        this.optionsStyle['width'] = !!el ? getComputedStyle(el).width : this.expandedWidth
        this.currentExpandedWidth = this.optionsStyle['width']
      }
    }, 350);

    if (this.isInner) {
      this.expanding.emit({ ...options, parentToken: this.buttonData.token })
    } else {
      this.selectedAction.emit({
        button: this.buttonData,
        bound: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0, toJSON() { return 'JSON' } }
      })
    }

    if (src === 'remote' && !isDirectParent) {
      const tree = this._getTree(options.token, this.buttonData.subOptions)
      const btn = this.innerButtons.find(bt => bt.buttonData.token === tree[0])
      if (btn) {
        if (options.isColladpsed) {
          btn.togglingInner(options, 'remote')
        } else {
          btn.togglingInner(options, 'remote')
        }
      }
    }
  }

  @OnChange('innerOpenend')
  changeInnerOpened() {
    !!this.innerOpenend ? this.ref.nativeElement.classList.add('inner-opened') : this.ref.nativeElement.classList.remove('inner-opened')
  }

  private _getTree(token: string, list: IButtonMenuData[] | undefined): string[] {
    if (!list) {
      return []
    } else if (list.findIndex(i => i.token === token) !== -1) {
      return [token]
    }

    for (let item of list) {
      const res = this._getTree(token, item.subOptions)
      if (res.length !== 0) {
        return [item.token, ...res]
      }
    }

    return []
  }
}

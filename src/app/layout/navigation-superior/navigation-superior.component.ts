import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ButtonMenuComponent } from 'src/app/components/button-menu/button-menu.component';
import { animations } from 'src/app/data/animations';
import { ButtonMenuType, IButtonMenuData, INavigation, clearActive } from 'src/app/data/button-menu.model';
import { IActionButton, Position } from 'src/app/data/utils.model';
import { remToPixels } from 'src/app/utils/utils';

@Component({
  selector: 'app-navigation-superior',
  templateUrl: './navigation-superior.component.html',
  styleUrls: ['./navigation-superior.component.scss'],
  animations: [animations]
})
export class NavigationSuperiorComponent implements OnInit, INavigation {
  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.toggleOpen()
  }
  @HostListener('document:click') clickOut() {
    this.opened = false
    if (this._isSide) this.ref.nativeElement.classList.add('side')
    clearActive(this._menu)
    this.toggleContent(null)
    this.clicked.emit({ position: this.position, opened: false })
  }

  protected _menu!: IButtonMenuData[]
  @Input() set menu(value: IButtonMenuData[]) {
    this._menu = value
  }

  _isSide!: boolean
  @Input() set isSide(value: boolean) {
    this._isSide = value
  }

  _orientation!: 'portrait' | 'landscape'
  @Input() set orientation(val: 'portrait' | 'landscape') {
    this._orientation = val
    if (this.activeButton) this.toggleContent(this.activeButton)
    if (this._menu) this.centerButtons()
  }

  @Output() clicked: EventEmitter<{ position: Position, opened: boolean }> = new EventEmitter()
  @Output() menuSelected: EventEmitter<{ data: IButtonMenuData | null, isColladpsed: boolean, src: Position }> = new EventEmitter()
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()
  @Output() emitContentHeight: EventEmitter<number> = new EventEmitter()
  @Output() activeButtonChange: EventEmitter<IActionButton | null> = new EventEmitter()

  @ViewChildren(ButtonMenuComponent) buttons!: QueryList<ButtonMenuComponent>;
  @ViewChild('options') options!: ElementRef

  protected opened = false
  public get isOpen(): boolean {
    return this.opened
  }

  activeButton: IActionButton | null = null
  selectedButton: ButtonMenuComponent | null = null
  position: Position = 'top'
  isCentered: boolean = true

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this.centerButtons()
    window.addEventListener('resize', () => {
      if (this.activeButton) {
        this.emitContentHeight.emit(parseFloat(getComputedStyle(this.options.nativeElement).height))
        this.centerButtons()
      }
    })
  }

  centerButtons(uncheckSidebar?: boolean) {
    const vpWidth = parseFloat(getComputedStyle(document.documentElement).width)
    const btnWidht = (45 + remToPixels(0.5))
    const btnsCount = this._menu.length

    this.isCentered = vpWidth > btnWidht * btnsCount

    if (uncheckSidebar && this.activeButton && this.activeButton.button.type === ButtonMenuType.SIDEBAR) {
      this.isCentered = false
    }
  }

  public toggleOpen() {
    this.opened = !this.opened
    if (!this.opened) {
      if (this.activeButton && this.activeButton.button.type === ButtonMenuType.SIDEBAR) {
        this.remoteOpen(this.activeButton.button.token, true)
        this.menuSelected.emit({ data: this.activeButton.button, isColladpsed: true, src: this.position })
      }

      clearActive(this._menu)
      this.toggleContent(null)
      if (this._isSide) this.ref.nativeElement.classList.add('side')
    } else {
      if (this._isSide) this.ref.nativeElement.classList.remove('side')
    }
    this.clicked.emit({ position: this.position, opened: this.opened })
  }

  toggleVisibilityOnCollapse(options: { token: string, isColladpsed: boolean }, src: 'event' | 'remote') {
    const button = this.buttons.find(bt => bt.buttonData.token === options.token)
    if (src === 'event') this.menuSelected.emit({
      data: button?.buttonData || null,
      isColladpsed: options.isColladpsed,
      src: this.position
    })

    if (options.isColladpsed) {
      clearActive(this._menu)
      this.toggleContent(null)
      this.selectedButton = null
      this.centerButtons()
    } else {
      if (button) {
        this.selectedButton = button
        this.centerButtons()
      }
    }

    if (button) {
      if (button.buttonData.type === ButtonMenuType.SIDEBAR && src === 'event') {
        this.activeButtonChange.emit({
          button: button.buttonData,
          bound: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0, toJSON() { return 'JSON' } }
        })
        options.isColladpsed ? this.centerButtons(true) : this.isCentered = false
      }
    }

    this.buttons.forEach(bt => {
      if (bt.buttonData.token !== options.token) {
        if (!options.isColladpsed) {
          bt.buttonData.show = false
        } else {
          bt.buttonData.show = true
        }
      }
    })
  }

  remoteOpen(token: string, isColladpsed: boolean) {
    const button = this.buttons.find(bt => bt.buttonData.token === token)

    if (button) {
      isColladpsed ? button?.collapse(null, 'remote') : button?.expand('remote')
      this.toggleVisibilityOnCollapse({ token, isColladpsed }, 'remote')
    } else {
      console.log('is inner', token);
      this.selectedButton?.togglingInner({ token, isColladpsed }, 'remote')
    }
  }

  optionSelected(data: IActionButton) {
    if (!this.activeButton) {
      data.button.active = true
      this.toggleContent(data)
    } else {
      if (data.button.token !== this.activeButton.button.token) {
        clearActive(this._menu)
        data.button.active = true
        this.toggleContent(data)
      } else {
        data.button.active = false
        this.toggleContent(null)
      }
    }
  }

  toggleContent(token: IActionButton | null) {
    if (!!token) {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        if (this.activeButton) this.selectedButton?.adaptContentWidth(true)
        this.emitHeight.emit(0);
        this.emitContentHeight.emit(0)
        this.activeButton = null
        setTimeout(() => {
          this.activeButton = token
          this.ref.nativeElement.classList.add('show-content')
          this.emitContentHeight.emit(parseFloat(getComputedStyle(this.options.nativeElement).height))
        }, 50);
      }, 200);
    } else {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        this.activeButton = null
        this.selectedButton?.adaptContentWidth(true)
        this.emitHeight.emit(0);
        this.emitContentHeight.emit(0)
      }, 200);
    }
  }
}

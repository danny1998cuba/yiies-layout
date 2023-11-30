import { Component, OnInit, Input, HostListener, Output, EventEmitter, QueryList, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { ButtonMenuComponent } from 'src/app/components/button-menu/button-menu.component';
import { animations } from 'src/app/data/animations';
import { ButtonMenuType, IButtonMenuData, clearActive } from 'src/app/data/button-menu.model';
import { IActionButton, Position } from 'src/app/data/utils.model';
import { remToPixels } from 'src/app/utils/utils';

@Component({
  selector: 'app-navigation-lateral',
  templateUrl: './navigation-lateral.component.html',
  styleUrls: ['./navigation-lateral.component.scss'],
  animations: [animations]
})
export class NavigationLateralComponent implements OnInit {
  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.toggleOpen()
  }
  @HostListener('document:click') clickOut() {
    this.opened = false
    clearActive(this._menu)
    this.toggleContent(null)

    if (this.activeButton && this.activeButton.button.type === ButtonMenuType.SIDEBAR) {
      this.remoteOpen(this.activeButton.button.token, true)
      this.menuSelected.emit({ data: this.activeButton.button, isColladpsed: true, src: this.position })
    }
  }

  @Input() position: Position = 'left'

  protected _menu!: IButtonMenuData[]
  @Input() set menu(value: IButtonMenuData[]) {
    this._menu = value
  }

  _orientation!: 'portrait' | 'landscape'
  @Input() set orientation(val: 'portrait' | 'landscape') {
    this._orientation = val
    if (this.activeButton) this.toggleContent(this.activeButton)
  }

  @Output() clicked: EventEmitter<{ position: Position, opened: boolean }> = new EventEmitter()
  @Output() menuSelected: EventEmitter<{ data: IButtonMenuData | null, isColladpsed: boolean, src: Position }> = new EventEmitter()
  @Output() emitHeight: EventEmitter<number> = new EventEmitter()

  @ViewChildren(ButtonMenuComponent) buttons!: QueryList<ButtonMenuComponent>;
  @ViewChild('options') options!: ElementRef

  protected opened = false
  public get isOpen(): boolean {
    return this.opened
  }

  protected activeButton: IActionButton | null = null
  protected selectedButton: ButtonMenuComponent | null = null
  protected styleContent: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void { }

  public toggleOpen() {
    this.opened = !this.opened
    if (!this.opened) {
      if (this.activeButton && this.activeButton.button.type === ButtonMenuType.SIDEBAR) {
        this.remoteOpen(this.activeButton.button.token, true)
        this.menuSelected.emit({ data: this.activeButton.button, isColladpsed: true, src: this.position })
      }

      clearActive(this._menu)
      this.toggleContent(null)
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
    } else {
      if (button) {
        this.selectedButton = button

        if (button.buttonData.type === ButtonMenuType.SIDEBAR && src === 'event') {
          this.toggleContent({
            button: button.buttonData,
            bound: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0, toJSON() { return 'JSON' } }
          })
        }
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
    isColladpsed ? button?.collapse(null, 'remote') : button?.expand('remote')
    this.toggleVisibilityOnCollapse({ token, isColladpsed }, 'remote')
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
        if (this.activeButton) this.selectedButton?.adaptContentHeight(null)
        this.emitHeight.emit(0);
        this.activeButton = null
        setTimeout(() => {
          this.activeButton = token
          this.ref.nativeElement.classList.add('show-content')
          this.styleContent['minHeight'] = getComputedStyle(this.options.nativeElement).height

          setTimeout(() => {
            // Scroll to the bottom when opening
            const options_pane = document.getElementById(`options_${this.position}`)
            if (options_pane) {
              options_pane.scrollIntoView({ behavior: 'smooth' }) // FIXME: Safari scrolls different
            }
          }, 350);
        }, 50);
      }, 200);
    } else {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        this.activeButton = null
        this.selectedButton?.adaptContentHeight(null)
        this.emitHeight.emit(0);
      }, 200);
    }
  }

  updateHeightAfterContentChange(height: number) {
    this.emitHeight.emit(height); // FIXME: Safari doesn't calculate it right when changing orientation.
    const h = height - 60.4 - remToPixels(1.5) - remToPixels(0.375 * 2)
    this.selectedButton?.adaptContentHeight(h)
  }
}

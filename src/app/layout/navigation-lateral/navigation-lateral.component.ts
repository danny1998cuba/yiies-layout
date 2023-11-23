import { Component, OnInit, Input, HostListener, Output, EventEmitter, QueryList, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { ButtonMenuComponent, IButtonMenuData } from 'src/app/components/button-menu/button-menu.component';
import { animations } from 'src/app/data/animations';
import { IActionButton } from 'src/app/data/utils.model';
import { clearActive, remToPixels } from 'src/app/utils/utils';

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
  }

  @Input() position: 'left' | 'right' = 'left'

  protected _menu!: IButtonMenuData[]
  @Input() set menu(value: IButtonMenuData[]) {
    this._menu = value
  }

  @Output() clicked: EventEmitter<{ position: string, opened: boolean }> = new EventEmitter()
  @Output() menuSelected: EventEmitter<{ data: IButtonMenuData | null, isColladpsed: boolean, src: 'left' | 'right' }> = new EventEmitter()

  @ViewChildren(ButtonMenuComponent) buttons!: QueryList<ButtonMenuComponent>;
  @ViewChild('options') options!: ElementRef

  protected opened = false
  public get isOpen(): boolean {
    return this.opened
  }

  protected activeButton: IActionButton | null = null
  protected selectedButton: ButtonMenuComponent | null = null
  protected styleContent: any = {}
  protected _orientation!: 'portrait' | 'landscape'

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void {
    this._orientation = window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape'
    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      this._orientation = e.matches ? 'portrait' : 'landscape'

      if (this.activeButton) this.toggleContent(this.activeButton)
    });
  }

  public toggleOpen() {
    this.opened = !this.opened
    if (!this.opened) {
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
      if (button) this.selectedButton = button
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
        this.activeButton = null
        setTimeout(() => {
          this.activeButton = token
          this.ref.nativeElement.classList.add('show-content')
          this.styleContent['minHeight'] = getComputedStyle(this.options.nativeElement).height

          setTimeout(() => {
            // Scroll to the bottom when opening
            const options_pane = document.getElementById(`options_${this.position}`)
            if (options_pane) { options_pane.scrollIntoView({ behavior: 'smooth' }) }
          }, 350);
        }, 50);
      }, 200);
    } else {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        this.activeButton = null
        this.selectedButton?.adaptContentHeight(null)
      }, 200);
    }
  }

  updateHeightAfterContentChange(height: number) {
    const h = height - 60.4 - remToPixels(1.5) - remToPixels(0.375 * 2)
    this.selectedButton?.adaptContentHeight(h)
  }
}

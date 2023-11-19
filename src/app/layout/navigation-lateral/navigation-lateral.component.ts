import { Component, OnInit, Input, HostListener, Output, EventEmitter, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { ButtonMenuComponent, IButtonMenuData } from 'src/app/components/button-menu/button-menu.component';
import { animations } from 'src/app/data/animations';

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

  protected opened = false
  public get isOpen(): boolean {
    return this.opened
  }

  protected activeButton: IButtonMenuData | null = null

  constructor(
    private ref: ElementRef
  ) { }

  ngOnInit(): void { }

  public toggleOpen() {
    this.opened = !this.opened
    if (!this.opened) {
      this.toggleContent(null)
    }
    this.clicked.emit({ position: this.position, opened: this.opened })
  }

  toggleVisibilityOnCollapse(options: { token: string, isColladpsed: boolean }, src: 'event' | 'remote') {
    if (options.isColladpsed) {
      this.toggleContent(null)
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

    const button = this.buttons.find(bt => bt.buttonData.token === options.token)
    if (src === 'event') this.menuSelected.emit({
      data: button?.buttonData || null,
      isColladpsed: options.isColladpsed,
      src: this.position
    })
  }

  remoteOpen(token: string, isColladpsed: boolean) {
    const button = this.buttons.find(bt => bt.buttonData.token === token)
    isColladpsed ? button?.collapse(null, 'remote') : button?.expand('remote')
    this.toggleVisibilityOnCollapse({ token, isColladpsed }, 'remote')
  }

  optionSelected(data: IButtonMenuData) {
    if (!this.activeButton) {
      this.toggleContent(data)
    } else {
      if (data.token !== this.activeButton.token) {
        this.toggleContent(data)
      } else {
        this.toggleContent(null)
      }
    }
  }

  toggleContent(token: IButtonMenuData | null) {
    if (!!token) {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        this.activeButton = token
        this.ref.nativeElement.classList.add('show-content')
      }, 200);
    } else {
      this.ref.nativeElement.classList.remove('show-content')
      setTimeout(() => {
        this.activeButton = null
      }, 200);
    }
  }
}

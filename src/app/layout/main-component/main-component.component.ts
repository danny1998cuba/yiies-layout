import { Component, OnInit, ChangeDetectorRef, ViewChild, QueryList, ContentChildren, AfterViewInit, AfterContentInit, ViewChildren, HostBinding, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationLateralComponent } from '../navigation-lateral/navigation-lateral.component';
import { menu_example } from 'src/app/data/mock-data';
import { IActionButton, POSITION, Position } from 'src/app/data/utils.model';
import { NavigationSuperiorComponent } from '../navigation-superior/navigation-superior.component';
import { NavigationInferiorComponent } from '../navigation-inferior/navigation-inferior.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ButtonMenuType, IButtonMenuData, INavigation, clearActive } from 'src/app/data/button-menu.model';
import { cloneDeep } from 'lodash-es';
import { remToPixels } from 'src/app/utils/utils';
import { ActionPanelComponent } from 'src/app/components/action-panel/action-panel.component';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss']
})
export class MainComponentComponent implements OnInit {
  @HostBinding('style.--navigation-content-height') navContentHeight = '0px'
  @HostBinding('style.--navigation-content-top') navContentTop = '0px'
  @HostBinding('style.--navigation-height') navHeight = '0px'

  protected images = ['../assets/images/yoiin_2.jpg', '../assets/images/Triip_1.webp']
  protected selectedImage = 0

  @ViewChild('nav_left') navLeft!: NavigationLateralComponent
  @ViewChild('nav_right') navRight!: NavigationLateralComponent
  @ViewChild('nav_top') navTop!: NavigationSuperiorComponent
  @ViewChild('nav_bottom') navBottom!: NavigationInferiorComponent
  @ViewChild('content') content!: ActionPanelComponent

  selectedButton: IButtonMenuData | null = null
  protected _orientation!: 'portrait' | 'landscape'
  hideHeader: boolean = false
  showTopFooter: boolean = false

  // Menus
  menus = menu_example
  form: FormGroup
  positions = [POSITION.TOP, POSITION.BOTTOM, 'lateral']
  activeNavigations = [true, true, true]
  ButtonMenuType = ButtonMenuType

  // For content
  previousOpenedPosition: Position | null = null
  openedPosition: Position | null = null
  styleContent: any = {}

  activeButton!: IActionButton | null

  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _ref: ElementRef
  ) {
    this.form = new FormGroup({
      navigations: new FormArray([
        new FormControl(true),
        new FormControl(true),
        new FormControl(true)
      ])
    })

    this.form.get('navigations')?.valueChanges.subscribe(change => {
      this.activeNavigations = change

      setTimeout(() => {
        if (this.selectedButton) {
          if (!!this.navRight) this.navRight.remoteOpen(this.selectedButton.token || '', false)
          if (!!this.navLeft) this.navLeft.remoteOpen(this.selectedButton.token || '', false)
          if (!!this.navTop) this.navTop.remoteOpen(this.selectedButton.token || '', false)
          if (!!this.navBottom) this.navBottom.remoteOpen(this.selectedButton.token || '', false)
        }
      }, 200);
    })
  }

  ngOnInit(): void {
    this._orientation = window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape'
    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      this._orientation = e.matches ? 'portrait' : 'landscape'
    });

    window.addEventListener('resize', () => {
      const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
      let factor = 98

      if (this.selectedButton?.type === ButtonMenuType.SIDEBAR) {
        if ((this.navLeft.isOpen || this.navRight.isOpen)) {
          factor = 55
        } else {
          if (this._orientation === 'portrait') {
            factor = 55
          } else {
            factor = 0
          }
        }
      }
      this.navHeight = `${vpHeight - factor}px`
    })

    this._cdr.detectChanges()
  }

  changeImage() {
    this.selectedImage++
    this.selectedImage = this.selectedImage % 2
  }

  syncLateralnavigations(options: { position: Position, opened: boolean }) {
    if (options.opened) this.previousOpenedPosition = cloneDeep(this.openedPosition)
    this.openedPosition = options.opened ? options.position : options.position === this.previousOpenedPosition ? this.openedPosition : null

    if (!options.opened || (options.opened && options.position !== this.previousOpenedPosition)) {
      this.onActiveButtonChange(this.activeButton)
      if (this.selectedButton && this.selectedButton.type === ButtonMenuType.SIDEBAR) {
        if (!!this.navTop) this.navTop.remoteOpen(this.selectedButton.token || '', true)
        if (!!this.navLeft) this.navLeft.remoteOpen(this.selectedButton.token || '', true)
        if (!!this.navRight) this.navRight.remoteOpen(this.selectedButton.token || '', true)
        if (!!this.navBottom) this.navBottom.remoteOpen(this.selectedButton.token || '', true)
      }
    }

    if (options.position === POSITION.LEFT && options.opened) {
      if (this.navRight && this.navRight.isOpen) this.navRight.toggleOpen()
      if (this.navTop && this.navTop.isOpen) this.navTop.toggleOpen()
      if (this.navBottom && this.navBottom.isOpen) this.navBottom.toggleOpen()
    }
    if (options.position === POSITION.RIGHT && options.opened) {
      if (this.navLeft && this.navLeft.isOpen) this.navLeft.toggleOpen()
      if (this.navTop && this.navTop.isOpen) this.navTop.toggleOpen()
      if (this.navBottom && this.navBottom.isOpen) this.navBottom.toggleOpen()
    }
    if (options.position === POSITION.TOP) {
      if (options.opened) {
        if (this.navRight && this.navRight.isOpen) this.navRight.toggleOpen()
        if (this.navLeft && this.navLeft.isOpen) this.navLeft.toggleOpen()
        if (this.navBottom && this.navBottom.isOpen) this.navBottom.toggleOpen()
        this.hideHeader = true
      } else {
        this.hideHeader = false
      }
    }
    if (options.position === POSITION.BOTTOM) {
      if (options.opened) {
        if (this.navRight && this.navRight.isOpen) this.navRight.toggleOpen()
        if (this.navLeft && this.navLeft.isOpen) this.navLeft.toggleOpen()
        if (this.navTop && this.navTop.isOpen) this.navTop.toggleOpen()
        this.hideHeader = true
        this.showTopFooter = true
      } else {
        this.hideHeader = false
        this.showTopFooter = false
      }
    }
  }

  interact() {
    console.log('back Int');
  }

  syncLateralnavigationsOptions(options: { data: IButtonMenuData | null, isColladpsed: boolean, src: Position }) {
    this.selectedButton = options.isColladpsed ? null : options.data
    if (options.isColladpsed && this.activeButton && this.activeButton.button.type !== ButtonMenuType.SIDEBAR) this.onActiveButtonChange(this.activeButton)

    switch (options.src) {
      case POSITION.LEFT:
        if (!!this.navRight) this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navTop) this.navTop.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navBottom) this.navBottom.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      case POSITION.RIGHT:
        if (!!this.navLeft) this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navTop) this.navTop.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navBottom) this.navBottom.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      case POSITION.TOP:
        if (!!this.navLeft) this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navRight) this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navBottom) this.navBottom.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      case POSITION.BOTTOM:
        if (!!this.navTop) this.navTop.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navLeft) this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navRight) this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      default:
        if (!!this.navTop) this.navTop.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navLeft) this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navRight) this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
        if (!!this.navBottom) this.navBottom.remoteOpen(options.data?.token || '', options.isColladpsed)
    }
  }

  innerHeightChanged(height: number) {
    this.navContentHeight = `${height !== 0 ? height + 55 : 0}px`
    this.navContentTop = `${height !== 0 ? height : 0}px`

    const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    let factor = 98

    if (this.selectedButton?.type === ButtonMenuType.SIDEBAR) {
      if ((this.navLeft.isOpen || this.navRight.isOpen)) {
        factor = 55
      } else {
        if (this._orientation === 'portrait') {
          factor = 55
        } else {
          factor = 0
        }
      }
    }
    this.navHeight = `${height !== 0 ? height : vpHeight - factor}px`

    const back2 = document.getElementById('back2')
    if (this._orientation === 'portrait') {
      setTimeout(() => {
        if (back2) {
          // back2.style.zIndex = '0'
          back2.style.opacity = '1'
        }
      }, 10);
    } else {
      if (back2) {
        // back2.style.zIndex = '-1'
        back2.style.opacity = '0'
      }
    }
  }

  isActiveNavigation(nav: string): boolean {
    if (nav === POSITION.TOP) return this.activeNavigations[0]
    if (nav === POSITION.BOTTOM) return this.activeNavigations[1]
    if (nav === 'lateral') return this.activeNavigations[2]
    return false
  }

  getNavigationByPosition(pos: Position | null): INavigation | null {
    switch (pos) {
      case POSITION.BOTTOM:
        return this.navBottom
      case POSITION.TOP:
        return this.navTop
      case POSITION.LEFT:
        return this.navLeft
      case POSITION.RIGHT:
        return this.navRight
      default:
        return null
    }
  }

  // Content Pane
  updateHeightAfterContentChange(height: number) {
    this.innerHeightChanged(height); // FIXME: Chrome iPhone doesn't calculate it right when changing orientation.
    const h = height - 60.4 - remToPixels(1.5) - remToPixels(0.375 * 2)
    const nav = this.getNavigationByPosition(this.openedPosition)

    if (this.openedPosition === POSITION.TOP || this.openedPosition === POSITION.BOTTOM) {
      nav?.selectedButton?.adaptContentWidth(false)
    } else {
      nav?.selectedButton?.adaptContentHeight(h)
    }
  }

  onActiveButtonChange(data: IActionButton | null) {
    const nav = this.getNavigationByPosition(this.openedPosition)

    if (nav) {
      if (data) {
        if (data.button.type === ButtonMenuType.MENU) {
          this._nulleable(data, nav)
        } else if (!this.activeButton) {
          this._active(data, nav)
        } else {
          if (data.button.token !== this.activeButton.button.token) {
            clearActive(this.menus)
            this._active(data, nav)
          } else {
            this._nulleable(data, nav)
          }
        }
      }
    }
  }

  private _nulleable(data: IActionButton, nav: INavigation) {
    this.activeButton = null
    nav.activeButton = null
    data.button.active = false
    this.loadContent()
    nav.toggleContent(null)
  }

  private _active(data: IActionButton, nav: INavigation) {
    this.activeButton = data
    nav.activeButton = data
    data.button.active = true
    this.loadContent()
    nav.toggleContent(data)
  }

  onContentStyleChange(height: number) {
    if (height === 0) {
      this.styleContent = {}
    } else {
      if (this.activeButton?.button.type !== ButtonMenuType.SIDEBAR) this.styleContent['minHeight'] = `${height}px`
      this.content.adjustHeight()
    }
  }

  onContentStyleChangeTB(height: number) {
    if (height === 0) {
      this.styleContent = {}
    } else {
      this.content.adjustHeight()
    }
  }

  loadContent() {
    const contents = document.getElementsByClassName('ap-inner-block')
    for (let index = 0; index < contents.length; index++) {
      const elem = contents.item(index)
      elem?.classList.add('d-none')
    }

    if (this.activeButton) {
      if (this.activeButton.button.componentId && !!contents.namedItem(this.activeButton.button.componentId)) {
        contents.namedItem(this.activeButton.button.componentId)?.classList.remove('d-none')
      } else {
        contents.namedItem('default')?.classList.remove('d-none')
      }
    } else {
      document.getElementById('default')?.classList.remove('d-none')
    }

  }
}

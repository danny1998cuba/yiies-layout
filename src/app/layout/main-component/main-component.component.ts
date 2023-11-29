import { Component, OnInit, ChangeDetectorRef, ViewChild, QueryList, ContentChildren, AfterViewInit, AfterContentInit, ViewChildren, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationLateralComponent } from '../navigation-lateral/navigation-lateral.component';
import { menu_example } from 'src/app/data/mock-data';
import { POSITION, Position } from 'src/app/data/utils.model';
import { NavigationSuperiorComponent } from '../navigation-superior/navigation-superior.component';
import { NavigationInferiorComponent } from '../navigation-inferior/navigation-inferior.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { IButtonMenuData } from 'src/app/data/button-menu.model';

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

  selectedButton: IButtonMenuData | null = null
  protected _orientation!: 'portrait' | 'landscape'
  hideHeader: boolean = false
  showTopFooter: boolean = false

  // Menus
  menus = menu_example
  form: FormGroup
  positions = [POSITION.TOP, POSITION.BOTTOM, 'lateral']
  activeNavigations = [true, true, true]

  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
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

    this._cdr.detectChanges()
  }

  changeImage() {
    this.selectedImage++
    this.selectedImage = this.selectedImage % 2
  }

  syncLateralnavigations(options: { position: Position, opened: boolean }) {
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
    }
  }

  innerHeightChanged(height: number) {
    this.navContentHeight = `${height !== 0 ? height + 55 : 0}px`
    this.navContentTop = `${height !== 0 ? height : 0}px`

    const vpHeight = parseFloat(getComputedStyle(document.documentElement).height)
    this.navHeight = `${height !== 0 ? height : vpHeight - 98}px`

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
}

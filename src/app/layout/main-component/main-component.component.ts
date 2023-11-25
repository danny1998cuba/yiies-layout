import { Component, OnInit, ChangeDetectorRef, ViewChild, QueryList, ContentChildren, AfterViewInit, AfterContentInit, ViewChildren, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationLateralComponent } from '../navigation-lateral/navigation-lateral.component';
import { menu_example } from 'src/app/data/mock-data';
import { ButtonMenuComponent, IButtonMenuData } from 'src/app/components/button-menu/button-menu.component';
import { POSITION, Position } from 'src/app/data/utils.model';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss']
})
export class MainComponentComponent implements OnInit {
  @HostBinding('style.--navigation-content-height') navContentHeight = '0px'

  protected images = ['../assets/images/yoiin_2.jpg', '../assets/images/Triip_1.webp']
  protected selectedImage = 0

  protected selectedNavigation: string = 'lateral'
  protected NAVIGATION_POSITION = {
    LATERAL: 'lateral',
    SUPERIOR: 'superior',
    INFERIOR: 'inferior'
  }

  @ViewChild('nav_left') navLeft!: NavigationLateralComponent
  @ViewChild('nav_right') navRight!: NavigationLateralComponent
  @ViewChildren(ButtonMenuComponent) buttons!: QueryList<ButtonMenuComponent>;

  selectedButton: ButtonMenuComponent | null = null
  protected _orientation!: 'portrait' | 'landscape'
  hideHeader: boolean = false

  // Menus
  menus = menu_example

  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.selectedNavigation = this._route.snapshot.url[0].path

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
    if (options.position === POSITION.LEFT && options.opened && this.navRight.isOpen) {
      this.navRight.toggleOpen()
    }
    if (options.position === POSITION.RIGHT && options.opened && this.navLeft.isOpen) {
      this.navLeft.toggleOpen()
    }
    if (options.position === POSITION.TOP) {
      if (options.opened) {
        // Check for the rest of navigations
        this.hideHeader = true
      } else {
        this.hideHeader = false
      }
    }
    // TODO: Sync the rest of the navigations.
  }

  interact() {
    console.log('back Int');
  }

  syncLateralnavigationsOptions(options: { data: IButtonMenuData | null, isColladpsed: boolean, src: Position }) {
    // TODO: Sync the rest of the navigations.
    switch (options.src) {
      case POSITION.LEFT:
        this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      case POSITION.RIGHT:
        this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
        break;
      case POSITION.TOP:
        break;
      case POSITION.BOTTOM:
        break;
    }
  }

  innerHeightChanged(height: number) {
    this.navContentHeight = `${height !== 0 ? height + 55 : 0}px`
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
}

import { Component, OnInit, ChangeDetectorRef, ViewChild, QueryList, ContentChildren, AfterViewInit, AfterContentInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavigationLateralComponent } from '../navigation-lateral/navigation-lateral.component';
import { menu_example } from 'src/app/data/mock-data';
import { ButtonMenuComponent, IButtonMenuData } from 'src/app/components/button-menu/button-menu.component';

@Component({
  selector: 'app-main-component',
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss']
})
export class MainComponentComponent implements OnInit {
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

  // Menus
  menus = menu_example

  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.selectNavigation()

    console.log(this.navLeft);
    console.log(this.navRight);
  }

  selectNavigation() {
    this.selectedNavigation = this._route.snapshot.url[0].path
    this._cdr.detectChanges()
  }

  changeImage() {
    this.selectedImage++
    this.selectedImage = this.selectedImage % 2
  }

  interact() {
    console.log('Interacting with background');
  }

  syncLateralnavigations(options: { position: string, opened: boolean }) {
    if (options.position === 'left' && options.opened && this.navRight.isOpen) {
      this.navRight.toggleOpen()
    }
    if (options.position === 'right' && options.opened && this.navLeft.isOpen) {
      this.navLeft.toggleOpen()
    }
  }

  syncLateralnavigationsOptions(options: { data: IButtonMenuData | null, isColladpsed: boolean, src: 'left' | 'right' }) {
    if (options.src === 'left') this.navRight.remoteOpen(options.data?.token || '', options.isColladpsed)
    if (options.src === 'right') this.navLeft.remoteOpen(options.data?.token || '', options.isColladpsed)
  }

  toggleVisibilityOnCollapse(token: string) {
    console.log('expanding', token);

    this.buttons.forEach((bt, index) => {
      if (bt.buttonData.token !== token) {
        bt.element.nativeElement.classList.add('opacity-0');
      } else {

      }
    })
  }
}

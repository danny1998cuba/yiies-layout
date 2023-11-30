import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { ServiceService } from 'src/app/data/service.service';

export enum SidebarMainMenu {
  SYSTEMS = 'SYSTEMS',
  HERE_NOW = 'HERE_NOW',
  ORDERS = 'ORDERS',
  POSTS = 'POSTS',
  DATA = 'DATA',
  DOCUMENTS = 'DOCUMENTS',
  MEMBRESY = 'MEMBRESY',
  INT_PROP = 'INT_PROP',
  PROFILE = 'PROFILE',
  FAQS = 'FAQS',
  YIIES = 'YIIES',
  ADMIN = 'ADMIN'
}

export interface ISidebarMainMenu {
  show: boolean,
  type: SidebarMainMenu,
  menuTitle: string,
  icon: string,
  routerLink: string,
  itemMenu: ISidebarItemMenu[],
  access: string[],
}
export interface ISidebarItemMenu {
  show: boolean,
  menuTitle: string,
  icon: string,
  routerLink: string,
  subMenu: ISidebarSubMenu[],
  access: string[],
  enabled: boolean,
}

export interface ISidebarSubMenu {
  show: boolean,
  menuTitle: string,
  icon: string,
  routerLink: string,
  enabled: boolean,
  access: string[];
}

export interface IMenuProfile {
  profile_id: string;
  type: AccessType;
  style: ProfileStyleType;
  class: string;
  name: string;
}

export enum AccessType {
  GUSTO = 'GUSTO',
  SUPER = 'SUPER',
  FRUVEG = 'FRUVEG',
  PHARMACY = 'PHARMACY',
  WHOLESALER = 'WHOLESALER',
  SUPER_CHAIN = 'SUPER_CHAIN',
  GUSTO_CHAIN = 'GUSTO_CHAIN',
  FRUVEG_CHAIN = 'FRUVEG_CHAIN',
  PHARMACY_CHAIN = 'PHARMACY_CHAIN',
  WHOLESALER_CHAIN = 'WHOLESALER_CHAIN',
  ADMIN = 'ADMIN',
  YOIINER = 'YOIINER',
  CLIIENT = 'CLIIENT',
  PROVIIDER = 'PROVIIDER',
  TOUR = 'TOUR',
  SERVICE = 'SERVICE',
}

export enum ProfileStyleType {
  YOIINER = 'YOIINER',
  CLIIENT = 'CLIIENT',
  PROVIIDER = 'PROVIIDER',
  OTHER = 'OTHER'
}

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('class') class = "d-flex flex-column";

  userData!: any
  accountSellerCompleted!: boolean;

  private _myPostMenu: ISidebarItemMenu[] = [];
  private _myPostMenuShow: ISidebarItemMenu[] = [];
  private _myOderMenu: ISidebarItemMenu[] = [];
  private _myOderMenuShow: ISidebarItemMenu[] = [];
  private _intPropMenu: ISidebarItemMenu[] = [];
  private _intPropMenuShow: ISidebarItemMenu[] = [];
  private _systemsMenu: ISidebarItemMenu[] = [];
  private _systemsMenuShow: ISidebarItemMenu[] = [];
  private _adminMenu: ISidebarItemMenu[] = [];
  private _adminMenuShow: ISidebarItemMenu[] = [];

  private _myProfileMenu: ISidebarItemMenu[] = [];
  private _myProfileMenuShow: ISidebarItemMenu[] = [];

  menu$: BehaviorSubject<ISidebarMainMenu[]>;
  menu: ISidebarMainMenu[] = [];

  protected yiies_profile_group!: FormGroup;

  fruvegType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;
  garageType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;
  gustoType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;
  pharmacyType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;
  superType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;
  wholesalerType!: 'SHOP' | 'CHAIN' | 'BOTH' | null;

  searchForm!: FormControl;
  accessProfileMenu$: BehaviorSubject<IMenuProfile[]>;
  accessProfileToggle$: BehaviorSubject<IMenuProfile[]>;

  accessProfileMenu: IMenuProfile[] = [];
  accessProfileToggle: IMenuProfile[] = [];

  selectedProfile!: IMenuProfile;
  contractAmount!: { buyer: any, seller: any };

  constructor(
    private _cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _service: ServiceService
  ) {
    console.log('building menus');

    this.menu$ = new BehaviorSubject<any[]>([]);
    this.accessProfileMenu$ = new BehaviorSubject<any[]>([]);
    this.accessProfileToggle$ = new BehaviorSubject<any[]>([]);

    _service.getAuthUser().pipe(tap((data: any) => {
      console.log('got user');
      this.userData = data;
      this.accountSellerCompleted = !!data ? this.userData?.seller_data?.active : null;
      this.fruvegType = !!data ? (this.userData?.chain_store_fruveg ? 'CHAIN' : 'SHOP') : null;
      this.garageType = !!data ? (this.userData?.chain_store_garage ? 'CHAIN' : 'SHOP') : null;
      this.gustoType = !!data ? (this.userData?.chain_store_gusto ? 'CHAIN' : 'SHOP') : null;
      this.pharmacyType = !!data ? (this.userData?.chain_store_pharmacy ? 'CHAIN' : 'SHOP') : null;
      this.superType = !!data ? (this.userData?.chain_store_super ? 'CHAIN' : 'SHOP') : null;
      this.wholesalerType = !!data ? (this.userData?.chain_store_wholesaler ? 'CHAIN' : 'SHOP') : null;

      if (!!data) {
        this.selectedProfile = {
          name: '',
          profile_id: data?.active_profile.profile_id,
          style: data?.active_profile.type === AccessType.YOIINER || data?.active_profile.type === AccessType.CLIIENT || data?.active_profile.type === AccessType.PROVIIDER ? data?.active_profile.type as ProfileStyleType : ProfileStyleType.OTHER,
          class: data?.active_profile.type === AccessType.YOIINER || data?.active_profile.type === AccessType.CLIIENT || data?.active_profile.type === AccessType.PROVIIDER ? `active-${data?.active_profile.type.toLowerCase()}` : 'active-other',
          type: data?.active_profile.type
        };

        switch (this.selectedProfile.style) {
          case ProfileStyleType.CLIIENT:
            document.documentElement.style.setProperty('--kt-yiies-active-profile-front-color', 'var(--kt-yiies-orange)');
            document.documentElement.style.setProperty('--kt-yiies-active-profile-bg-color', 'var(--kt-yiies-orange-light)');
            break;
          case ProfileStyleType.PROVIIDER:
            document.documentElement.style.setProperty('--kt-yiies-active-profile-front-color', 'var(--kt-blue-yiies)');
            document.documentElement.style.setProperty('--kt-yiies-active-profile-bg-color', 'var(--kt-blue-yiies-light)');
            break;
          case ProfileStyleType.YOIINER:
            document.documentElement.style.setProperty('--kt-yiies-active-profile-front-color', 'var(--kt-blue-madu)');
            document.documentElement.style.setProperty('--kt-yiies-active-profile-bg-color', 'var(--kt-blue-madu-light)');
            break;
          case ProfileStyleType.OTHER:
            document.documentElement.style.setProperty('--kt-yiies-active-profile-front-color', 'var(--kt-gray-400)');
            document.documentElement.style.setProperty('--kt-yiies-active-profile-bg-color', 'var(--kt-gray-200)');
            break;
          default:
            break;
        }
        const c_a_buyer = data?.contract_amount_buyer;
        const buyer = {
          shopping: c_a_buyer?.shopping | 0,
          solution: c_a_buyer?.solution | 0,
          fruveg: c_a_buyer?.fruveg | 0,
          gusto: c_a_buyer?.gusto | 0,
          garage: c_a_buyer?.garage | 0,
          pharmacy: c_a_buyer?.pharmacy | 0,
          super: c_a_buyer?.super | 0,
          wholesaler: c_a_buyer?.wholesaler | 0,
          ride: c_a_buyer?.ride | 0,
          welcome: c_a_buyer?.welcome | 0,
          property: c_a_buyer?.property | 0,
          tour: c_a_buyer?.tour | 0,
        };
        const c_a_seller = data?.contract_amount_seller;
        const seller = {
          shopping: c_a_seller?.shopping | 0,
          solution: c_a_seller?.solution | 0,
          fruveg: c_a_seller?.fruveg | 0,
          gusto: c_a_seller?.gusto | 0,
          garage: c_a_seller?.garage | 0,
          pharmacy: c_a_seller?.pharmacy | 0,
          super: c_a_seller?.super,
          wholesaler: c_a_seller?.wholesaler | 0,
          ride: c_a_seller?.ride,
          welcome: c_a_seller?.welcome | 0,
          property: c_a_seller?.property | 0,
          tour: c_a_seller?.tour | 0,
        };
        this.contractAmount = { buyer, seller };

        console.log('load user data');
      } else {
        document.documentElement.style.setProperty('--kt-yiies-active-profile-front-color', 'var(--kt-blue-yiies)');
        document.documentElement.style.setProperty('--kt-yiies-active-profile-bg-color', 'var(--kt-blue-yiies-light)');
        console.log('no user data');
        this._buildMenu();
      }
      this._cdr.markForCheck();
    })).subscribe();



  }
  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.searchForm = new FormControl();
    this.searchForm.valueChanges.subscribe(change => {

      this._filterMenu(change);
    });
    this._buildMenu();
  }

  selectProfile(item: IMenuProfile) {
    const pos = this.userData?.profile.findIndex((profile: any) => profile._id === item.profile_id);
    alert(`changing to profile ${pos}`)
  }

  private _buildMenu() {
    console.log('building menus in method');
    this._buildAccesProfileMenu();
    this._buildMyPostMenu();
    this._buildMyOrderMenu();
    this._buildIntelectualPropertyMenu();
    this._buildSystemsMenu();
    this._buildAdminMenu();
    this._buildMyProfileMenu();

    this.menu = [];

    if (this._systemsMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.SYSTEMS,
        show: true,
        menuTitle: 'MENU.TITLES.SYSTEMS',
        icon: 'system',
        routerLink: '/system',
        access: [],
        itemMenu: this._systemsMenuShow,
      });
    }
    this.menu.push({
      type: SidebarMainMenu.HERE_NOW,
      show: true,
      menuTitle: 'MENU.TITLES.BIPPID_GO',
      icon: 'hereNow',
      routerLink: '/here-now',
      access: [],
      itemMenu: [],
    });
    if (this._myOderMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.ORDERS,
        show: true,
        menuTitle: 'MENU.TITLES.ORDERS',
        icon: 'sheet',
        routerLink: '/orders',
        access: [],
        itemMenu: this._myOderMenuShow,
      });
    }
    if (this._myPostMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.POSTS,
        show: true,
        menuTitle: 'MENU.TITLES.MY_POSTS',
        icon: 'system',
        routerLink: '/dashboard/user',
        access: [],
        itemMenu: this._myPostMenuShow,
      });
    }
    if (!!this.userData?._id) {
      this.menu.push({
        type: SidebarMainMenu.DATA,
        show: true,
        menuTitle: 'MENU.TITLES.MY_DATA',
        icon: 'graphPie',
        routerLink: '/data',
        access: [],
        itemMenu: [],
      });
    }
    if (!!this.userData?._id) {
      this.menu.push({
        type: SidebarMainMenu.DOCUMENTS,
        show: true,
        menuTitle: 'MENU.TITLES.MY_DOCS',
        icon: 'textBoxSearchOutline',
        routerLink: 'dashboard/user/documents',
        access: [],
        itemMenu: [],
      });
    }
    if (!!this.userData?._id) {
      this.menu.push({
        type: SidebarMainMenu.MEMBRESY,
        show: true,
        menuTitle: 'MENU.TITLES.MEMB',
        icon: 'membresy',
        routerLink: '/membership',
        access: [],
        itemMenu: [],
      });
    }
    if (this._intPropMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.INT_PROP,
        show: true,
        menuTitle: 'MENU.TITLES.INT_PROP',
        icon: 'intelectualProperty',
        routerLink: '/int-prop',
        access: [],
        itemMenu: this._intPropMenuShow,
      });
    }
    if (this._myProfileMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.PROFILE,
        show: true,
        menuTitle: 'MENU.TITLES.MY_PROFILE',
        icon: 'userCircle',
        routerLink: '/me/profile',
        access: [],
        itemMenu: this._myProfileMenuShow,
      });
    }
    this.menu.push({
      type: SidebarMainMenu.FAQS,
      show: true,
      menuTitle: 'MENU.TITLES.FAQS',
      icon: 'question',
      routerLink: '/faqs/announcements',
      access: [],
      itemMenu: [],
    });
    this.menu.push({
      type: SidebarMainMenu.YIIES,
      show: true,
      menuTitle: 'MENU.TITLES.YIIES',
      icon: 'yiies',
      routerLink: '/main-about-us/about-us',
      access: [],
      itemMenu: [],
    });
    if (this._adminMenuShow.length > 0) {
      this.menu.push({
        type: SidebarMainMenu.ADMIN,
        show: true,
        menuTitle: 'MENU.TITLES.ADMIN',
        icon: 'userShield',
        routerLink: '/admin-manager',
        access: [],
        itemMenu: this._adminMenuShow,
      });
    }

    console.log('all built');
    this.menu$.next(this.menu);
  }

  private _buildAccesProfileMenu() {
    if (!!this.selectedProfile?.type) {
      let toggle = [], menu = [];
      const accessProfileMenu: { toggle: IMenuProfile[], menu: IMenuProfile[] } = { toggle: [], menu: [] };
      switch (this.selectedProfile.type) {
        case AccessType.CLIIENT:
        case AccessType.PROVIIDER:
        case AccessType.YOIINER:
          toggle = this.userData?.profile?.filter((item: any) => item.type === AccessType.YOIINER || item.type === AccessType.CLIIENT || item.type === AccessType.PROVIIDER);
          menu = this.userData?.profile?.filter((item: any) => item.type !== AccessType.YOIINER && item.type !== AccessType.CLIIENT && item.type !== AccessType.PROVIIDER);

          break;
        default:
          toggle = this.userData?.profile?.filter((item: any) => item.type === AccessType.CLIIENT || item.type === AccessType.PROVIIDER || item._id === this.selectedProfile.profile_id);
          menu = this.userData?.profile?.filter((item: any) => item.type !== AccessType.CLIIENT && item.type !== AccessType.PROVIIDER && item._id !== this.selectedProfile.profile_id);

          break;
      }
      toggle?.forEach((item: any) => {
        accessProfileMenu.toggle.push({
          name: item.name,
          profile_id: item._id,
          style: item.type === AccessType.YOIINER || item.type === AccessType.CLIIENT || item.type === AccessType.PROVIIDER ? item.type as ProfileStyleType : ProfileStyleType.OTHER,
          class: item.type === AccessType.YOIINER || item.type === AccessType.CLIIENT || item.type === AccessType.PROVIIDER ? `active-${item.type.toLowerCase()}` : 'active-other',
          type: item.type,
        });
      });
      menu?.forEach((item: any) => {
        accessProfileMenu.menu.push({
          name: item.name,
          profile_id: item._id,
          style: item.type === AccessType.YOIINER ? item.type as ProfileStyleType : ProfileStyleType.OTHER,
          class: item.type === AccessType.YOIINER ? `active-${item.type.toLowerCase()}` : 'active-other',
          type: item.type
        });
      });
      this.accessProfileMenu$.next(accessProfileMenu.menu);
      this.accessProfileToggle$.next(accessProfileMenu.toggle);
      this.accessProfileMenu = cloneDeep(accessProfileMenu.menu);
      this.accessProfileToggle = cloneDeep(accessProfileMenu.toggle);
      this._cdr.detectChanges();
    }

  }


  private _filterMenu(value: string) {
    if (value) {
      const menu: ISidebarMainMenu[] = []
      this.menu.forEach(menuValue => {
        const menuAux = cloneDeep(menuValue);
        if (String(menuValue.menuTitle).toLowerCase().indexOf(value.toLowerCase()) > -1) {
          menu.push(menuAux);
        } else if (menuValue.itemMenu.length > 0) {
          menuAux.itemMenu = [];
          menuValue.itemMenu.forEach(itemMenuValue => {
            const menuItemAux = cloneDeep(itemMenuValue);

            if (String(itemMenuValue.menuTitle).toLowerCase().indexOf(value.toLowerCase()) > -1) {
              menuAux.itemMenu.push(menuItemAux);
            } else if (itemMenuValue.subMenu.length > 0) {
              menuItemAux.subMenu = itemMenuValue.subMenu.filter(subMenuValue => String(subMenuValue.menuTitle).toLowerCase().indexOf(value.toLowerCase()) > -1);
              if (menuItemAux.subMenu.length > 0) {
                menuAux.itemMenu.push(menuItemAux);
              }
            }
          });
          if (menuAux.itemMenu.length > 0) {
            menu.push(menuAux);
          }
        }
      });
      this.menu$.next(menu);
    } else {
      this.menu$.next(this.menu);
    }
  }


  private _buildMyProfileMenu() {
    this._myProfileMenu = [
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.MY_PROFILE',
        icon: 'userCircle',
        routerLink: `/me/profile/${this.userData?._id}`,
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.CONFIGURATION',
        icon: 'settings',
        routerLink: `/me/configuration/${this.userData?._id}`,
        access: [],
        enabled: true,
        subMenu: [],
      },
    ];

    this._myProfileMenuShow = this._myProfileMenu.filter(menu => menu.show);
  }

  private _buildMyPostMenu() {
    this._myPostMenu = [
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PROVIDER_ACCOUNT',
        icon: 'triip',
        routerLink: '/dashboard/user/seller-config',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.ANNOUNCEMENTS',
        icon: 'yoiin',
        routerLink: '/dashboard/user/announcements',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SHOPPING',
        icon: 'shopii',
        routerLink: '/dashboard/user/shoppii',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SOLUTIONS',
        icon: 'serviice',
        routerLink: '/dashboard/user/serviice',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.BOOKIIT',
            icon: 'serviice',
            routerLink: '/dashboard/user/serviice-bookiit',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.QUOTIIT',
            icon: 'serviice',
            routerLink: '/dashboard/user/serviice-quotiit',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'tooliit',
            routerLink: '/dashboard/user/serviice-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.FRUVEG',
        icon: 'tooliit',
        routerLink: '/dashboard/user/tooliit',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: this.fruvegType === 'CHAIN' ? 'MENU.TITLES.CHAIN' : 'MENU.TITLES.STORE',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit',
            access: [],
          },
          {
            show: this.fruvegType === 'CHAIN',
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-shops',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-products',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SUPPLIERS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-suppliers',
            access: [],
          },
          {
            enabled: true,
            show: (this.userData?.shop_fruveg?.chain_data?.chain_store && this.userData?.shop_fruveg?.chain_data?.status === 'ACTIVE') || this.fruvegType === 'CHAIN' ||
              (this.userData?.chain_store_fruveg?.chain_data?.chain_store && this.userData?.chain_store_fruveg.chain_data?.status === 'ACTIVE'),
            menuTitle: 'MENU.TITLES.PRE_ORDER_CHAIN',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-preorders',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-upload',
            access: [],
          },
          {
            enabled: true,
            show: this.fruvegType === 'SHOP',
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-ratings',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-access-level',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'tooliit',
            routerLink: '/dashboard/user/tooliit-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PHARMACY',
        icon: 'pharmii',
        routerLink: '/dashboard/user/pharmii',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: this.pharmacyType === 'CHAIN' ? 'MENU.TITLES.CHAIN' : 'MENU.TITLES.STORE',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii',
            access: [],
          },
          {
            enabled: true,
            show: this.pharmacyType === 'CHAIN',
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-shops',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-products',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.SUPPLIERS',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-suppliers',
            access: [],
          },
          {
            enabled: true,
            show: (this.userData?.shop_pharmacy?.chain_data?.chain_store && this.userData?.shop_pharmacy?.chain_data?.status === 'ACTIVE') || this.pharmacyType === 'CHAIN' ||
              (this.userData?.chain_store_pharmacy?.chain_data?.chain_store && this.userData?.chain_store_pharmacy.chain_data?.status === 'ACTIVE'),
            menuTitle: 'MENU.TITLES.PRE_ORDER_CHAIN',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-preorders',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-upload',
            access: [],
          },
          {
            enabled: true,
            show: this.pharmacyType === 'SHOP',
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-ratings',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-access-level',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'pharmii',
            routerLink: '/dashboard/user/pharmii-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SUPER',
        icon: 'grocerii',
        routerLink: '/dashboard/user/grocerii',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: this.superType === 'CHAIN' ? 'MENU.TITLES.CHAIN' : 'MENU.TITLES.STORE',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii',
            access: [],
          },
          {
            show: this.superType === 'CHAIN',
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-shops',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-products',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SUPPLIERS',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-suppliers',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRE_ORDER',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-preorders',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-upload',
            access: [],
          },
          {
            show: this.superType === 'SHOP',
            enabled: true,
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-ratings',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-access-level',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'grocerii',
            routerLink: '/dashboard/user/grocerii-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.GUSTO',
        icon: 'yummii',
        routerLink: '/dashboard/user/yummii',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: this.gustoType === 'CHAIN' ? 'MENU.TITLES.CHAIN' : 'MENU.TITLES.STORE',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii',
            access: [],
          },
          {
            show: this.gustoType === 'CHAIN',
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii-shops',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii-products',
            access: [],
          },
          {
            enabled: true,
            show: (this.userData?.shop_gusto?.chain_data?.chain_store && this.userData?.shop_gusto?.chain_data?.status === 'ACTIVE') || this.gustoType === 'CHAIN' ||
              (this.userData?.chain_store_gusto?.chain_data?.chain_store && this.userData?.chain_store_gusto?.chain_data?.status === 'ACTIVE'),
            menuTitle: 'MENU.TITLES.PRE_ORDER_CHAIN',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii-preorders',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii-upload',
            access: [],
          },
          {
            enabled: true,
            show: this.gustoType === 'SHOP',
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: '.yummii',
            routerLink: '/dashboard/user/yummii-ratings',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'yummii',
            routerLink: '/dashboard/user/yummii-access-level',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'yummii',
            routerLink: '/dashboard/user/yummii-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.MALL',
        icon: 'kiiosk',
        routerLink: '/dashboard/user/kiiosk',
        enabled: true,
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.STORE',
            icon: 'kiiosk',
            routerLink: '/dashboard/user/kiiosk',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'kiiosk',
            routerLink: '/dashboard/user/kiiosk-products',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'kiiosk',
            routerLink: '/dashboard/user/kiiosk-upload',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'kiiosk',
            routerLink: '/dashboard/user/kiiosk-ratings',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.GARAGE',
        icon: 'listiit',
        routerLink: '/dashboard/user/listiit',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.STORE',
            icon: 'listiit',
            routerLink: '/dashboard/user/listiit',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'listiit',
            routerLink: '/dashboard/user/listiit-products',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'listiit',
            routerLink: '/dashboard/user/listiit-upload',
            access: [],
          },
          {
            show: this.garageType === 'SHOP',
            enabled: true,
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'listiit',
            routerLink: '/dashboard/user/listiit-ratings',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.WHOLESALER',
        icon: 'tooliit',
        routerLink: '/dashboard/user/wholesaler',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: this.wholesalerType === 'CHAIN' ? 'MENU.TITLES.CHAIN' : 'MENU.TITLES.STORE',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler',
            access: [],
          },
          {
            show: this.wholesalerType === 'CHAIN',
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-shops',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-products',
            access: [],
          },
          {
            show: this.wholesalerType === 'SHOP',
            enabled: true,
            menuTitle: 'MENU.TITLES.BUYERS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-buyers',
            access: [],
          },
          {
            enabled: true,
            show: (this.userData?.shop_wholesaler?.chain_data?.chain_store && this.userData?.shop_wholesaler?.chain_data?.status === 'ACTIVE') || this.wholesalerType === 'CHAIN' ||
              (this.userData?.chain_store_wholesaler?.chain_data?.chain_store && this.userData?.chain_store_wholesaler.chain_data?.status === 'ACTIVE'),
            menuTitle: 'MENU.TITLES.PRE_ORDER_CHAIN',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-preorders',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.UPLOAD_BY_FILE',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-upload',
            access: [],
          },
          {
            enabled: true,
            show: this.fruvegType === 'SHOP',
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-ratings',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-access-level',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'tooliit',
            routerLink: '/dashboard/user/wholesaler-staff',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PROPERTY',
        icon: 'propertii',
        routerLink: '/dashboard/user/propertii',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.COMPANY_PROFILE',
            icon: 'propertii',
            routerLink: '/dashboard/user/propertii',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.BUYIIT',
            icon: 'propertii',
            routerLink: '/dashboard/user/propertii-buyiit',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.RENTIIT',
            icon: 'propertii',
            routerLink: '/dashboard/user/propertii-rentiit',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.WELCOME',
            icon: 'propertii',
            routerLink: '/dashboard/user/propertii-welcomii',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.RATINGS',
            icon: 'tooliit',
            routerLink: '/dashboard/user/propertii-ratings',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.RIDE',
        icon: 'riidePiiople',
        routerLink: '/dashboard/user/riide',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.GO',
            icon: 'riidePiiople',
            routerLink: '/dashboard/user/riide-piiople',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.DELIVERY',
            icon: 'riideThiings',
            routerLink: '/dashboard/user/riide-thiings',
            access: [],
          },
        ],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.TOUR',
        icon: 'triip',
        routerLink: '/dashboard/user/triip',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.TOUR',
            icon: 'serviice',
            routerLink: '/dashboard/user/triip',
            access: [],
          },
          {
            enabled: true,
            show: true,
            menuTitle: 'MENU.TITLES.STAFF',
            icon: 'tooliit',
            routerLink: '/dashboard/user/triip-staff',
            access: [],
          },
        ],
      },
    ];
    this._myPostMenuShow = this._myPostMenu.filter(menu => menu.show);
  }

  private _buildMyOrderMenu() {
    this._myOderMenu = [
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.SHOPPING',
        icon: 'shopii',
        routerLink: '/orders/shoppii/acquired',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS_ACQUIRED',
            icon: 'shopii',
            routerLink: '/orders/shoppii/acquired',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PRODUCTS_SOLD_OR_RENTED',
            icon: 'shopii',
            routerLink: '/orders/shoppii/sold-or-rented',
            access: [],
          },
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.SOLUTIONS',
        icon: 'serviice',
        routerLink: '/orders/serviice/required',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.solution > 0,
            menuTitle: 'MENU.TITLES.QUOTATION_RECEIVER',
            icon: 'serviice',
            routerLink: '/orders/serviice/required',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.seller?.solution > 0,
            menuTitle: 'MENU.TITLES.QUOTATION_SUPPLIER',
            icon: 'serviice',
            routerLink: '/orders/serviice/response',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.buyer?.solution > 0 || this.contractAmount?.seller?.solution > 0,
            menuTitle: 'MENU.TITLES.CONTRACTS',
            icon: 'serviice',
            routerLink: '/orders/serviice/contracts',
            access: [],
          },
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.FRUVEG',
        icon: 'tooliit',
        routerLink: '/orders/tooliit/purchased-packages',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.fruveg > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: 'tooliit',
            routerLink: '/orders/tooliit/purchased-packages',
            access: [],
          },
          {
            enabled: this.contractAmount?.seller?.fruveg > 0,
            show: this.userData?.chain_store_fruveg || this.userData?.shop_fruveg,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: 'tooliit',
            routerLink: '/orders/tooliit/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PHARMACY',
        icon: 'pharmii',
        routerLink: '/orders/pharmii/purchased-packages',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.pharmacy > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: 'pharmii',
            routerLink: '/orders/pharmii/purchased-packages',
            access: [],
          },
          {
            enabled: this.contractAmount?.seller?.pharmacy > 0,
            show: this.userData?.chain_store_pharmacy || this.userData?.shop_pharmacy,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: 'pharmii',
            routerLink: '/orders/pharmii/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.SUPER',
        icon: 'grocerii',
        routerLink: '/orders/grocerii/purchased-packages',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.super > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: 'grocerii',
            routerLink: '/orders/grocerii/purchased-packages',
            access: [],
          },
          {
            enabled: this.contractAmount?.seller?.super > 0,
            show: this.userData?.chain_store_super || this.userData?.shop_super,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: 'grocerii',
            routerLink: '/orders/grocerii/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.GUSTO',
        icon: 'yummii',
        routerLink: '/dashboard/user/yummii',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.gusto > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: '.yummii',
            routerLink: '/orders/yummii/purchased-packages',
            access: [],
          },
          {
            show: this.userData?.chain_store_gusto || this.userData?.shop_gusto,
            enabled: this.contractAmount?.seller?.gusto > 0,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: '.yummii',
            routerLink: '/orders/yummii/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.GARAGE',
        icon: 'listiit',
        routerLink: '/dashboard/user/listiit',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.garage > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: 'listiit',
            routerLink: '/orders/listiit/purchased-packages',
            access: [],
          },
          {
            show: this.userData?.chain_store_garage || this.userData?.shop_garage,
            enabled: this.contractAmount?.buyer?.garage > 0,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: 'listiit',
            routerLink: '/orders/listiit/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.WHOLESALER',
        icon: 'tooliit',
        routerLink: '/dashboard/user/wholesaler',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.wholesaler > 0,
            menuTitle: 'MENU.TITLES.PACKAGES_PURCHASED',
            icon: 'tooliit',
            routerLink: '/orders/wholesaler/purchased-packages',
            access: [],
          },
          {
            show: this.userData?.chain_store_wholesaler || this.userData?.shop_wholesaler,
            enabled: this.contractAmount?.seller?.wholesaler > 0,
            menuTitle: 'MENU.TITLES.SOLD_PACKAGES',
            icon: 'tooliit',
            routerLink: '/orders/wholesaler/sold-packages',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.RIDE',
        icon: 'riidePiiople',
        routerLink: '/orders/riide/client',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.ride > 0,
            menuTitle: 'MENU.TITLES.TRAVELS_CLIENT',
            icon: 'riidePiiople',
            routerLink: '/orders/riide/client',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.buyer?.ride > 0,
            menuTitle: 'MENU.TITLES.TRAVELS_SHARED_TO_YOU',
            icon: 'riidePiiople',
            routerLink: '/orders/riide/shared',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.seller?.ride > 0,
            menuTitle: 'MENU.TITLES.TRAVELS_PROVIDER',
            icon: 'riidePiiople',
            routerLink: '/orders/riide/provider',
            access: [],
          }
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.TOUR',
        icon: 'triip',
        routerLink: '/orders/triip/acquired',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.tour > 0,
            menuTitle: 'MENU.TITLES.TOUR_SERVICES_ACQUIRED',
            icon: 'triip',
            routerLink: '/orders/triip/acquired',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.seller?.tour > 0,
            menuTitle: 'MENU.TITLES.TOUR_SERVICES_PROVIDER',
            icon: 'triip',
            routerLink: '/orders/triip/provider',
            access: [],
          },
        ],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.WELCOME',
        icon: 'propertiiWelcomii',
        routerLink: '/orders/welcome/rented-by-me',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: this.contractAmount?.buyer?.welcome > 0,
            menuTitle: 'MENU.TITLES.WELCOMS_RENTED_BY_ME',
            icon: 'propertiiWelcomii',
            routerLink: '/orders/welcome/rented-by-me',
            access: [],
          },
          {
            show: true,
            enabled: this.contractAmount?.seller?.welcome > 0,
            menuTitle: 'MENU.TITLES.WELCOMS_RENTED_TO_ME',
            icon: 'propertiiWelcomii',
            routerLink: '/orders/welcome/rented-to-me',
            access: [],
          },
        ],
      },
    ];
    this._myOderMenuShow = this._myOderMenu.filter(menu => menu.show);
  }

  private _buildIntelectualPropertyMenu() {
    this._intPropMenu = [
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.MOTION_PICTURES',
        icon: 'yoiin',
        routerLink: '/int-prop/motion-pics',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.MUSIC',
        icon: 'yoiin',
        routerLink: '/int-prop/music',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PAINT',
        icon: 'yoiin',
        routerLink: '/int-prop/paint',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.DESIGN',
        icon: 'yoiin',
        routerLink: '/int-prop/design',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.DRAW',
        icon: 'yoiin',
        routerLink: '/int-prop/draw',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PATENT',
        icon: 'yoiin',
        routerLink: '/int-prop/patent',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PHOTO',
        icon: 'yoiin',
        routerLink: '/int-prop/photo',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.PRINTMAKING',
        icon: 'yoiin',
        routerLink: '/int-prop/printmaking',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.RECORDINGS',
        icon: 'yoiin',
        routerLink: '/int-prop/recordings',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: !!this.userData?._id,
        menuTitle: 'MENU.TITLES.TRADEMARK',
        icon: 'yoiin',
        routerLink: '/int-prop/trademark',
        access: [],
        enabled: true,
        subMenu: [],
      }
    ]
    this._intPropMenuShow = this._intPropMenu.filter(menu => menu.show);
  }

  private _buildSystemsMenu() {
    this._systemsMenu = [
      {
        show: true,
        menuTitle: 'MENU.TITLES.ME',
        icon: 'yoiin',
        routerLink: '/yoiin/common',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SHOPPING',
        icon: 'shopii',
        routerLink: '/shoppii',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SOLUTIONS_BOOKIIT',
        icon: 'serviice',
        routerLink: '/serviice/serviice-bookiit',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SOLUTIONS_QUOTIIT',
        icon: 'serviice',
        routerLink: '/serviice/serviice-quotiit',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PHARMACY',
        icon: 'pharmii',
        routerLink: '/system/pharmii/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.SUPER',
        icon: 'grocerii',
        routerLink: '/system/grocerii/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.GUSTO',
        icon: 'yummii',
        routerLink: '/system/yummii/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.FRUVEG',
        icon: 'tooliit',
        routerLink: '/system/tooliit/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.MALL',
        icon: 'kiiosk',
        routerLink: '/system/kiiosk/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.GARAGE',
        icon: 'listiit',
        routerLink: '/system/listiit/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.DELIVERY',
        icon: 'riideThiings',
        routerLink: '/transport/riide-thiings',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.GO',
        icon: 'riidePiiople',
        routerLink: '/transport/riide-piiople',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PROPERTY_WELCOME',
        icon: 'propertiiWelcomii',
        routerLink: '/system/propertii-welcomii',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PROPERTY_RENTIIT',
        icon: 'propertii',
        routerLink: '/system/propertii-rentiit',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.PROPERTY_BUYIIT',
        icon: 'propertii',
        routerLink: '/system/propertii-buyiit',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: true,
        menuTitle: 'MENU.TITLES.TOUR',
        icon: 'triip',
        routerLink: '/system/triip/all',
        access: [],
        enabled: true,
        subMenu: [],
      },
    ]
    this._systemsMenuShow = this._systemsMenu.filter(menu => menu.show);
  }

  private _buildAdminMenu() {
    this._adminMenu = [
      {
        show: this.userData?.role === 'ADMIN',
        menuTitle: 'MENU.TITLES.CONTACT_US',
        icon: 'users2',
        routerLink: '/admin-manager/contact-us',
        access: [],
        enabled: true,
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        menuTitle: 'MENU.TITLES.CATEGORIES',
        icon: 'system',
        routerLink: '/admin-manager/categories',
        access: [],
        enabled: true,
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPPING',
            icon: 'system',
            routerLink: '/admin-manager/categories/shopping',
            access: []
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SOLUTIONS',
            icon: 'system',
            routerLink: '/admin-manager/categories/solutions',
            access: []
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PROFESSIONS',
            icon: 'system',
            routerLink: '/admin-manager/categories/professions',
            access: []
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.FILTER_OTHER',
            icon: 'system',
            routerLink: '/admin-manager/categories/filter-tips',
            access: []
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.FAQS',
        icon: 'question',
        routerLink: '/admin-manager/FAQs',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.SHOPPING',
        icon: 'shopii',
        routerLink: '/admin-manager/shopii',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.SHOPS',
        icon: 'shopii',
        routerLink: '/admin-manager/shops',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SHOPS',
            icon: 'shopii',
            routerLink: '/admin-manager/shops/shops',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.CHAINS',
            icon: 'shopii',
            routerLink: '/admin-manager/shops/chains',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.MESSAGES',
            icon: 'shopii',
            routerLink: '/admin-manager/shops/messages',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.SOLUTIONS',
        icon: 'serviice',
        routerLink: '/admin-manager/serviice',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_SERVICES',
            icon: 'serviice',
            routerLink: '/admin-manager/serviice/serviice',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ACTIVITY_REGISTER',
            icon: 'serviice',
            routerLink: '/admin-manager/serviice/activity',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.TOUR',
        icon: 'triip',
        routerLink: '/admin-manager/triip',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_SERVICES',
            icon: 'serviice',
            routerLink: '/admin-manager/triip/serviice',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ACTIVITY_REGISTER',
            icon: 'serviice',
            routerLink: '/admin-manager/triip/activity',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.RIDE',
        icon: 'riidePiiople',
        routerLink: '/admin-manager/riide',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_SERVICES',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/serviice',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.VEHICLE',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/vehicle',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ACTIVITY_REGISTER',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/activity',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.SETTINGS',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/settings',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.TRAVELS_LIST',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/travels',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.TRAVELS_PROVICER_LIST',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/riide/shared-trip',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.MAP_EVENTS',
        icon: 'riidePiiople',
        routerLink: '/admin-manager/map-events',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.MAP_EVENTS_HISTORY',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/map-events/record/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.MAP_EVENTS_TYPE',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/map-events/types/list',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.PROPERTY',
        icon: 'propertiiWelcomii',
        routerLink: '/admin-manager/propertii',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.COMPANIES_PROFILE',
            icon: 'propertiiWelcomii',
            routerLink: '/admin-manager/propertii/profile/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.PROPERTIES',
            icon: 'propertiiWelcomii',
            routerLink: '/admin-manager/propertii/list',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.ECONOMIC_ACTIVITIES',
        icon: 'economicActivity',
        routerLink: '/admin-manager/economic-activities',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.REPORTS',
        icon: 'sheet',
        routerLink: '/admin-manager/reports',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USERS_REPORTS',
            icon: 'sheet',
            routerLink: '/admin-manager/reports/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_REPORT',
            icon: 'sheet',
            routerLink: '/admin-manager/reports/tags',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.CLAIM',
        icon: 'gridOne',
        routerLink: '/admin-manager/claims',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_CLAIMS',
            icon: 'gridOne',
            routerLink: '/admin-manager/claims/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_CLAIMS_REASONS',
            icon: 'gridOne',
            routerLink: '/admin-manager/claims/reasons',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.DEVOLUTIONS',
        icon: 'devolution',
        routerLink: '/admin-manager/returns',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_DEVOLUTIONS',
            icon: 'devolution',
            routerLink: '/admin-manager/returns/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_DEVOLUTION_REASONS',
            icon: 'devolution',
            routerLink: '/admin-manager/returns/reasons',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.CANCELATIONS',
        icon: 'cancelSquare',
        routerLink: '/admin-manager/cancellation',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USER_CANCELLATIONS',
            icon: 'cancelSquare',
            routerLink: '/admin-manager/cancellations/list',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_CANCELLATION_REASONS',
            icon: 'cancelSquare',
            routerLink: '/admin-manager/cancellations/reasons',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.ANNOUNCEMENTS',
        icon: 'yoiin',
        routerLink: '/admin-manager/announcement/list',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.ME',
        icon: 'yoiin',
        routerLink: '/admin-manager/yoiin/post/list',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.USERS',
        icon: 'users',
        routerLink: '/admin-manager/users',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USERS',
            icon: 'users',
            routerLink: '/admin-manager/users',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.USERS_ONLINE',
            icon: 'users',
            routerLink: '/admin-manager/online-users',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.ACCESS',
        icon: 'users',
        routerLink: '/admin-manager/administrators',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMINISTRATORS',
            icon: 'users',
            routerLink: '/admin-manager/administrators',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ACCESS_PROFILES',
            icon: 'users',
            routerLink: '/admin-manager/access-level',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.DOCUMENTS',
        icon: 'sheet',
        routerLink: '/admin-manager/documents',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_LOCATIONS',
            icon: 'sheet',
            routerLink: '/admin-manager/locations',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_ECONOMIC_ACTIVITY',
            icon: 'sheet',
            routerLink: '/admin-manager/commercial',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ISSUERS',
            icon: 'sheet',
            routerLink: '/admin-manager/issuers',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.DOCUMENTS',
            icon: 'sheet',
            routerLink: '/admin-manager/documents',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.DOCUMENTS_UPLOADED',
            icon: 'sheet',
            routerLink: '/admin-manager/documents-uploaded',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.SOCKET',
        icon: 'sheet',
        routerLink: '/admin-manager/socket',
        access: [],
        subMenu: [
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.GO',
            icon: 'riidePiiople',
            routerLink: '/admin-manager/socket/go',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.DELIVERY',
            icon: 'riideThiings',
            routerLink: '/admin-manager/socket/delivery',
            access: [],
          },
          {
            show: true,
            enabled: true,
            menuTitle: 'MENU.TITLES.ADMIN_TASK',
            icon: 'sheet',
            routerLink: '/admin-manager/socket/task',
            access: [],
          },
        ],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.TITLES.CRON',
        icon: 'timeCards',
        routerLink: '/admin-manager/cron',
        access: [],
        subMenu: [],
      },
      {
        show: this.userData?.role === 'ADMIN',
        enabled: true,
        menuTitle: 'MENU.MENU.TITLES.EXTRACTORS',
        icon: 'whosIn',
        routerLink: '/admin-manager/extrators',
        access: [],
        subMenu: [],
      },
    ];

    this._adminMenuShow = this._adminMenu.filter(menu => menu.show);
  }

  ngOnDestroy(): void {
  }
}

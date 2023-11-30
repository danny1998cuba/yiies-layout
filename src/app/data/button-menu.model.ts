// Model
export interface IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string;
    show: boolean;
    active: boolean;
    subOptions?: IButtonMenuData[];

    type: ButtonMenuType
    selected?: SelectionOptionButtonMenu | null;
    isSelected?: boolean
}

// Functions
export function clearActive(menus: IButtonMenuData[]) {
    menus.forEach(m => {
        m.active = false
        if (!!m.subOptions) clearActive(m.subOptions)
    })
}

export function clearSelected(menus: SelectionOptionButtonMenu[]) {
    menus.forEach(m => {
        m.isSelected = false
    })
}

export enum ButtonMenuType {
    SIMPLE_SELECTION = 'simple-selection',          // done    
    SELECTION_OPTION = 'selection-option',          // done
    ACTION = 'action',                              // pending
    SIDEBAR = 'sidebar',                            // done
    MENU = 'menu',                                  // pending submenus
    WITH_CONTENT = 'with-content',                  // done
    WITH_CONTENT_AND_MENU = 'with-content-and-menu' // pending
}

export type AllButtonMenuTypes = ActionButtonMenu | MenuButtonMenu | ContentButtonMenu | ContentAndMenuButtonMenu |
    SidebarOptionButtonMenu | SelectionButtonMenu | SelectionOptionButtonMenu

export class ActionButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.ACTION;

    action: (arg?: any[]) => any

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        action: (arg?: any[]) => any,
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.action = action
        this.name = !!name ? name : undefined
    }
}

export class MenuButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.MENU;
    subOptions: IButtonMenuData[];

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        subOptions: IButtonMenuData[],
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.subOptions = subOptions
        this.name = !!name ? name : undefined
    }
}

export class ContentButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.WITH_CONTENT;
    // look for how to inject the content component

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.name = !!name ? name : undefined
    }

}

export class ContentAndMenuButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.WITH_CONTENT_AND_MENU;
    subOptions: IButtonMenuData[];
    // look for how to inject the content component

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        subOptions: IButtonMenuData[],
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.subOptions = subOptions
        this.name = !!name ? name : undefined
    }
}

export class SelectionButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.SIMPLE_SELECTION;
    subOptions: SelectionOptionButtonMenu[];

    selected: SelectionOptionButtonMenu | null = null;

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        subOptions: SelectionOptionButtonMenu[],
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.subOptions = subOptions

        this.name = !!name ? name : undefined
    }

    _change(
        selected: SelectionOptionButtonMenu | null,
        callback: (selected: SelectionOptionButtonMenu | null) => void
    ) {
        if (selected) {
            if (!this.selected || selected.token !== this.selected.token) {
                selected.isSelected = true
                selected.active = true
                this.selected = selected
                clearActive(this.subOptions.filter(s => s.token !== selected.token))
                clearSelected(this.subOptions.filter(s => s.token !== selected.token))
                callback(selected)
            } else {
                this.selected = null
                clearActive(this.subOptions)
                clearSelected(this.subOptions)
                callback(null)
            }
        } else {
            callback(null)
            clearActive(this.subOptions)
            clearSelected(this.subOptions)
        }
    }
}

export class SelectionOptionButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.SELECTION_OPTION;
    isSelected: boolean = false

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.name = !!name ? name : undefined
    }
}

export class SidebarOptionButtonMenu implements IButtonMenuData {
    icon: string;
    token: string;
    index: number;
    name?: string | undefined;
    show: boolean;
    active: boolean;
    type: ButtonMenuType = ButtonMenuType.SIDEBAR;
    // Inject sidebar component

    constructor(
        icon: string,
        token: string,
        index: number,
        show: boolean,
        active: boolean,
        name?: string,
    ) {
        this.icon = icon
        this.token = token
        this.index = index
        this.show = show
        this.active = active
        this.name = !!name ? name : undefined
    }
}


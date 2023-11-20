import { IButtonMenuData } from "../components/button-menu/button-menu.component";

export function remToPixels(rem: number): number {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function clearActive(menus: IButtonMenuData[]) {
    menus.forEach(m => {
        m.active = false
        if (!!m.subOptions) clearActive(m.subOptions)
    })
}
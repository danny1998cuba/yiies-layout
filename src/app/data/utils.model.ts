import { IButtonMenuData } from "../components/button-menu/button-menu.component";

export interface IActionButton {
    button: IButtonMenuData,
    bound: DOMRect
}

export type Position = 'left' | 'right' | 'top' | 'bottom'
export enum POSITION { LEFT = 'left', RIGHT = 'right', TOP = 'top', BOTTOM = 'bottom' }
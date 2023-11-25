import { trigger, style, state, animate, transition } from '@angular/animations'

export const animations = [
    trigger('hideMenuVartical', [
        state('opened-menu', style({})),
        state('hidden-menu', style({
            height: '0px',
            overflow: 'hidden',
            minHeight: '0px',
            padding: '0',
            margin: '0',
        })),
        transition('opened-menu => hidden-menu', [
            animate('0.2s')
        ]),
        transition('hidden-menu => opened-menu', [
            animate('0.2s 0.2s')
        ]),
    ]),
    trigger('hideMenuHorizontal', [
        state('opened-menu', style({})),
        state('hidden-menu', style({
            width: '0px',
            overflow: 'hidden',
            minWidth: '0px',
            padding: '0',
            margin: '0',
        })),
        transition('opened-menu => hidden-menu', [
            animate('0.2s')
        ]),
        transition('hidden-menu => opened-menu', [
            animate('0.2s 0.2s')
        ]),
    ]),
]
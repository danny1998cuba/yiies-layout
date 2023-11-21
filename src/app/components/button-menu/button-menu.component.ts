import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';
import { reference } from '@popperjs/core';
import { IActionButton } from 'src/app/data/utils.model';

export interface IButtonMenuData {
  icon: string;
  token: string;
  index: number;
  name?: string;
  show: boolean;
  active: boolean;
  subOptions?: IButtonMenuData[];
}

@Component({
  selector: 'app-button-menu',
  templateUrl: './button-menu.component.html',
  styleUrls: ['./button-menu.component.scss']
})
export class ButtonMenuComponent implements OnInit {
  @HostBinding('class') class = 'glass-btn d-flex flex-column-reverse align-items-center'
  @HostBinding('style') style: any = { width: '45px' }
  @HostBinding('style.--index-btn') index: number = 0

  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.expand('click')
    if (this.isAction) this.action(this.buttonData, $event)
  }

  @Input('button-data') buttonData: IButtonMenuData = { icon: 'default', token: 'default', index: 0, show: true, active: false }
  @Input() direction: 'vertical' | 'horizontal' = 'vertical'
  @Input() position: 'left' | 'right' = 'left'

  @Output() expanding: EventEmitter<{ token: string, isColladpsed: boolean }> = new EventEmitter()
  @Output() selectedAction: EventEmitter<IActionButton> = new EventEmitter()

  isAction: boolean = true
  collapsed: boolean = true

  optionsStyle: any = {}

  constructor(
    private ref: ElementRef
  ) { }

  get element(): ElementRef {
    return this.ref
  }

  ngOnInit(): void {
    this.isAction = !this.buttonData.subOptions || this.buttonData.subOptions.length === 0
    this.index = this.buttonData.index
  }

  action(data: IButtonMenuData, $event: Event) {
    $event.stopPropagation()
    const target = $event.currentTarget as Element
    this.selectedAction.emit({
      button: data,
      bound: target.getBoundingClientRect()
    })
  }

  expand(from: 'click' | 'remote') {
    this.collapsed = false
    this.element.nativeElement.classList.add('ellapsed')
    if (from === 'click') this.expanding.emit({ token: this.buttonData.token, isColladpsed: false })
  }

  collapse($event: MouseEvent | null, from: 'click' | 'remote') {
    if ($event) $event.stopPropagation()
    this.collapsed = true
    this.element.nativeElement.classList.remove('ellapsed')
    if (from === 'click') this.expanding.emit({ token: this.buttonData.token, isColladpsed: true })
  }

  adaptContentHeight(height: number | null) {
    if (height) {
      this.optionsStyle['height'] = `${height}px`
      this.optionsStyle['minHeight'] = `${height}px`
    } else {
      delete this.optionsStyle['height']
    }
    console.log(this.optionsStyle);
  }

}

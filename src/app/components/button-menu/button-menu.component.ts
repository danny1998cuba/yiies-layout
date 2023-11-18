import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';

export interface IButtonMenuData {
  icon: string;
  token: string;
  index: number;
  name?: string;
  show: boolean;
  subOptions?: IButtonMenuData[];
}

@Component({
  selector: 'app-button-menu',
  templateUrl: './button-menu.component.html',
  styleUrls: ['./button-menu.component.scss']
})
export class ButtonMenuComponent implements OnInit {
  @HostBinding('class') class = 'btn glass-btn d-flex flex-column-reverse align-items-center px-0'
  @HostBinding('style') style: any = { width: '45px' }
  @HostBinding('style.--index-btn') index: number = 0

  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.isAction ? this.action() : this.collapsed ? this.expand('click') : null
  }

  @Input('button-data') buttonData: IButtonMenuData = { icon: 'default', token: 'default', index: 0, show: true }
  @Input() direction: 'vertical' | 'horizontal' = 'vertical'

  @Output() expanding: EventEmitter<{ token: string, isColladpsed: boolean }> = new EventEmitter()

  isAction: boolean = true
  collapsed: boolean = true

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

  action() {
    console.log('Action');
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

}
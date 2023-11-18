import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation-lateral',
  templateUrl: './navigation-lateral.component.html',
  styleUrls: ['./navigation-lateral.component.scss']
})
export class NavigationLateralComponent implements OnInit {
  @HostListener('click', ['$event'])
  click($event: PointerEvent) {
    $event.stopPropagation()
    this.toggleOpen()
  }
  @HostListener('document:click') clickOut() {
    this.opened = false
  }

  @Input() position: 'left' | 'right' = 'left'

  @Output() clicked: EventEmitter<{ position: string, opened: boolean }> = new EventEmitter()

  protected opened = false
  public get isOpen(): boolean {
    return this.opened
  }

  constructor() { }

  ngOnInit(): void {
  }

  public toggleOpen() {
    this.opened = !this.opened
    this.clicked.emit({ position: this.position, opened: this.opened })
  }

}

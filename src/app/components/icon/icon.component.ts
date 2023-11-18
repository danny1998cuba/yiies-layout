import { Component, ContentChildren, Input, OnInit, QueryList, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {

  @Input() public icon!: string;
  @Input() public set setClass(object: any) {
    const keys = Object.keys(object);
    this.class = "";
    for (let k of keys) {
      if (object[k]) {
        this.class = `${k}`;
      }
    }
  }
  public class!: string;

  constructor() { }

  ngOnInit(): void {
  }

}

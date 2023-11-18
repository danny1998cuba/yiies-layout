import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationSuperiorComponent } from './navigation-superior.component';

describe('NavigationSuperiorComponent', () => {
  let component: NavigationSuperiorComponent;
  let fixture: ComponentFixture<NavigationSuperiorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationSuperiorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationSuperiorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

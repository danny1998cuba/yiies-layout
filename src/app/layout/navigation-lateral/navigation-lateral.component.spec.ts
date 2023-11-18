import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationLateralComponent } from './navigation-lateral.component';

describe('NavigationLateralComponent', () => {
  let component: NavigationLateralComponent;
  let fixture: ComponentFixture<NavigationLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationLateralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationLateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

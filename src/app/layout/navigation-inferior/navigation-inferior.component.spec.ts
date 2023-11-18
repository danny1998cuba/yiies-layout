import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationInferiorComponent } from './navigation-inferior.component';

describe('NavigationInferiorComponent', () => {
  let component: NavigationInferiorComponent;
  let fixture: ComponentFixture<NavigationInferiorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationInferiorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationInferiorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

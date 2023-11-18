import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DynamicFooterComponent } from './layout/dynamic-footer/dynamic-footer.component';
import { NavigationLateralComponent } from './layout/navigation-lateral/navigation-lateral.component';
import { NavigationSuperiorComponent } from './layout/navigation-superior/navigation-superior.component';
import { NavigationInferiorComponent } from './layout/navigation-inferior/navigation-inferior.component';
import { MainComponentComponent } from './layout/main-component/main-component.component';
import { IconComponent } from './components/icon/icon.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonMenuComponent } from './components/button-menu/button-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicFooterComponent,
    NavigationLateralComponent,
    NavigationSuperiorComponent,
    NavigationInferiorComponent,
    MainComponentComponent,
    IconComponent,
    ButtonMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

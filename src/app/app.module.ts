import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DynamicFooterComponent } from './layout/dynamic-footer/dynamic-footer.component';
import { NavigationLateralComponent } from './layout/navigation-lateral/navigation-lateral.component';
import { NavigationSuperiorComponent } from './layout/navigation-superior/navigation-superior.component';
import { NavigationInferiorComponent } from './layout/navigation-inferior/navigation-inferior.component';
import { MainComponentComponent } from './layout/main-component/main-component.component';

@NgModule({
  declarations: [
    AppComponent,
    DynamicFooterComponent,
    NavigationLateralComponent,
    NavigationSuperiorComponent,
    NavigationInferiorComponent,
    MainComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

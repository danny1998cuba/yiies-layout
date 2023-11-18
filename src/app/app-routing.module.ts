import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponentComponent } from './layout/main-component/main-component.component';

const routes: Routes = [
  {
    path: 'lateral',
    component: MainComponentComponent
  },
  {
    path: 'superior',
    component: MainComponentComponent
  },
  {
    path: 'inferior',
    component: MainComponentComponent
  },
  {
    path: '',
    redirectTo: '/lateral',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/lateral',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

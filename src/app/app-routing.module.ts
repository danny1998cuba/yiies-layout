import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponentComponent } from './layout/main-component/main-component.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponentComponent
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

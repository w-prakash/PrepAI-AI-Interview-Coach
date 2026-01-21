import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoleSelectPage } from './role-select.page';

const routes: Routes = [
  {
    path: '',
    component: RoleSelectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoleSelectPageRoutingModule {}

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'role-select',
    loadComponent: () =>
      import('./pages/role-select/role-select.page').then(m => m.RoleSelectPage),
  },
  {
    path: 'practice',
    loadComponent: () =>
      import('./pages/practice/practice.page').then(m => m.PracticePage),
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./pages/feedback/feedback.page').then(m => m.FeedbackPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

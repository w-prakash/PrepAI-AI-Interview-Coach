import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '',
redirectTo: 'tabs/dashboard',
pathMatch: 'full' },

{
  path: 'tabs',
  loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
  children: [
    {
      path: 'dashboard',
      loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
    },
    {
      path: 'role-select',
      loadComponent: () => import('./pages/role-select/role-select.page').then(m => m.RoleSelectPage)
    },
    {
      path: 'practice',
      loadComponent: () => import('./pages/practice/practice.page').then(m => m.PracticePage)
    },
    {
      path: 'history',
      loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage)
    },
     {
      path: 'feedback',
      loadComponent: () => import('./pages/feedback/feedback.page').then(m => m.FeedbackPage)
    }
  ]
},
{
path: 'history-detail/:index',
loadComponent: () => import('./pages/history-detail/history-detail.page').then(m => m.HistoryDetailPage)
},
{
  path: 'question-detail/:sessionIndex/:questionIndex',
  loadComponent: () =>
    import('./pages/question-detail/question-detail.page')
      .then(m => m.QuestionDetailPage)
}






];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

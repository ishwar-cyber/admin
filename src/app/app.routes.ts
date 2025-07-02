import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/layout/main/main').then(m => m.Main)
  },
  {
    path:'login',
    loadComponent:()=>import('./components/login/login').then(m => m.Login)
  },
];

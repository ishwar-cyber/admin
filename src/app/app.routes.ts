import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path:'login',
    loadComponent:()=>import('./components/authentication/login/login').then(m => m.Login)
  },
    {
    path: 'admin',
    loadComponent: () => import('./components/layout/main/main').then(m => m.Main),
    children: [
      {
        path:'',
        loadComponent:()=>import('./components/layout/dashboard/dashboard').then(m => m.Dashboard)
      },
    ]
  },
];

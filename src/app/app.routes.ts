import { Routes } from '@angular/router';

export const routes: Routes = [
     {
        path:'login',
        loadComponent:()=>import('./components/login/login').then(m => m.Login)
      },
];

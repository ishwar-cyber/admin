import { Routes } from '@angular/router';
import { authGuard } from './common/guards/auth-guard';
import { Main } from './components/layout/main/main';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path:'login',
    loadComponent:()=>import('./components/authentication/login/login').then(m => m.Login)
  },
    {
    path: 'admin',
    component: Main,
    // loadComponent: () => import('./components/layout/main/main').then(m => m.Main),
    canActivate: [authGuard],
    children: [
      {
        path:'',
        loadComponent: () => import('./components/layout/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path:'brand',
        loadComponent:()=>import('./components/brand/brand').then(m => m.Brand)
      },
      {
        path:'category',
        loadComponent:()=>import('./components/category/category').then(m => m.Category)
      },
      {
        path:'product',
        loadComponent:()=>import('./components/product/product').then(m => m.Product)
      },
      {
        path:'sub-category',
        loadComponent:()=>import('./components/sub-category/sub-category').then(m => m.SubCategory)
      },
      {
        path:'order',
        loadComponent:()=>import('./components/order/order').then(m => m.OrderComponent)
      },
      {
        path:'customer',
        loadComponent:()=>import('./components/customer/customer').then(m => m.Customer)
      },
      {
        path:'inventroy',
        loadComponent:()=>import('./components/inventroy/inventroy').then(m => m.Inventroy)
      },
      {
        path:'supplier',
        loadComponent:()=>import('./components/supplier/supplier').then(m => m.Supplier)
      },
      {
        path:'return',
        loadComponent:()=>import('./components/return/return').then(m => m.Return)
      },
      {
        path:'sell',
        loadComponent:()=>import('./components/sell/sell').then(m => m.Sell)
      },
      {
        path:'coupons',
        loadComponent:()=>import('./components/couponse/couponse').then(m => m.Couponse)
      },
      {
        path:'pincode',
        loadComponent:()=>import('./components/pincode/pincode').then(m => m.Pincode)
      },
      {
        path:'reviews',
        loadComponent:()=>import('./components/manage-review/manage-review').then(m => m.ManageReview)
      }
    ]
  },
];

import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { inject } from '@angular/core';
import { StorageHandler } from '../../services/storage-handler';
import { CookiesKeys } from '../commonConstant';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  const token = inject(StorageHandler).getCookie(CookiesKeys.authToken)
  if (authService.isAuthenticated() && token) {
    return true;
  }
  
  // Redirect to login page if not authenticated
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

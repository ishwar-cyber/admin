// src/app/core/interceptors/http.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageHandler } from '../../services/storage-handler';
import { CookiesKeys } from '../commonConstant';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const storageHandlerService = inject(StorageHandler);
  const router = inject(Router);

  const authToken = storageHandlerService.getCookie(CookiesKeys.authToken);

  // ✅ Attach token if available
  const authReq = authToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      })
    : req;

  // ✅ Intercept 401/403 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Interceptor caught error:', error.status, error.message);

      if (error.status === 401) {
        // Token invalid/expired
        storageHandlerService.deleteCookie(CookiesKeys.authToken);
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        // User forbidden
        router.navigate(['/forbidden']);
      }

      return throwError(() => error);
    })
  );
};

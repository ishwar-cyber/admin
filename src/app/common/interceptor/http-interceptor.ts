import { HttpInterceptorFn } from '@angular/common/http';
import { StorageHandler } from '../../services/storage-handler';
import { CookiesKeys } from '../commonConstant';
import { inject } from '@angular/core';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const storageHandlerService  = inject(StorageHandler)
  const authToken = storageHandlerService.getCookie(CookiesKeys.authToken);
  const reqWithHeader = req.clone({
    headers: req.headers.set('authToken', `Bearer ${authToken}`),
  });
  return next(reqWithHeader);
};

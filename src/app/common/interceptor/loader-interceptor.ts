import { HttpInterceptorFn } from '@angular/common/http';
import { Loader } from '../../services/loader';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
 const loader = inject(Loader);
  loader.show();
  return next(req).pipe(
    finalize(() => loader.hide())
  );
};

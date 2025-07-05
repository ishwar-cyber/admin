import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, Observable, throwError } from 'rxjs';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const route = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      let errorMessage = 'An unknown error occurred';
      if (error.status === 401) {
        errorMessage = 'Unauthorized: Please log in again';
        route.navigate(['/login']);
      }
      return throwError(() => new Error(errorMessage));
    })
  );
};

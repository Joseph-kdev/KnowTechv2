// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './authService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return from(auth.getIdToken()).pipe(
    switchMap((token) => {
      let authReq = req;

      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return next(authReq);
    }),
    catchError((error) => throwError(() => error))
  );
};

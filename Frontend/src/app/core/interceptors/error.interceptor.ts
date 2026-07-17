import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const friendlyMessage =
        typeof error.error?.message === 'string' ? error.error.message : 'Something went wrong while talking to the server.';

      return throwError(() => new Error(friendlyMessage));
    }),
  );

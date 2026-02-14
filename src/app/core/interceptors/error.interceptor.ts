import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.status_message ?? error.message ?? 'An unexpected error occurred.';

      messageService.add({
        severity: 'error',
        summary: `Error ${error.status}`,
        detail: message,
        life: 5000,
      });

      return throwError(() => error);
    }),
  );
};

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad Request';
            break;
          case 401:
            errorMessage = 'Unauthorized - Please login again';
            authService.logout();
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Forbidden - You do not have permission to access this resource';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflict - Resource already exists';
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation failed';
            break;
          case 500:
            errorMessage = 'Internal server error - Please try again later';
            break;
          case 503:
            errorMessage = 'Service unavailable - Please try again later';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }

      // Handle errors globally
      errorHandler.handleError(errorMessage);

      return throwError(() => error);
    })
  );
};
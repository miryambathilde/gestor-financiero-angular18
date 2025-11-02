import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Authentication interceptor
 * Adds JWT token to all HTTP requests and handles 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the authentication token
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  // Skip adding token for authentication endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/password-reset-request') ||
    req.url.includes('/auth/password-reset');

  let authReq = req;

  if (token && !isAuthEndpoint) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token might be expired or invalid
        console.warn('Unauthorized request detected. Logging out user.');

        // Clear auth state and redirect to login
        authService.logout(true);
      }

      return throwError(() => error);
    })
  );
};

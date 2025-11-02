import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication guard
 * Protects routes that require authentication
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isUserAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const redirectUrl = state.url;

  // Redirect to login page with return url
  router.navigate(['/login'], {
    queryParams: { returnUrl: redirectUrl }
  });

  return false;
};

/**
 * Guest guard
 * Prevents authenticated users from accessing auth pages (login, register)
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isUserAuthenticated()) {
    return true;
  }

  // User is already authenticated, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Role guard factory
 * Creates a guard that checks if user has required role
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (user.rol && allowedRoles.includes(user.rol)) {
      return true;
    }

    // User doesn't have required role, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  };
};

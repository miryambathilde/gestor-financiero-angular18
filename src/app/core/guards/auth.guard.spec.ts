import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models';

describe('Auth Guards', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
    rol: UserRole.USER,
    fechaRegistro: new Date()
  };

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isUserAuthenticated',
      'getCurrentUser'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('authGuard', () => {
    it('should allow access when user is authenticated', () => {
      authService.isUserAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to login when user is not authenticated', () => {
      authService.isUserAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, { url: '/productos' } as RouterStateSnapshot)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/productos' }
      });
    });
  });

  describe('guestGuard', () => {
    it('should allow access when user is not authenticated', () => {
      authService.isUserAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to dashboard when user is authenticated', () => {
      authService.isUserAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('roleGuard', () => {
    it('should allow access when user has required role', () => {
      authService.getCurrentUser.and.returnValue({ ...mockUser, rol: UserRole.ADMIN });

      const guard = roleGuard([UserRole.ADMIN]);
      const result = TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have required role', () => {
      authService.getCurrentUser.and.returnValue({ ...mockUser, rol: UserRole.USER });

      const guard = roleGuard([UserRole.ADMIN]);
      const result = TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should deny access and redirect to login when user is not authenticated', () => {
      authService.getCurrentUser.and.returnValue(null);

      const guard = roleGuard([UserRole.ADMIN]);
      const result = TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should allow access when user has one of multiple required roles', () => {
      authService.getCurrentUser.and.returnValue({ ...mockUser, rol: UserRole.USER });

      const guard = roleGuard([UserRole.ADMIN, UserRole.USER]);
      const result = TestBed.runInInjectionContext(() =>
        guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      );

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});

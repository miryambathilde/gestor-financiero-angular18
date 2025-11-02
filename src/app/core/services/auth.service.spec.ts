import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegisterData, User, UserRole } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
    rol: UserRole.USER,
    fechaRegistro: new Date(),
    ultimoAcceso: new Date()
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600000 // 1 hour
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerSpy }]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store auth data', done => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.isUserAuthenticated()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockUser);
        expect(service.getToken()).toBe(mockAuthResponse.token);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: credentials.email,
        password: credentials.password
      });
      req.flush(mockAuthResponse);
    });

    it('should handle login error', done => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      service.login(credentials).subscribe({
        error: error => {
          expect(error).toBeDefined();
          expect(service.isUserAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should store auth data in localStorage when rememberMe is true', done => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      service.login(credentials).subscribe(() => {
        expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('user_data')).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register successfully', done => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        nombre: 'New',
        apellido: 'User',
        aceptaTerminos: true
      };

      service.register(registerData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.isUserAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });

    it('should fail when passwords do not match', done => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'different-password',
        nombre: 'New',
        apellido: 'User',
        aceptaTerminos: true
      };

      service.register(registerData).subscribe({
        error: error => {
          expect(error.message).toBe('Las contraseñas no coinciden');
          done();
        }
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear auth data', () => {
      // Set up authenticated state
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      service.logout(false);

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(service.isUserAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should navigate to login page when navigateToLogin is true', () => {
      // Set a token in localStorage so the HTTP request is made
      localStorage.setItem('auth_token', 'test-token');

      service.logout(true);

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('token management', () => {
    it('should refresh token successfully', done => {
      localStorage.setItem('refresh_token', 'refresh-token');

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });

    it('should fail to refresh token when no refresh token available', done => {
      service.refreshToken().subscribe({
        error: error => {
          expect(error.message).toBe('No refresh token available');
          done();
        }
      });
    });
  });

  describe('password management', () => {
    it('should request password reset', done => {
      const email = { email: 'test@example.com' };

      service.requestPasswordReset(email).subscribe(response => {
        expect(response.message).toBe('Reset email sent');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/password-reset-request`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Reset email sent' });
    });

    it('should reset password with valid token', done => {
      const resetData = {
        token: 'reset-token',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      service.resetPassword(resetData).subscribe(response => {
        expect(response.message).toBe('Password reset successful');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/password-reset`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Password reset successful' });
    });
  });

  describe('signals', () => {
    it('should update signals on successful login', done => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      service.login(credentials).subscribe(() => {
        expect(service.user()).toEqual(mockUser);
        expect(service.token()).toBe(mockAuthResponse.token);
        expect(service.isAuthenticated()).toBe(true);
        expect(service.isLoading()).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);
    });
  });
});

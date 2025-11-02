import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse: AuthResponse = {
    user: {
      id: '1',
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User',
      fechaRegistro: new Date()
    },
    token: 'mock-token',
    expiresIn: 3600000
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Spy on the component's private methods that call snackBar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(component, 'showSuccess');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(component, 'showError');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);

    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);

    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('should not submit form when invalid', () => {
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
  });

  it('should submit form and navigate on success', fakeAsync(() => {
    authService.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    });

    component.onSubmit();
    tick();
    flush(); // Clear any pending timers (like snackBar duration)

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component['showSuccess']).toHaveBeenCalledWith('Inicio de sesión exitoso');
  }));

  it('should show error on login failure', fakeAsync(() => {
    const error = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => error));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    component.onSubmit();
    tick();
    flush(); // Clear any pending timers (like snackBar duration)

    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component['showError']).toHaveBeenCalledWith('Invalid credentials');
  }));

  it('should set loading state during login', () => {
    authService.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(component.isLoading()).toBe(false);
    component.onSubmit();
    expect(component.isLoading()).toBe(false); // Will be false after subscription completes
  });

  describe('Error Messages', () => {
    it('should return required error message for email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(component.emailErrorMessage).toBe('El email es requerido');
    });

    it('should return email format error message', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(component.emailErrorMessage).toBe('Ingresa un email válido');
    });

    it('should return empty string for email when valid', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('valid@email.com');

      expect(component.emailErrorMessage).toBe('');
    });

    it('should return required error message for password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      expect(component.passwordErrorMessage).toBe('La contraseña es requerida');
    });

    it('should return minlength error message for password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      passwordControl?.markAsTouched();

      expect(component.passwordErrorMessage).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('should return empty string for password when valid', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('123456');

      expect(component.passwordErrorMessage).toBe('');
    });
  });
});

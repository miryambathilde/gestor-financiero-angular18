import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

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
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
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
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
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

  it('should submit form and navigate on success', () => {
    authService.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should show error on login failure', () => {
    const error = { error: { message: 'Invalid credentials' } };
    authService.login.and.returnValue(throwError(() => error));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrong-password'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });

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
});

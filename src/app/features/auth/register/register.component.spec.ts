import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockAuthResponse: AuthResponse = {
    user: {
      id: '1',
      email: 'newuser@example.com',
      nombre: 'New',
      apellido: 'User',
      fechaRegistro: new Date()
    },
    token: 'mock-token',
    expiresIn: 3600000
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('nombre')?.value).toBe('');
    expect(component.registerForm.get('apellido')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('aceptaTerminos')?.value).toBe(false);
  });

  it('should validate email field', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password strength', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('weak');
    expect(passwordControl?.hasError('passwordStrength')).toBe(true);

    passwordControl?.setValue('StrongPass123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'Password123',
      confirmPassword: 'DifferentPass123'
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

    component.registerForm.patchValue({
      confirmPassword: 'Password123'
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.registerForm;

    expect(form.get('nombre')?.hasError('required')).toBe(true);
    expect(form.get('apellido')?.hasError('required')).toBe(true);
    expect(form.get('email')?.hasError('required')).toBe(true);
    expect(form.get('password')?.hasError('required')).toBe(true);
    expect(form.get('aceptaTerminos')?.hasError('required')).toBe(true);
  });

  it('should validate phone number format', () => {
    const telefonoControl = component.registerForm.get('telefono');

    telefonoControl?.setValue('123'); // Too short
    expect(telefonoControl?.hasError('pattern')).toBe(true);

    telefonoControl?.setValue('123456789');
    expect(telefonoControl?.valid).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);

    component.togglePasswordVisibility('password');
    expect(component.hidePassword()).toBe(false);

    component.togglePasswordVisibility('confirmPassword');
    expect(component.hideConfirmPassword()).toBe(false);
  });

  it('should not submit form when invalid', () => {
    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
    expect(component.registerForm.touched).toBe(false);
  });

  it('should submit form and navigate on success', done => {
    authService.register.and.returnValue(of(mockAuthResponse));

    component.registerForm.patchValue({
      email: 'newuser@example.com',
      nombre: 'New',
      apellido: 'User',
      password: 'Password123',
      confirmPassword: 'Password123',
      aceptaTerminos: true
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    }, 1600);
  });

  it('should show error on registration failure', () => {
    const error = { error: { message: 'Email already exists' } };
    authService.register.and.returnValue(throwError(() => error));

    component.registerForm.patchValue({
      email: 'existing@example.com',
      nombre: 'Test',
      apellido: 'User',
      password: 'Password123',
      confirmPassword: 'Password123',
      aceptaTerminos: true
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('should require terms acceptance', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      nombre: 'Test',
      apellido: 'User',
      password: 'Password123',
      confirmPassword: 'Password123',
      aceptaTerminos: false
    });

    expect(component.registerForm.get('aceptaTerminos')?.hasError('required')).toBe(true);

    component.registerForm.patchValue({
      aceptaTerminos: true
    });

    expect(component.registerForm.get('aceptaTerminos')?.valid).toBe(true);
  });
});

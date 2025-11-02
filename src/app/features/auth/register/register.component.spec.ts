import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
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
  let router: Router;

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
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, BrowserAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RegisterComponent);
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
    expect(component.registerForm.invalid).toBe(true);
  });

  it('should submit form and navigate on success', fakeAsync(() => {
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
    tick();
    flush();

    expect(authService.register).toHaveBeenCalled();
    expect(component['showSuccess']).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show error on registration failure', fakeAsync(() => {
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
    tick();
    flush();

    expect(authService.register).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component['showError']).toHaveBeenCalled();
  }));

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

  describe('Error Messages', () => {
    it('should return email error messages', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('');
      emailControl?.markAsTouched();
      expect(component.emailErrorMessage).toBe('El email es requerido');

      emailControl?.setValue('invalid');
      expect(component.emailErrorMessage).toBe('Ingresa un email válido');

      emailControl?.setValue('valid@email.com');
      expect(component.emailErrorMessage).toBe('');
    });

    it('should return nombre error messages', () => {
      const nombreControl = component.registerForm.get('nombre');

      nombreControl?.setValue('');
      nombreControl?.markAsTouched();
      expect(component.nombreErrorMessage).toBe('El nombre es requerido');

      nombreControl?.setValue('a');
      nombreControl?.markAsTouched();
      expect(component.nombreErrorMessage).toBe('El nombre debe tener al menos 2 caracteres');

      nombreControl?.setValue('John');
      expect(component.nombreErrorMessage).toBe('');
    });

    it('should return apellido error messages', () => {
      const apellidoControl = component.registerForm.get('apellido');

      apellidoControl?.setValue('');
      apellidoControl?.markAsTouched();
      expect(component.apellidoErrorMessage).toBe('El apellido es requerido');

      apellidoControl?.setValue('a');
      apellidoControl?.markAsTouched();
      expect(component.apellidoErrorMessage).toBe('El apellido debe tener al menos 2 caracteres');

      apellidoControl?.setValue('Doe');
      expect(component.apellidoErrorMessage).toBe('');
    });

    it('should return telefono error message', () => {
      const telefonoControl = component.registerForm.get('telefono');

      telefonoControl?.setValue('123');
      telefonoControl?.markAsTouched();
      expect(component.telefonoErrorMessage).toBe('Ingresa un teléfono válido (9-15 dígitos)');

      telefonoControl?.setValue('123456789');
      expect(component.telefonoErrorMessage).toBe('');
    });

    it('should return password error messages', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      expect(component.passwordErrorMessage).toBe('La contraseña es requerida');

      passwordControl?.setValue('12345');
      expect(component.passwordErrorMessage).toBe('La contraseña debe tener al menos 8 caracteres');

      passwordControl?.setValue('weakpass');
      expect(component.passwordErrorMessage).toContain('debe contener');

      passwordControl?.setValue('StrongPass123');
      expect(component.passwordErrorMessage).toBe('');
    });

    it('should return confirmPassword error messages', () => {
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl = component.registerForm.get('confirmPassword');

      confirmPasswordControl?.setValue('');
      confirmPasswordControl?.markAsTouched();
      expect(component.confirmPasswordErrorMessage).toBe('Confirma tu contraseña');

      passwordControl?.setValue('Password123');
      confirmPasswordControl?.setValue('DifferentPass');
      confirmPasswordControl?.markAsTouched();
      expect(component.confirmPasswordErrorMessage).toBe('Las contraseñas no coinciden');

      confirmPasswordControl?.setValue('Password123');
      expect(component.confirmPasswordErrorMessage).toBe('');
    });
  });
});

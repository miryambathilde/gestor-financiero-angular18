import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterData } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm!: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        telefono: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
        password: [
          '',
          [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]
        ],
        confirmPassword: ['', [Validators.required]],
        aceptaTerminos: [false, [Validators.requiredTrue]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword.set(!this.hidePassword());
    } else {
      this.hideConfirmPassword.set(!this.hideConfirmPassword());
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading.set(true);

    const registerData: RegisterData = {
      email: this.registerForm.value.email,
      nombre: this.registerForm.value.nombre,
      apellido: this.registerForm.value.apellido,
      telefono: this.registerForm.value.telefono,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      aceptaTerminos: this.registerForm.value.aceptaTerminos
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showSuccess('Registro exitoso. Redirigiendo...');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: error => {
        this.isLoading.set(false);
        const errorMessage =
          error.error?.message || 'Error al registrarse. Por favor, intenta nuevamente.';
        this.showError(errorMessage);
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);

    const passwordValid = hasNumber && hasUpper && hasLower;

    return passwordValid ? null : { passwordStrength: true };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Getters for form controls
  get email() {
    return this.registerForm.get('email');
  }

  get nombre() {
    return this.registerForm.get('nombre');
  }

  get apellido() {
    return this.registerForm.get('apellido');
  }

  get telefono() {
    return this.registerForm.get('telefono');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get aceptaTerminos() {
    return this.registerForm.get('aceptaTerminos');
  }

  // Error messages
  get emailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'El email es requerido';
    }
    if (this.email?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  get nombreErrorMessage(): string {
    if (this.nombre?.hasError('required')) {
      return 'El nombre es requerido';
    }
    if (this.nombre?.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  }

  get apellidoErrorMessage(): string {
    if (this.apellido?.hasError('required')) {
      return 'El apellido es requerido';
    }
    if (this.apellido?.hasError('minlength')) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    return '';
  }

  get telefonoErrorMessage(): string {
    if (this.telefono?.hasError('pattern')) {
      return 'Ingresa un teléfono válido (9-15 dígitos)';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.password?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (this.password?.hasError('passwordStrength')) {
      return 'La contraseña debe contener mayúsculas, minúsculas y números';
    }
    return '';
  }

  get confirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) {
      return 'Confirma tu contraseña';
    }
    if (this.registerForm.hasError('passwordMismatch') && this.confirmPassword?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  get aceptaTerminosErrorMessage(): string {
    if (this.aceptaTerminos?.hasError('required')) {
      return 'Debes aceptar los términos y condiciones';
    }
    return '';
  }
}

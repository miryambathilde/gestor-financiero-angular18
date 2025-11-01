import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductosService } from '../../../core/services/productos.service';
import { TipoProducto, NuevoProducto } from '../../../core/models';

@Component({
  selector: 'app-contratacion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './contratacion-form.component.html',
  styleUrls: ['./contratacion-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContratacionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Formularios reactivos con validaciones
  datosBasicosForm!: FormGroup;
  datosFinancierosForm!: FormGroup;
  confirmacionForm!: FormGroup;

  // Enums para el template
  tiposProducto = Object.values(TipoProducto);

  enviando = false;

  ngOnInit(): void {
    this.inicializarFormularios();
  }

  private inicializarFormularios(): void {
    // Paso 1: Datos básicos
    this.datosBasicosForm = this.fb.group({
      tipo: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      moneda: ['EUR', Validators.required]
    });

    // Paso 2: Datos financieros (validaciones dinámicas según tipo)
    this.datosFinancierosForm = this.fb.group({
      saldoInicial: [0, [Validators.min(0)]],
      limiteCredito: [0, [Validators.min(0)]],
      tasaInteres: [0, [Validators.min(0), Validators.max(100)]],
      plazoMeses: [null, [Validators.min(1), Validators.max(600)]]
    });

    // Paso 3: Confirmación
    this.confirmacionForm = this.fb.group({
      aceptaTerminos: [false, Validators.requiredTrue]
    });

    // Actualizar validaciones cuando cambie el tipo de producto
    this.datosBasicosForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.actualizarValidacionesPorTipo(tipo);
    });
  }

  private actualizarValidacionesPorTipo(tipo: TipoProducto): void {
    const saldoInicial = this.datosFinancierosForm.get('saldoInicial');
    const limiteCredito = this.datosFinancierosForm.get('limiteCredito');
    const tasaInteres = this.datosFinancierosForm.get('tasaInteres');
    const plazoMeses = this.datosFinancierosForm.get('plazoMeses');

    // Limpiar validaciones
    saldoInicial?.clearValidators();
    limiteCredito?.clearValidators();
    tasaInteres?.clearValidators();
    plazoMeses?.clearValidators();

    // Aplicar validaciones según tipo
    switch (tipo) {
      case TipoProducto.CUENTA:
        saldoInicial?.setValidators([Validators.required, Validators.min(0)]);
        break;

      case TipoProducto.DEPOSITO:
        saldoInicial?.setValidators([Validators.required, Validators.min(1000)]);
        tasaInteres?.setValidators([Validators.required, Validators.min(0.1), Validators.max(10)]);
        plazoMeses?.setValidators([Validators.required, Validators.min(3), Validators.max(60)]);
        break;

      case TipoProducto.PRESTAMO:
        saldoInicial?.setValidators([Validators.required, Validators.min(1000)]);
        tasaInteres?.setValidators([Validators.required, Validators.min(1), Validators.max(25)]);
        plazoMeses?.setValidators([Validators.required, Validators.min(12), Validators.max(360)]);
        break;

      case TipoProducto.TARJETA:
        limiteCredito?.setValidators([
          Validators.required,
          Validators.min(500),
          Validators.max(50000)
        ]);
        tasaInteres?.setValidators([Validators.required, Validators.min(5), Validators.max(30)]);
        break;
    }

    // Actualizar validaciones
    saldoInicial?.updateValueAndValidity();
    limiteCredito?.updateValueAndValidity();
    tasaInteres?.updateValueAndValidity();
    plazoMeses?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (
      this.datosBasicosForm.invalid ||
      this.datosFinancierosForm.invalid ||
      this.confirmacionForm.invalid
    ) {
      this.snackBar.open(
        'Por favor, complete todos los campos requeridos correctamente',
        'Cerrar',
        {
          duration: 3000
        }
      );
      return;
    }

    this.enviando = true;

    const nuevoProducto: NuevoProducto = {
      ...this.datosBasicosForm.value,
      ...this.datosFinancierosForm.value
    };

    this.productosService.crearProducto(nuevoProducto).subscribe({
      next: producto => {
        this.snackBar.open('Producto contratado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/productos', producto.id]);
      },
      error: error => {
        console.error('Error al crear producto:', error);
        this.snackBar.open('Error al contratar el producto. Intente nuevamente.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.enviando = false;
      }
    });
  }

  traducirTipo(tipo: TipoProducto): string {
    const traducciones: Record<TipoProducto, string> = {
      [TipoProducto.CUENTA]: 'Cuenta Bancaria',
      [TipoProducto.DEPOSITO]: 'Depósito a Plazo Fijo',
      [TipoProducto.PRESTAMO]: 'Préstamo',
      [TipoProducto.TARJETA]: 'Tarjeta de Crédito'
    };
    return traducciones[tipo];
  }

  obtenerDescripcionTipo(tipo: TipoProducto): string {
    const descripciones: Record<TipoProducto, string> = {
      [TipoProducto.CUENTA]: 'Cuenta corriente o de ahorro para gestionar tu dinero',
      [TipoProducto.DEPOSITO]: 'Invierte tu dinero con rentabilidad garantizada',
      [TipoProducto.PRESTAMO]: 'Financia tus proyectos personales o profesionales',
      [TipoProducto.TARJETA]: 'Paga cómodamente con tu tarjeta de crédito'
    };
    return descripciones[tipo];
  }

  get tipoSeleccionado(): TipoProducto | null {
    return this.datosBasicosForm.get('tipo')?.value || null;
  }

  get mostrarSaldoInicial(): boolean {
    const tipo = this.tipoSeleccionado;
    return (
      tipo === TipoProducto.CUENTA ||
      tipo === TipoProducto.DEPOSITO ||
      tipo === TipoProducto.PRESTAMO
    );
  }

  get mostrarLimiteCredito(): boolean {
    return this.tipoSeleccionado === TipoProducto.TARJETA;
  }

  get mostrarTasaInteres(): boolean {
    const tipo = this.tipoSeleccionado;
    return (
      tipo === TipoProducto.DEPOSITO ||
      tipo === TipoProducto.PRESTAMO ||
      tipo === TipoProducto.TARJETA
    );
  }

  get mostrarPlazoMeses(): boolean {
    const tipo = this.tipoSeleccionado;
    return tipo === TipoProducto.DEPOSITO || tipo === TipoProducto.PRESTAMO;
  }
}

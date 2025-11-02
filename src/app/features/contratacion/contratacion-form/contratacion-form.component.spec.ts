import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContratacionFormComponent } from './contratacion-form.component';
import { ProductosService } from '../../../core/services/productos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { TipoProducto, ProductoFinanciero, EstadoProducto } from '../../../core/models';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ContratacionFormComponent', () => {
  let component: ContratacionFormComponent;
  let fixture: ComponentFixture<ContratacionFormComponent>;
  let mockProductosService: jasmine.SpyObj<ProductosService>;

  const mockProductoCreado: ProductoFinanciero = {
    id: '1',
    tipo: TipoProducto.CUENTA,
    nombre: 'Mi Cuenta',
    numeroProducto: 'ES1234567890',
    saldo: 1000,
    estado: EstadoProducto.ACTIVO,
    fechaContratacion: new Date(),
    tasaInteres: 0,
    moneda: 'EUR'
  };

  beforeEach(async () => {
    const productosServiceSpy = jasmine.createSpyObj('ProductosService', ['crearProducto']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ContratacionFormComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductosService, useValue: productosServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideRouter([])
      ]
    }).compileComponents();

    mockProductosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;

    fixture = TestBed.createComponent(ContratacionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms', () => {
    expect(component.datosBasicosForm).toBeDefined();
    expect(component.datosFinancierosForm).toBeDefined();
    expect(component.confirmacionForm).toBeDefined();
  });

  it('should have correct form controls', () => {
    expect(component.datosBasicosForm.get('tipo')).toBeTruthy();
    expect(component.datosBasicosForm.get('nombre')).toBeTruthy();
    expect(component.datosBasicosForm.get('moneda')).toBeTruthy();
  });

  it('should require tipo field', () => {
    const tipo = component.datosBasicosForm.get('tipo');
    expect(tipo?.hasError('required')).toBe(true);
  });

  it('should require nombre field', () => {
    const nombre = component.datosBasicosForm.get('nombre');
    expect(nombre?.hasError('required')).toBe(true);
  });

  it('should validate nombre minLength', () => {
    const nombre = component.datosBasicosForm.get('nombre');
    nombre?.setValue('AB');
    expect(nombre?.hasError('minlength')).toBe(true);
  });

  it('should require aceptaTerminos to be true', () => {
    const aceptaTerminos = component.confirmacionForm.get('aceptaTerminos');
    expect(aceptaTerminos?.hasError('required')).toBe(true);
  });

  it('should create producto when forms are valid', () => {
    mockProductosService.crearProducto.and.returnValue(of(mockProductoCreado));

    component.datosBasicosForm.patchValue({
      tipo: TipoProducto.CUENTA,
      nombre: 'Mi Cuenta',
      moneda: 'EUR'
    });
    component.datosFinancierosForm.patchValue({
      saldoInicial: 1000
    });
    component.confirmacionForm.patchValue({
      aceptaTerminos: true
    });

    component.onSubmit();

    expect(component.enviando).toBe(true);
    expect(mockProductosService.crearProducto).toHaveBeenCalled();
  });

  it('should translate tipo correctly', () => {
    expect(component.traducirTipo(TipoProducto.CUENTA)).toBe('Cuenta Bancaria');
    expect(component.traducirTipo(TipoProducto.DEPOSITO)).toBe('Depósito a Plazo Fijo');
  });

  it('should return description for tipo', () => {
    const desc = component.obtenerDescripcionTipo(TipoProducto.CUENTA);
    expect(desc).toContain('Cuenta corriente');
  });

  it('should return tipoSeleccionado', () => {
    expect(component.tipoSeleccionado).toBeNull();
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.CUENTA);
    expect(component.tipoSeleccionado).toBe(TipoProducto.CUENTA);
  });

  it('should show saldoInicial for CUENTA', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.CUENTA);
    expect(component.mostrarSaldoInicial).toBe(true);
  });

  it('should show limiteCredito for TARJETA', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.TARJETA);
    expect(component.mostrarLimiteCredito).toBe(true);
  });

  it('should not show limiteCredito for non-TARJETA types', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.CUENTA);
    expect(component.mostrarLimiteCredito).toBe(false);
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.DEPOSITO);
    expect(component.mostrarLimiteCredito).toBe(false);
  });

  it('should show tasaInteres for DEPOSITO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.DEPOSITO);
    expect(component.mostrarTasaInteres).toBe(true);
  });

  it('should show tasaInteres for PRESTAMO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.PRESTAMO);
    expect(component.mostrarTasaInteres).toBe(true);
  });

  it('should show tasaInteres for TARJETA', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.TARJETA);
    expect(component.mostrarTasaInteres).toBe(true);
  });

  it('should not show tasaInteres for CUENTA', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.CUENTA);
    expect(component.mostrarTasaInteres).toBe(false);
  });

  it('should show plazoMeses for DEPOSITO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.DEPOSITO);
    expect(component.mostrarPlazoMeses).toBe(true);
  });

  it('should show plazoMeses for PRESTAMO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.PRESTAMO);
    expect(component.mostrarPlazoMeses).toBe(true);
  });

  it('should not show plazoMeses for CUENTA', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.CUENTA);
    expect(component.mostrarPlazoMeses).toBe(false);
  });

  it('should show saldoInicial for DEPOSITO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.DEPOSITO);
    expect(component.mostrarSaldoInicial).toBe(true);
  });

  it('should show saldoInicial for PRESTAMO', () => {
    component.datosBasicosForm.get('tipo')?.setValue(TipoProducto.PRESTAMO);
    expect(component.mostrarSaldoInicial).toBe(true);
  });

  it('should translate all tipos correctly', () => {
    expect(component.traducirTipo(TipoProducto.CUENTA)).toBe('Cuenta Bancaria');
    expect(component.traducirTipo(TipoProducto.DEPOSITO)).toBe('Depósito a Plazo Fijo');
    expect(component.traducirTipo(TipoProducto.PRESTAMO)).toBe('Préstamo');
    expect(component.traducirTipo(TipoProducto.TARJETA)).toBe('Tarjeta de Crédito');
  });

  it('should return description for all tipos', () => {
    expect(component.obtenerDescripcionTipo(TipoProducto.CUENTA)).toContain('Cuenta corriente');
    expect(component.obtenerDescripcionTipo(TipoProducto.DEPOSITO)).toContain('Invierte tu dinero');
    expect(component.obtenerDescripcionTipo(TipoProducto.PRESTAMO)).toContain('Financia');
    expect(component.obtenerDescripcionTipo(TipoProducto.TARJETA)).toContain('Paga cómodamente');
  });

  it('should not submit if forms are invalid', () => {
    component.datosBasicosForm.patchValue({
      tipo: TipoProducto.CUENTA
      // falta nombre
    });

    component.onSubmit();

    expect(mockProductosService.crearProducto).not.toHaveBeenCalled();
  });
});

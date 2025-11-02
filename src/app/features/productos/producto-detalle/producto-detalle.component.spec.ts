import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoDetalleComponent } from './producto-detalle.component';
import { ProductosService } from '../../../core/services/productos.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductoFinanciero, Movimiento, TipoProducto, EstadoProducto } from '../../../core/models';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductoDetalleComponent', () => {
  let component: ProductoDetalleComponent;
  let fixture: ComponentFixture<ProductoDetalleComponent>;
  let mockProductosService: jasmine.SpyObj<ProductosService>;

  const mockProducto: ProductoFinanciero = {
    id: '1',
    tipo: TipoProducto.CUENTA,
    nombre: 'Cuenta Corriente',
    numeroProducto: 'ES1234567890',
    saldo: 1000,
    estado: EstadoProducto.ACTIVO,
    fechaContratacion: new Date('2024-01-01'),
    fechaVencimiento: new Date('2025-01-01'),
    tasaInteres: 0.5,
    moneda: 'EUR',
    descripcion: 'Cuenta corriente principal'
  };

  const mockMovimientos: Movimiento[] = [
    {
      id: '1',
      productoId: '1',
      tipo: 'INGRESO',
      concepto: 'Nómina',
      monto: 2000,
      fecha: new Date('2024-01-15'),
      saldoResultante: 3000,
      referencia: 'NOM-2024-01'
    }
  ];

  const mockActivatedRoute = {
    paramMap: of({
      get: (_key: string) => '1'
    })
  };

  beforeEach(async () => {
    const productosServiceSpy = jasmine.createSpyObj('ProductosService', [
      'obtenerProductoPorId',
      'obtenerMovimientos'
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductoDetalleComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductosService, useValue: productosServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideRouter([])
      ]
    }).compileComponents();

    mockProductosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    mockProductosService.obtenerProductoPorId.and.returnValue(of(mockProducto));
    mockProductosService.obtenerMovimientos.and.returnValue(of(mockMovimientos));

    fixture = TestBed.createComponent(ProductoDetalleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cargando).toBe(true);
    expect(component.displayedColumns.length).toBe(5);
  });

  it('should set cargando to false after loading', done => {
    component.ngOnInit();
    setTimeout(() => {
      expect(component.cargando).toBe(false);
      done();
    }, 100);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatearMoneda(1000);
    expect(formatted).toContain('€');
  });

  it('should get correct color for estado', () => {
    expect(component.obtenerColorEstado(EstadoProducto.ACTIVO)).toBe('primary');
    expect(component.obtenerColorEstado(EstadoProducto.INACTIVO)).toBe('accent');
  });

  it('should get correct icon for tipo', () => {
    expect(component.obtenerIconoTipo(TipoProducto.CUENTA)).toBe('account_balance');
    expect(component.obtenerIconoTipo(TipoProducto.DEPOSITO)).toBe('savings');
  });

  it('should translate tipo correctly', () => {
    expect(component.traducirTipo(TipoProducto.CUENTA)).toBe('Cuenta');
    expect(component.traducirTipo(TipoProducto.DEPOSITO)).toBe('Depósito');
  });

  it('should calculate dias vencimiento correctly', () => {
    expect(component.calcularDiasVencimiento(undefined)).toBe(0);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dias = component.calcularDiasVencimiento(futureDate);
    expect(dias).toBeGreaterThanOrEqual(9);
  });

  describe('obtenerColorEstado casos adicionales', () => {
    it('debe devolver "warn" para PENDIENTE', () => {
      const color = component.obtenerColorEstado(EstadoProducto.PENDIENTE);
      expect(color).toBe('warn');
    });

    it('debe devolver cadena vacía para estado desconocido', () => {
      const color = component.obtenerColorEstado('DESCONOCIDO' as EstadoProducto);
      expect(color).toBe('');
    });
  });

  describe('obtenerIconoTipo casos adicionales', () => {
    it('debe devolver "request_quote" para PRESTAMO', () => {
      const icono = component.obtenerIconoTipo(TipoProducto.PRESTAMO);
      expect(icono).toBe('request_quote');
    });

    it('debe devolver "credit_card" para TARJETA', () => {
      const icono = component.obtenerIconoTipo(TipoProducto.TARJETA);
      expect(icono).toBe('credit_card');
    });

    it('debe devolver "help" para tipo desconocido', () => {
      const icono = component.obtenerIconoTipo('DESCONOCIDO' as TipoProducto);
      expect(icono).toBe('help');
    });
  });

  describe('traducirTipo casos adicionales', () => {
    it('debe traducir PRESTAMO correctamente', () => {
      expect(component.traducirTipo(TipoProducto.PRESTAMO)).toBe('Préstamo');
    });

    it('debe traducir TARJETA correctamente', () => {
      expect(component.traducirTipo(TipoProducto.TARJETA)).toBe('Tarjeta');
    });
  });

  describe('formatearMoneda casos adicionales', () => {
    it('debe formatear números negativos', () => {
      const formatted = component.formatearMoneda(-1000);
      expect(formatted).toContain('€');
      expect(formatted).toContain('-');
    });

    it('debe formatear cero', () => {
      const formatted = component.formatearMoneda(0);
      expect(formatted).toContain('€');
    });
  });

  describe('ngOnDestroy', () => {
    it('debe desuscribirse de todas las subscripciones', () => {
      const spy = spyOn(component['subscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });
});

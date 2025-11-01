import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoListaComponent } from './producto-lista.component';
import { ProductosService } from '../../../core/services/productos.service';
import { BehaviorSubject } from 'rxjs';
import { ProductoFinanciero, TipoProducto, EstadoProducto } from '../../../core/models';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductoListaComponent', () => {
  let component: ProductoListaComponent;
  let fixture: ComponentFixture<ProductoListaComponent>;
  let productosFiltradosSubject: BehaviorSubject<ProductoFinanciero[]>;

  const mockProductos: ProductoFinanciero[] = [
    {
      id: '1',
      tipo: TipoProducto.CUENTA,
      nombre: 'Cuenta Corriente',
      numeroProducto: 'ES1234567890',
      saldo: 1000,
      estado: EstadoProducto.ACTIVO,
      fechaContratacion: new Date('2024-01-01'),
      fechaVencimiento: new Date('2025-01-01'),
      tasaInteres: 0.5,
      moneda: 'EUR'
    },
    {
      id: '2',
      tipo: TipoProducto.DEPOSITO,
      nombre: 'Depósito Plazo Fijo',
      numeroProducto: 'DP-2024-001',
      saldo: 5000,
      estado: EstadoProducto.ACTIVO,
      fechaContratacion: new Date('2024-02-01'),
      fechaVencimiento: new Date('2025-02-01'),
      tasaInteres: 2.5,
      moneda: 'EUR'
    }
  ];

  beforeEach(async () => {
    productosFiltradosSubject = new BehaviorSubject<ProductoFinanciero[]>(mockProductos);

    const productosServiceSpy = jasmine.createSpyObj('ProductosService', ['actualizarFiltros'], {
      productosFiltrados$: productosFiltradosSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ProductoListaComponent, NoopAnimationsModule],
      providers: [{ provide: ProductosService, useValue: productosServiceSpy }, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoListaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageSize).toBe(10);
    expect(component.pageIndex).toBe(0);
    expect(component.displayedColumns.length).toBe(7);
  });

  it('should have filtros form', () => {
    expect(component.filtrosForm).toBeDefined();
    expect(component.filtrosForm.get('tipo')).toBeTruthy();
    expect(component.filtrosForm.get('estado')).toBeTruthy();
  });

  it('should load productos on init', done => {
    component.ngOnInit();
    setTimeout(() => {
      expect(component.dataSource.length).toBe(2);
      done();
    }, 400);
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

  it('should clear filters', () => {
    component.filtrosForm.patchValue({ tipo: TipoProducto.CUENTA });
    component.limpiarFiltros();
    expect(component.filtrosForm.value.tipo).toBe('');
  });

  it('should handle page change', () => {
    const event = { pageIndex: 1, pageSize: 5, length: 10 };
    component.onPageChange(event);
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });
});

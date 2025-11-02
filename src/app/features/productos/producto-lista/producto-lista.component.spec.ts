import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductoListaComponent } from './producto-lista.component';
import { ProductosService } from '../../../core/services/productos.service';
import { BehaviorSubject } from 'rxjs';
import { ProductoFinanciero, TipoProducto, EstadoProducto } from '../../../core/models';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

describe('ProductoListaComponent', () => {
  let component: ProductoListaComponent;
  let fixture: ComponentFixture<ProductoListaComponent>;
  let productosFiltradosSubject: BehaviorSubject<ProductoFinanciero[]>;
  let productosService: jasmine.SpyObj<ProductosService>;

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
    productosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
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

  it('debe cambiar de página', () => {
    const event: PageEvent = {
      pageIndex: 1,
      pageSize: 5,
      length: 10
    };

    component.onPageChange(event);

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });

  describe('Ordenamiento', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debe ordenar por nombre ascendente', () => {
      const sort: Sort = { active: 'nombre', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData[0].nombre).toBe('Cuenta Corriente');
      expect(component.sortedData[1].nombre).toBe('Depósito Plazo Fijo');
    });

    it('debe ordenar por nombre descendente', () => {
      const sort: Sort = { active: 'nombre', direction: 'desc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData[0].nombre).toBe('Depósito Plazo Fijo');
      expect(component.sortedData[1].nombre).toBe('Cuenta Corriente');
    });

    it('debe ordenar por tipo', () => {
      const sort: Sort = { active: 'tipo', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData[0].tipo).toBe(TipoProducto.CUENTA);
    });

    it('debe ordenar por estado', () => {
      const sort: Sort = { active: 'estado', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData.length).toBe(2);
    });

    it('debe ordenar por saldo', () => {
      const sort: Sort = { active: 'saldo', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData[0].saldo).toBe(1000);
    });

    it('debe ordenar por fechaContratacion', () => {
      const sort: Sort = { active: 'fechaContratacion', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData.length).toBe(2);
    });

    it('debe restaurar orden original cuando no hay dirección', () => {
      const sort: Sort = { active: 'nombre', direction: '' };
      component.dataSource = mockProductos;
      component.sortedData = [...mockProductos].reverse();

      component.onSortChange(sort);

      expect(component.sortedData).toEqual(mockProductos);
    });

    it('debe restaurar orden original cuando no hay columna activa', () => {
      const sort: Sort = { active: '', direction: 'asc' };
      component.dataSource = mockProductos;
      component.sortedData = [...mockProductos].reverse();

      component.onSortChange(sort);

      expect(component.sortedData).toEqual(mockProductos);
    });

    it('debe devolver 0 para columna no reconocida', () => {
      const sort: Sort = { active: 'columnaInexistente', direction: 'asc' };
      component.dataSource = mockProductos;

      component.onSortChange(sort);

      expect(component.sortedData.length).toBe(2);
    });
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
    it('debe devolver "help" para tipo desconocido', () => {
      const icono = component.obtenerIconoTipo('DESCONOCIDO' as TipoProducto);
      expect(icono).toBe('help');
    });
  });

  describe('Integración con ProductosService', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debe actualizar filtros con debounce', fakeAsync(() => {
      component.filtrosForm.patchValue({ tipo: TipoProducto.CUENTA });

      tick(299);
      expect(productosService.actualizarFiltros).not.toHaveBeenCalled();

      tick(1);
      expect(productosService.actualizarFiltros).toHaveBeenCalledWith(
        jasmine.objectContaining({ tipo: TipoProducto.CUENTA })
      );
    }));

    it('debe resetear pageIndex al cambiar filtros', fakeAsync(() => {
      component.pageIndex = 5;

      component.filtrosForm.patchValue({ tipo: TipoProducto.DEPOSITO });

      tick(300);
      expect(component.pageIndex).toBe(0);
    }));
  });

  describe('ngOnDestroy', () => {
    it('debe desuscribirse de todas las subscripciones', () => {
      const spy = spyOn(component['subscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });
});

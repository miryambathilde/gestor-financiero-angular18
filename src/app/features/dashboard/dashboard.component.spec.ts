import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ProductosService } from '../../core/services/productos.service';
import { of } from 'rxjs';
import {
  ResumenFinanciero,
  TipoProducto,
  ProductoFinanciero,
  EstadoProducto
} from '../../core/models';
import { provideRouter } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
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
    moneda: 'EUR'
  };

  const mockResumen: ResumenFinanciero = {
    saldoTotal: 15000,
    productosActivos: 5,
    proximosVencimientos: [mockProducto],
    ultimosMovimientos: [
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
    ],
    distribucionPorTipo: [
      { tipo: TipoProducto.CUENTA, cantidad: 2, saldoTotal: 5000 },
      { tipo: TipoProducto.DEPOSITO, cantidad: 1, saldoTotal: 10000 }
    ]
  };

  beforeEach(async () => {
    const productosServiceSpy = jasmine.createSpyObj('ProductosService', [
      'obtenerResumenFinanciero'
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ProductosService, useValue: productosServiceSpy }, provideRouter([])]
    }).compileComponents();

    mockProductosService = TestBed.inject(ProductosService) as jasmine.SpyObj<ProductosService>;
    mockProductosService.obtenerResumenFinanciero.and.returnValue(of(mockResumen));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load resumen on init', () => {
    fixture.detectChanges();
    expect(mockProductosService.obtenerResumenFinanciero).toHaveBeenCalled();
  });

  it('should have resumen after init', done => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.resumen).toBeDefined();
      expect(component.resumen?.saldoTotal).toBe(15000);
      done();
    }, 200);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatearMoneda(1000);
    expect(formatted).toContain('€');
  });

  it('should translate tipo correctly', () => {
    expect(component.traducirTipo('CUENTA')).toBe('Cuentas');
    expect(component.traducirTipo('DEPOSITO')).toBe('Depósitos');
  });

  it('should return correct estado chip color', () => {
    expect(component.obtenerEstadoChip('ACTIVO')).toBe('primary');
    expect(component.obtenerEstadoChip('INACTIVO')).toBe('default');
  });

  it('should have correct display columns', () => {
    expect(component.displayedColumns).toEqual(['fecha', 'concepto', 'monto', 'tipo']);
  });
});

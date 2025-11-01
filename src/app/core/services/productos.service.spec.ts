import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductosService } from './productos.service';
import { ProductoFinanciero, TipoProducto, EstadoProducto, Movimiento } from '../models';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000';

  const mockProducto: ProductoFinanciero = {
    id: '1',
    tipo: TipoProducto.CUENTA,
    nombre: 'Cuenta Corriente',
    numeroProducto: 'ES1234567890123456789012',
    saldo: 1000,
    estado: EstadoProducto.ACTIVO,
    fechaContratacion: new Date('2024-01-01'),
    fechaVencimiento: new Date('2025-01-01'),
    tasaInteres: 0.5,
    moneda: 'EUR'
  };

  const mockProductos: ProductoFinanciero[] = [
    mockProducto,
    {
      id: '2',
      tipo: TipoProducto.DEPOSITO,
      nombre: 'Depósito Plazo Fijo',
      numeroProducto: 'ES9876543210987654321098',
      saldo: 5000,
      estado: EstadoProducto.ACTIVO,
      fechaContratacion: new Date('2024-02-01'),
      fechaVencimiento: new Date('2025-02-01'),
      tasaInteres: 2.5,
      moneda: 'EUR'
    }
  ];

  const mockMovimiento: Movimiento = {
    id: '1',
    productoId: '1',
    tipo: 'INGRESO',
    concepto: 'Nómina',
    monto: 2000,
    fecha: new Date('2024-01-15'),
    saldoResultante: 3000,
    referencia: 'NOM-2024-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductosService]
    });
    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const req = httpMock.expectOne(`${API_URL}/productos`);
    req.flush(mockProductos);
    expect(service).toBeTruthy();
  });

  it('should load productos on init', () => {
    const req = httpMock.expectOne(`${API_URL}/productos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductos);
  });

  it('should get producto by id', done => {
    // First flush the init request
    const initReq = httpMock.expectOne(`${API_URL}/productos`);
    initReq.flush(mockProductos);

    service.obtenerProductoPorId('1').subscribe(producto => {
      expect(producto.id).toBe('1');
      expect(producto.nombre).toBe('Cuenta Corriente');
      done();
    });

    const req = httpMock.expectOne(`${API_URL}/productos/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducto);
  });

  it('should get movimientos by producto id', done => {
    // First flush the init request
    const initReq = httpMock.expectOne(`${API_URL}/productos`);
    initReq.flush(mockProductos);

    service.obtenerMovimientos('1').subscribe(movimientos => {
      expect(movimientos.length).toBe(1);
      expect(movimientos[0].productoId).toBe('1');
      done();
    });

    const req = httpMock.expectOne(`${API_URL}/movimientos?productoId=1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockMovimiento]);
  });

  it('should create producto', done => {
    // First flush the init request
    const initReq = httpMock.expectOne(`${API_URL}/productos`);
    initReq.flush(mockProductos);

    const nuevoProducto = {
      tipo: TipoProducto.CUENTA,
      nombre: 'Nueva Cuenta',
      moneda: 'EUR',
      saldoInicial: 500
    };

    service.crearProducto(nuevoProducto).subscribe(producto => {
      expect(producto.id).toBeTruthy();
      done();
    });

    const createReq = httpMock.expectOne(`${API_URL}/productos`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ ...mockProducto, ...nuevoProducto });

    const listReq = httpMock.expectOne(`${API_URL}/productos`);
    listReq.flush(mockProductos);
  });

  it('should update filters', () => {
    const req = httpMock.expectOne(`${API_URL}/productos`);
    req.flush(mockProductos);

    service.actualizarFiltros({ tipo: TipoProducto.CUENTA });
    expect(service.productosFiltrados().length).toBeGreaterThanOrEqual(0);
  });

  it('should get resumen financiero', done => {
    const initReq = httpMock.expectOne(`${API_URL}/productos`);
    initReq.flush(mockProductos);

    service.obtenerResumenFinanciero().subscribe(resumen => {
      expect(resumen.saldoTotal).toBeDefined();
      expect(resumen.productosActivos).toBeDefined();
      done();
    });

    const movReq = httpMock.expectOne(`${API_URL}/movimientos`);
    movReq.flush([mockMovimiento]);
  });
});

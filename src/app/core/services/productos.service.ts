import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import {
  ProductoFinanciero,
  Movimiento,
  FiltrosProducto,
  NuevoProducto,
  ResumenFinanciero,
  TipoProducto,
  EstadoProducto
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // Signals para reactividad (bonus)
  private productosSignal = signal<ProductoFinanciero[]>([]);
  private filtrosSignal = signal<FiltrosProducto>({});

  // Computed signal para productos filtrados
  productosFiltrados = computed(() => {
    const productos = this.productosSignal();
    const filtros = this.filtrosSignal();
    return this.aplicarFiltros(productos, filtros);
  });

  // BehaviorSubjects para RxJS (cumple requisito técnico)
  private productosSubject = new BehaviorSubject<ProductoFinanciero[]>([]);
  private filtrosSubject = new BehaviorSubject<FiltrosProducto>({});

  // Observables públicos
  productos$ = this.productosSubject.asObservable();
  filtros$ = this.filtrosSubject.asObservable();

  // Observable combinado de productos filtrados
  productosFiltrados$ = combineLatest([this.productos$, this.filtros$]).pipe(
    map(([productos, filtros]) => this.aplicarFiltros(productos, filtros)),
    shareReplay(1)
  );

  constructor() {
    this.cargarProductos();
  }

  // Cargar todos los productos
  cargarProductos(): void {
    this.http
      .get<ProductoFinanciero[]>(`${this.apiUrl}/productos`)
      .pipe(
        catchError(error => {
          console.error('Error cargando productos:', error);
          return of([]);
        })
      )
      .subscribe(productos => {
        // Convertir fechas string a Date
        const productosConFechas = productos.map(p => ({
          ...p,
          fechaContratacion: new Date(p.fechaContratacion),
          fechaVencimiento: p.fechaVencimiento ? new Date(p.fechaVencimiento) : undefined
        }));

        // Ordenar por fecha de contratación descendente (más recientes primero)
        const productosOrdenados = productosConFechas.sort(
          (a, b) => b.fechaContratacion.getTime() - a.fechaContratacion.getTime()
        );

        this.productosSubject.next(productosOrdenados);
        this.productosSignal.set(productosOrdenados);
      });
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: string): Observable<ProductoFinanciero> {
    return this.http.get<ProductoFinanciero>(`${this.apiUrl}/productos/${id}`).pipe(
      map(p => ({
        ...p,
        fechaContratacion: new Date(p.fechaContratacion),
        fechaVencimiento: p.fechaVencimiento ? new Date(p.fechaVencimiento) : undefined
      }))
    );
  }

  // Obtener movimientos de un producto
  obtenerMovimientos(productoId: string): Observable<Movimiento[]> {
    return this.http
      .get<Movimiento[]>(`${this.apiUrl}/movimientos`, {
        params: new HttpParams().set('productoId', productoId)
      })
      .pipe(
        map(movimientos =>
          movimientos.map(m => ({
            ...m,
            fecha: new Date(m.fecha)
          }))
        ),
        map(movimientos => movimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()))
      );
  }

  // Crear nuevo producto
  crearProducto(nuevoProducto: NuevoProducto): Observable<ProductoFinanciero> {
    const producto: Partial<ProductoFinanciero> = {
      tipo: nuevoProducto.tipo,
      nombre: nuevoProducto.nombre,
      numeroProducto: this.generarNumeroProducto(nuevoProducto.tipo),
      estado: EstadoProducto.ACTIVO,
      saldo: nuevoProducto.saldoInicial || 0,
      fechaContratacion: new Date(),
      moneda: nuevoProducto.moneda,
      tasaInteres: nuevoProducto.tasaInteres,
      limiteCredito: nuevoProducto.limiteCredito
    };

    if (nuevoProducto.plazoMeses) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + nuevoProducto.plazoMeses);
      producto.fechaVencimiento = fechaVencimiento;
    }

    return this.http
      .post<ProductoFinanciero>(`${this.apiUrl}/productos`, producto)
      .pipe(tap(() => this.cargarProductos()));
  }

  // Actualizar filtros usando Signals
  actualizarFiltros(filtros: FiltrosProducto): void {
    this.filtrosSignal.set(filtros);
    this.filtrosSubject.next(filtros);
  }

  // Obtener resumen financiero
  obtenerResumenFinanciero(): Observable<ResumenFinanciero> {
    return combineLatest([
      this.productos$,
      this.http.get<Movimiento[]>(`${this.apiUrl}/movimientos`)
    ]).pipe(
      map(([productos, movimientos]) => {
        const productosActivos = productos.filter(p => p.estado === EstadoProducto.ACTIVO);
        const saldoTotal = productosActivos.reduce((sum, p) => sum + p.saldo, 0);

        // Productos que vencen en los próximos 30 días
        const hoy = new Date();
        const treintaDias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
        const proximosVencimientos = productosActivos.filter(
          p => p.fechaVencimiento && p.fechaVencimiento >= hoy && p.fechaVencimiento <= treintaDias
        );

        // Últimos movimientos
        const ultimosMovimientos = movimientos
          .map(m => ({ ...m, fecha: new Date(m.fecha) }))
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
          .slice(0, 10);

        // Distribución por tipo
        const distribucionPorTipo = Object.values(TipoProducto).map(tipo => {
          const productosTipo = productosActivos.filter(p => p.tipo === tipo);
          return {
            tipo,
            cantidad: productosTipo.length,
            saldoTotal: productosTipo.reduce((sum, p) => sum + p.saldo, 0)
          };
        });

        return {
          saldoTotal,
          productosActivos: productosActivos.length,
          proximosVencimientos,
          ultimosMovimientos,
          distribucionPorTipo
        };
      })
    );
  }

  // Aplicar filtros a los productos
  private aplicarFiltros(
    productos: ProductoFinanciero[],
    filtros: FiltrosProducto
  ): ProductoFinanciero[] {
    return productos.filter(producto => {
      // Filtro por tipo
      if (filtros.tipo && producto.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado && producto.estado !== filtros.estado) {
        return false;
      }

      // Filtro por fecha desde
      if (filtros.fechaDesde && producto.fechaContratacion < filtros.fechaDesde) {
        return false;
      }

      // Filtro por fecha hasta
      if (filtros.fechaHasta && producto.fechaContratacion > filtros.fechaHasta) {
        return false;
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        return (
          producto.nombre.toLowerCase().includes(busqueda) ||
          producto.numeroProducto.toLowerCase().includes(busqueda) ||
          producto.descripcion?.toLowerCase().includes(busqueda) ||
          false
        );
      }

      return true;
    });
  }

  // Generar número de producto
  private generarNumeroProducto(tipo: TipoProducto): string {
    const timestamp = Date.now().toString().slice(-6);
    const prefijos: Record<TipoProducto, string> = {
      [TipoProducto.CUENTA]: 'ES79',
      [TipoProducto.DEPOSITO]: 'DP',
      [TipoProducto.PRESTAMO]: 'PR',
      [TipoProducto.TARJETA]: '4532'
    };

    const prefijo = prefijos[tipo];
    return tipo === TipoProducto.CUENTA
      ? `${prefijo} 2100 0418 ${timestamp} 0001`
      : `${prefijo}-${new Date().getFullYear()}-${timestamp}`;
  }
}

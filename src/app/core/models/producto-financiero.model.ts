export enum TipoProducto {
  CUENTA = 'CUENTA',
  DEPOSITO = 'DEPOSITO',
  PRESTAMO = 'PRESTAMO',
  TARJETA = 'TARJETA'
}

export enum EstadoProducto {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  CANCELADO = 'CANCELADO'
}

export interface ProductoFinanciero {
  id: string;
  tipo: TipoProducto;
  nombre: string;
  numeroProducto: string;
  estado: EstadoProducto;
  saldo: number;
  fechaContratacion: Date;
  fechaVencimiento?: Date;
  tasaInteres?: number;
  limiteCredito?: number;
  descripcion?: string;
  moneda: string;
}

export interface Movimiento {
  id: string;
  productoId: string;
  fecha: Date;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  saldoResultante: number;
  referencia?: string;
}

export interface ResumenFinanciero {
  saldoTotal: number;
  productosActivos: number;
  proximosVencimientos: ProductoFinanciero[];
  ultimosMovimientos: Movimiento[];
  distribucionPorTipo: {
    tipo: TipoProducto;
    cantidad: number;
    saldoTotal: number;
  }[];
}

export interface FiltrosProducto {
  tipo?: TipoProducto;
  estado?: EstadoProducto;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

export interface NuevoProducto {
  tipo: TipoProducto;
  nombre: string;
  moneda: string;
  saldoInicial?: number;
  limiteCredito?: number;
  tasaInteres?: number;
  plazoMeses?: number;
}

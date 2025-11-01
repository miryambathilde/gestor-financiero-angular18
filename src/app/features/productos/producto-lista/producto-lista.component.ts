import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductosService } from '../../../core/services/productos.service';
import { ProductoFinanciero, TipoProducto, EstadoProducto } from '../../../core/models';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './producto-lista.component.html',
  styleUrls: ['./producto-lista.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoListaComponent implements OnInit, OnDestroy {
  private productosService = inject(ProductosService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // Usando signals para reactividad (bonus)
  productosFiltrados = this.productosService.productosFiltrados;

  // Para la tabla
  displayedColumns = [
    'tipo',
    'nombre',
    'numeroProducto',
    'estado',
    'saldo',
    'fechaContratacion',
    'acciones'
  ];
  dataSource: ProductoFinanciero[] = [];
  paginatedData: ProductoFinanciero[] = [];

  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // Ordenamiento
  sortedData: ProductoFinanciero[] = [];

  // Formulario de filtros
  filtrosForm: FormGroup;

  // Enums para el template
  tiposProducto = Object.values(TipoProducto);
  estadosProducto = Object.values(EstadoProducto);

  private subscription = new Subscription();

  constructor() {
    this.filtrosForm = this.fb.group({
      tipo: [''],
      estado: [''],
      busqueda: [''],
      fechaDesde: [null],
      fechaHasta: [null]
    });
  }

  ngOnInit(): void {
    // Suscribirse a productos filtrados usando RxJS
    this.subscription.add(
      this.productosService.productosFiltrados$.subscribe(productos => {
        this.dataSource = productos;
        this.sortedData = [...productos];
        this.totalItems = productos.length;
        this.updatePaginatedData();
        this.cdr.markForCheck();
      })
    );

    // Aplicar filtros con debounce
    this.subscription.add(
      this.filtrosForm.valueChanges.pipe(debounceTime(300)).subscribe(filtros => {
        this.productosService.actualizarFiltros(filtros);
        this.pageIndex = 0; // Resetear paginación
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedData();
  }

  onSortChange(sort: Sort): void {
    const data = [...this.dataSource];

    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      this.updatePaginatedData();
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'nombre':
          return this.compare(a.nombre, b.nombre, isAsc);
        case 'tipo':
          return this.compare(a.tipo, b.tipo, isAsc);
        case 'estado':
          return this.compare(a.estado, b.estado, isAsc);
        case 'saldo':
          return this.compare(a.saldo, b.saldo, isAsc);
        case 'fechaContratacion':
          return this.compare(a.fechaContratacion.getTime(), b.fechaContratacion.getTime(), isAsc);
        default:
          return 0;
      }
    });

    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.sortedData.slice(startIndex, endIndex);
  }

  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      tipo: '',
      estado: '',
      busqueda: '',
      fechaDesde: null,
      fechaHasta: null
    });
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(monto);
  }

  obtenerColorEstado(estado: EstadoProducto): string {
    switch (estado) {
      case EstadoProducto.ACTIVO:
        return 'primary';
      case EstadoProducto.INACTIVO:
        return 'accent';
      case EstadoProducto.PENDIENTE:
        return 'warn';
      default:
        return '';
    }
  }

  obtenerIconoTipo(tipo: TipoProducto): string {
    switch (tipo) {
      case TipoProducto.CUENTA:
        return 'account_balance';
      case TipoProducto.DEPOSITO:
        return 'savings';
      case TipoProducto.PRESTAMO:
        return 'request_quote';
      case TipoProducto.TARJETA:
        return 'credit_card';
      default:
        return 'help';
    }
  }

  traducirTipo(tipo: TipoProducto): string {
    const traducciones: Record<TipoProducto, string> = {
      [TipoProducto.CUENTA]: 'Cuenta',
      [TipoProducto.DEPOSITO]: 'Depósito',
      [TipoProducto.PRESTAMO]: 'Préstamo',
      [TipoProducto.TARJETA]: 'Tarjeta'
    };
    return traducciones[tipo];
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductosService } from '../../../core/services/productos.service';
import { ProductoFinanciero, Movimiento, TipoProducto, EstadoProducto } from '../../../core/models';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductoDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private cdr = inject(ChangeDetectorRef);

  producto?: ProductoFinanciero;
  movimientos: Movimiento[] = [];
  displayedColumns = ['fecha', 'concepto', 'tipo', 'monto', 'saldoResultante'];
  cargando = true;

  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.route.paramMap
        .pipe(
          switchMap(params => {
            const id = params.get('id');
            if (!id) {
              throw new Error('ID de producto no encontrado');
            }
            return this.productosService.obtenerProductoPorId(id);
          })
        )
        .subscribe({
          next: producto => {
            this.producto = producto;
            this.cdr.markForCheck();
            this.cargarMovimientos(producto.id);
          },
          error: error => {
            console.error('Error al cargar producto:', error);
            this.cargando = false;
            this.cdr.markForCheck();
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private cargarMovimientos(productoId: string): void {
    this.subscription.add(
      this.productosService.obtenerMovimientos(productoId).subscribe({
        next: movimientos => {
          this.movimientos = movimientos;
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Error al cargar movimientos:', error);
          this.cargando = false;
          this.cdr.markForCheck();
        }
      })
    );
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

  calcularDiasVencimiento(fechaVencimiento?: Date): number {
    if (!fechaVencimiento) return 0;
    const hoy = new Date();
    const diferencia = fechaVencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
}

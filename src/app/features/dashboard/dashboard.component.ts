import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Chart, registerables } from 'chart.js';
import { ProductosService } from '../../core/services/productos.service';
import { ResumenFinanciero } from '../../core/models';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private productosService = inject(ProductosService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('distributionChart') distributionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('balanceChart') balanceChartRef!: ElementRef<HTMLCanvasElement>;

  resumen?: ResumenFinanciero;
  distributionChart?: Chart;
  balanceChart?: Chart;
  displayedColumns = ['fecha', 'concepto', 'monto', 'tipo'];

  private subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.productosService.obtenerResumenFinanciero().subscribe(resumen => {
        console.log('Resumen recibido:', resumen);
        this.resumen = resumen;
        this.cdr.markForCheck();
        // Esperar a que Angular renderice el @if y los canvas
        setTimeout(() => {
          console.log('Intentando crear gráficos...');
          this.crearGraficos();
        }, 100);
      })
    );
  }

  ngAfterViewInit(): void {
    // Los gráficos se crean después de que lleguen los datos en ngOnInit
    if (this.resumen) {
      this.crearGraficos();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.distributionChart?.destroy();
    this.balanceChart?.destroy();
  }

  crearGraficos(): void {
    if (!this.resumen) {
      console.log('No hay resumen disponible');
      return;
    }

    if (!this.distributionChartRef || !this.balanceChartRef) {
      console.log('Referencias a canvas no disponibles');
      return;
    }

    console.log('Creando gráficos con datos:', this.resumen);

    // Gráfico de distribución por tipo
    this.crearGraficoDistribucion();

    // Gráfico de balance
    this.crearGraficoBalance();
  }

  private crearGraficoDistribucion(): void {
    if (!this.resumen || !this.distributionChartRef) {
      console.log('No se puede crear gráfico de distribución');
      return;
    }

    const ctx = this.distributionChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('No se pudo obtener contexto 2d');
      return;
    }

    if (this.distributionChart) {
      this.distributionChart.destroy();
    }

    const data = this.resumen.distribucionPorTipo.filter(d => d.cantidad > 0);
    console.log('Datos para gráfico de distribución:', data);

    this.distributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => this.traducirTipo(d.tipo)),
        datasets: [
          {
            label: 'Cantidad de Productos',
            data: data.map(d => d.cantidad),
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Distribución de Productos por Tipo'
          }
        }
      }
    });
  }

  private crearGraficoBalance(): void {
    if (!this.resumen || !this.balanceChartRef) {
      console.log('No se puede crear gráfico de balance');
      return;
    }

    const ctx = this.balanceChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('No se pudo obtener contexto 2d para balance');
      return;
    }

    if (this.balanceChart) {
      this.balanceChart.destroy();
    }

    const data = this.resumen.distribucionPorTipo.filter(d => d.cantidad > 0);
    console.log('Datos para gráfico de balance:', data);

    this.balanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => this.traducirTipo(d.tipo)),
        datasets: [
          {
            label: 'Saldo Total (€)',
            data: data.map(d => d.saldoTotal),
            backgroundColor: data.map(d =>
              d.saldoTotal >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'
            ),
            borderColor: data.map(d =>
              d.saldoTotal >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
            ),
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Saldo por Tipo de Producto'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `€${value.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  traducirTipo(tipo: string): string {
    const traducciones: Record<string, string> = {
      CUENTA: 'Cuentas',
      DEPOSITO: 'Depósitos',
      PRESTAMO: 'Préstamos',
      TARJETA: 'Tarjetas'
    };
    return traducciones[tipo] || tipo;
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(monto);
  }

  obtenerEstadoChip(estado: string): string {
    return estado === 'ACTIVO' ? 'primary' : 'default';
  }
}

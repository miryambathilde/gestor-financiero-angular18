import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/producto-lista/producto-lista.component').then(
        m => m.ProductoListaComponent
      )
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./features/productos/producto-detalle/producto-detalle.component').then(
        m => m.ProductoDetalleComponent
      )
  },
  {
    path: 'contratacion',
    loadComponent: () =>
      import('./features/contratacion/contratacion-form/contratacion-form.component').then(
        m => m.ContratacionFormComponent
      )
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

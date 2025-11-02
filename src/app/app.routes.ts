import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  // Authentication routes (accessible only when not authenticated)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  // Protected routes (require authentication)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/productos/producto-lista/producto-lista.component').then(
        m => m.ProductoListaComponent
      )
  },
  {
    path: 'productos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/productos/producto-detalle/producto-detalle.component').then(
        m => m.ProductoDetalleComponent
      )
  },
  {
    path: 'contratacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/contratacion/contratacion-form/contratacion-form.component').then(
        m => m.ContratacionFormComponent
      )
  },
  // Redirect to login for unknown routes
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

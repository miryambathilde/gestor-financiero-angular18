import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { User } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  title = 'Gestor Financiero';
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/productos', icon: 'account_balance', label: 'Productos' },
    { path: '/contratacion', icon: 'add_circle', label: 'Contratar' }
  ];

  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.isAuthenticated.set(state.isAuthenticated);
      this.currentUser.set(state.user);
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    const firstInitial = user.nombre.charAt(0);
    const lastInitial = user.apellido.charAt(0);
    return firstInitial + lastInitial.toUpperCase();
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.nombre + ' ' + user.apellido;
  }
}

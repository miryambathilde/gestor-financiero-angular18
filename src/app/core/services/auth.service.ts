import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthState,
  TokenPayload,
  PasswordResetRequest,
  PasswordReset,
  ChangePassword
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  // Signals for reactive state management
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  public readonly user = this.userSignal.asReadonly();
  public readonly token = this.tokenSignal.asReadonly();
  public readonly isLoading = this.loadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly isAuthenticated = computed(() => {
    return !!this.tokenSignal() && !!this.userSignal();
  });

  // BehaviorSubject for backward compatibility with async pipe
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      // Verify token is still valid
      if (this.isTokenValid(token)) {
        this.tokenSignal.set(token);
        this.userSignal.set(user);
        this.updateAuthState();
      } else {
        // Token expired, clear storage
        this.clearStorage();
      }
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      })
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response, credentials.rememberMe);
        }),
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        }),
        tap(() => this.loadingSignal.set(false))
      );
  }

  /**
   * Register new user
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      this.loadingSignal.set(false);
      const error = { message: 'Las contraseñas no coinciden' };
      this.errorSignal.set(error.message);
      return throwError(() => error);
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono
      })
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        }),
        tap(() => this.loadingSignal.set(false))
      );
  }

  /**
   * Logout user
   */
  logout(navigateToLogin = true): void {
    const token = this.getStoredToken();

    // Optional: Notify backend of logout
    if (token) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, {})
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearAuth();

    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Request password reset
   */
  requestPasswordReset(data: PasswordResetRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/password-reset-request`,
      data
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(data: PasswordReset): Observable<{ message: string }> {
    if (data.newPassword !== data.confirmPassword) {
      const error = { message: 'Las contraseñas no coinciden' };
      return throwError(() => error);
    }

    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/password-reset`, {
      token: data.token,
      newPassword: data.newPassword
    });
  }

  /**
   * Change password for authenticated user
   */
  changePassword(data: ChangePassword): Observable<{ message: string }> {
    if (data.newPassword !== data.confirmPassword) {
      const error = { message: 'Las contraseñas no coinciden' };
      return throwError(() => error);
    }

    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(error => {
          this.clearAuth();
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this.userSignal();
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse, rememberMe = false): void {
    const { user, token, refreshToken, expiresIn } = response;

    this.userSignal.set(user);
    this.tokenSignal.set(token);
    this.errorSignal.set(null);

    // Store in localStorage or sessionStorage based on rememberMe
    this.storeAuth(user, token, refreshToken, rememberMe);

    this.updateAuthState();

    // Schedule token refresh before expiration
    if (expiresIn) {
      this.scheduleTokenRefresh(expiresIn);
    }
  }

  /**
   * Handle authentication error
   */
  private handleAuthError(error: HttpErrorResponse): void {
    let errorMessage = 'Ha ocurrido un error durante la autenticación';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.errorSignal.set(errorMessage);
    console.error('Auth error:', error);
  }

  /**
   * Store authentication data
   */
  private storeAuth(user: User, token: string, refreshToken?: string, rememberMe = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    if (rememberMe) {
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    this.errorSignal.set(null);
    this.clearStorage();
    this.updateAuthState();
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  private getStoredRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  /**
   * Get stored user
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);

    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Check if token is valid
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  /**
   * Schedule token refresh
   */
  private scheduleTokenRefresh(expiresIn: number): void {
    // Refresh token 5 minutes before expiration
    const refreshTime = expiresIn - 5 * 60 * 1000;

    if (refreshTime > 0) {
      setTimeout(() => {
        if (this.isAuthenticated()) {
          this.refreshToken().subscribe({
            error: () => this.logout()
          });
        }
      }, refreshTime);
    }
  }

  /**
   * Update auth state subject
   */
  private updateAuthState(): void {
    this.authStateSubject.next({
      user: this.userSignal(),
      token: this.tokenSignal(),
      isAuthenticated: this.isAuthenticated(),
      isLoading: this.loadingSignal(),
      error: this.errorSignal()
    });
  }
}

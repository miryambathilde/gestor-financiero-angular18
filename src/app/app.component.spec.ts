import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from './core/models';

describe('AppComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let authStateSubject: BehaviorSubject<{ isAuthenticated: boolean; user: User | null }>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: UserRole.USER,
    fechaRegistro: new Date(),
    ultimoAcceso: new Date()
  };

  beforeEach(async () => {
    authStateSubject = new BehaviorSubject<{ isAuthenticated: boolean; user: User | null }>({
      isAuthenticated: false,
      user: null
    });

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      authState$: authStateSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the Gestor Financiero title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Gestor Financiero');
  });

  it('should have menu items', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.menuItems.length).toBe(3);
  });

  it('should initialize authentication state on ngOnInit', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    authStateSubject.next({ isAuthenticated: true, user: mockUser });
    fixture.detectChanges();

    expect(app.isAuthenticated()).toBe(true);
    expect(app.currentUser()).toEqual(mockUser);
  });

  it('should update isAuthenticated when auth state changes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.isAuthenticated()).toBe(false);

    authStateSubject.next({ isAuthenticated: true, user: mockUser });
    fixture.detectChanges();

    expect(app.isAuthenticated()).toBe(true);
  });

  it('should call logout on authService when logout is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.logout();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should return user initials when user is logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    authStateSubject.next({ isAuthenticated: true, user: mockUser });
    fixture.detectChanges();

    const initials = app.getUserInitials();
    expect(initials).toBe('JP');
  });

  it('should return empty string for initials when user is not logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const initials = app.getUserInitials();
    expect(initials).toBe('');
  });

  it('should return user display name when user is logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    authStateSubject.next({ isAuthenticated: true, user: mockUser });
    fixture.detectChanges();

    const displayName = app.getUserDisplayName();
    expect(displayName).toBe('Juan Pérez');
  });

  it('should return empty string for display name when user is not logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const displayName = app.getUserDisplayName();
    expect(displayName).toBe('');
  });
});

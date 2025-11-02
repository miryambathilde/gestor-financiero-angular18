# Authentication System - Quick Start Guide

## Getting Started in 5 Minutes

### 1. Run the Application
```bash
npm start
```
Navigate to: `http://localhost:4200`

### 2. You'll See the Login Page
Since all routes are protected, you'll be redirected to `/auth/login`

### 3. Create an Account
Click "Regístrate aquí" → Fill the form → Click "Crear Cuenta"

### 4. You're In!
After registration, you'll be automatically logged in and redirected to the dashboard.

## Key Routes

| URL | Description | Access |
|-----|-------------|--------|
| `/auth/login` | Login page | Public |
| `/auth/register` | Registration page | Public |
| `/dashboard` | Dashboard | Protected |
| `/productos` | Products list | Protected |
| `/contratacion` | Contract form | Protected |

## Important Files

### Core Authentication
- **Service**: `src/app/core/services/auth.service.ts`
- **Models**: `src/app/core/models/auth.model.ts`
- **Guard**: `src/app/core/guards/auth.guard.ts`
- **Interceptor**: `src/app/core/interceptors/auth.interceptor.ts`

### UI Components
- **Login**: `src/app/features/auth/login/`
- **Register**: `src/app/features/auth/register/`

### Configuration
- **Routes**: `src/app/app.routes.ts`
- **Config**: `src/app/app.config.ts`
- **Environment**: `src/environments/environment.ts`

## API Configuration

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000' // ← Change this to your backend
};
```

## Test Credentials (When Backend Ready)

The system expects these backend endpoints:
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- POST `/auth/logout` - Logout

## Common Tasks

### Protect a New Route
```typescript
// In app.routes.ts
{
  path: 'my-page',
  canActivate: [authGuard], // ← Add this
  loadComponent: () => import('./my-page/my-page.component')
}
```

### Check if User is Logged In
```typescript
// In any component
constructor(private authService: AuthService) {}

ngOnInit() {
  // Using signals (recommended)
  if (this.authService.isAuthenticated()) {
    console.log('User is logged in!');
  }

  // Get user data
  const user = this.authService.user();
  console.log('Current user:', user);
}
```

### Get User Info in Template
```html
<!-- In any component template -->
@if (authService.isAuthenticated()) {
  <p>Welcome, {{ authService.user()?.nombre }}!</p>
}
```

### Manual Logout
```typescript
// In any component
logout() {
  this.authService.logout(); // Logs out and redirects to login
}
```

## Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- --include="**/auth.service.spec.ts"

# With coverage
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

Output: `dist/gestor-financiero/`

## Features Included

✅ Login with email/password
✅ User registration
✅ Remember me (persistent session)
✅ Password visibility toggle
✅ Form validation (real-time)
✅ Password strength requirements
✅ Route protection
✅ Auto token refresh
✅ JWT token handling
✅ User profile display
✅ Logout functionality
✅ Return URL after login
✅ Loading states
✅ Error handling
✅ Responsive design
✅ Material Design UI

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

Example valid password: `MyPass123`

## What Happens on Login?

1. User enters credentials
2. POST to `/auth/login`
3. Backend returns: `{ user, token, expiresIn }`
4. Token stored (localStorage or sessionStorage)
5. User redirected to dashboard
6. All API calls include token automatically
7. Token auto-refreshes before expiration

## What Happens on Registration?

1. User fills registration form
2. Form validates (email, password strength, etc.)
3. POST to `/auth/register`
4. Backend returns: `{ user, token, expiresIn }`
5. User automatically logged in
6. Redirected to dashboard

## Troubleshooting

### "Redirecting to login constantly"
→ Check that your backend returns a valid token and user object

### "Token not sent with API requests"
→ Verify `authInterceptor` is in `app.config.ts`

### "Cannot access protected routes"
→ Make sure you're logged in and token is valid

### "Form validation not working"
→ Check browser console for errors

## Need Help?

1. Check `AUTH_IMPLEMENTATION.md` for detailed docs
2. Check `AUTHENTICATION_SUMMARY.md` for overview
3. Review test files for usage examples
4. Check inline code comments

## Demo Flow (Without Backend)

To test the UI without a backend:

1. **Login Page**: Enter any email/password format
   - Will show error (expected without backend)
   - UI and validation work correctly

2. **Register Page**: Fill all fields correctly
   - See real-time validation
   - Password strength checking
   - Form validation

3. **Protected Routes**: Try accessing `/dashboard` directly
   - Should redirect to login (protection working!)

## Next Steps

1. **Set up backend API** or mock server
2. **Test login/register flows** end-to-end
3. **Customize UI** (colors, logos, etc.)
4. **Add more features** (password reset, profile page)
5. **Deploy** to production

## Quick Code Snippets

### Use Auth Service in Component
```typescript
import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({ /* ... */ })
export class MyComponent {
  constructor(public authService: AuthService) {}

  // In template: {{ authService.user()?.nombre }}
  // Or: {{ authService.isAuthenticated() }}
}
```

### Add Role-Based Access
```typescript
import { roleGuard } from './core/guards/auth.guard';
import { UserRole } from './core/models';

// In routes
{
  path: 'admin',
  canActivate: [roleGuard([UserRole.ADMIN])],
  loadComponent: () => import('./admin/admin.component')
}
```

### Manual Login (Programmatic)
```typescript
this.authService.login({
  email: 'user@example.com',
  password: 'MyPass123',
  rememberMe: true
}).subscribe({
  next: (response) => {
    console.log('Logged in!', response.user);
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    console.error('Login failed', error);
  }
});
```

## That's It!

You now have a complete, production-ready authentication system. Happy coding! 🚀

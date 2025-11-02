# Authentication System Implementation

## Overview

This document describes the complete authentication system implemented for the Angular 18+ Financial Management Application (Gestor Financiero).

## Features Implemented

### 1. Authentication Models (`src/app/core/models/auth.model.ts`)

- **User Interface**: Complete user profile with roles
- **LoginCredentials**: Email, password, and remember me option
- **RegisterData**: Full registration form data with validation
- **AuthResponse**: JWT token response from backend
- **AuthState**: Reactive authentication state management
- **TokenPayload**: JWT token structure
- **Password Management**: Reset and change password interfaces

### 2. Authentication Service (`src/app/core/services/auth.service.ts`)

A comprehensive service using Angular 18+ signals for reactive state management:

#### Key Features:

- **Signal-based State**: Using Angular signals for reactive authentication state
- **Token Management**: JWT token storage with localStorage/sessionStorage
- **Automatic Token Refresh**: Schedules token refresh before expiration
- **Remember Me**: Persistent sessions with localStorage
- **Security**: Proper token validation and expiration checking

#### Public Methods:

- `login(credentials)`: Authenticate user with email/password
- `register(data)`: Register new user account
- `logout(navigateToLogin)`: Clear session and redirect
- `refreshToken()`: Refresh expired tokens
- `requestPasswordReset(email)`: Request password reset email
- `resetPassword(data)`: Reset password with token
- `changePassword(data)`: Change password for authenticated user
- `getCurrentUser()`: Get current user data
- `getToken()`: Get current JWT token
- `isUserAuthenticated()`: Check authentication status

#### Signals:

- `user()`: Current user signal (readonly)
- `token()`: Current token signal (readonly)
- `isLoading()`: Loading state signal
- `error()`: Error message signal
- `isAuthenticated()`: Computed authentication status

### 3. Authentication Interceptor (`src/app/core/interceptors/auth.interceptor.ts`)

HTTP interceptor that automatically:

- Adds JWT token to all outgoing requests (except auth endpoints)
- Handles 401 Unauthorized responses
- Logs out user on token expiration
- Uses Bearer token authentication scheme

### 4. Authentication Guards (`src/app/core/guards/auth.guard.ts`)

Three guard functions for route protection:

#### authGuard

- Protects routes that require authentication
- Redirects to `/auth/login` with return URL if not authenticated
- Used on: dashboard, productos, contratacion routes

#### guestGuard

- Prevents authenticated users from accessing auth pages
- Redirects to `/dashboard` if already authenticated
- Used on: login, register routes

#### roleGuard (Factory)

- Creates guards based on allowed roles
- Checks user role against required roles
- Redirects to dashboard if role not authorized
- Example: `roleGuard([UserRole.ADMIN])`

### 5. Login Component (`src/app/features/auth/login`)

Fully functional login page with:

- Reactive form validation
- Email and password fields with validation
- Password visibility toggle
- Remember me checkbox
- Form error messages
- Loading state with spinner
- Success/error notifications using MatSnackBar
- Responsive Material Design UI
- Return URL support for redirect after login

#### Validations:

- Email: Required, valid email format
- Password: Required, minimum 6 characters

### 6. Registration Component (`src/app/features/auth/register`)

Complete registration form with:

- Reactive form with custom validators
- Email, nombre, apellido, telefono (optional), password fields
- Password strength validation
- Password confirmation matching
- Terms and conditions acceptance
- Form validation with detailed error messages
- Loading state and notifications
- Responsive Material Design UI

#### Validations:

- Email: Required, valid email format
- Nombre/Apellido: Required, minimum 2 characters
- Telefono: Optional, 9-15 digits format
- Password: Required, minimum 8 characters, must contain uppercase, lowercase, and numbers
- Confirm Password: Must match password
- Terms: Required acceptance

### 7. Updated Routing (`src/app/app.routes.ts`)

Routes reorganized with authentication:

```typescript
/                          -> Redirects to /dashboard
/auth/login               -> Login page (guestGuard)
/auth/register            -> Register page (guestGuard)
/dashboard                -> Dashboard (authGuard)
/productos                -> Products list (authGuard)
/productos/:id            -> Product detail (authGuard)
/contratacion             -> Contracting form (authGuard)
/**                       -> Redirects to /auth/login
```

### 8. Updated App Configuration (`src/app/app.config.ts`)

- Added `authInterceptor` before `errorInterceptor`
- Proper interceptor chain execution order

### 9. Enhanced App Component (`src/app/app.component.ts/html/scss`)

Main application shell with authentication awareness:

#### Features:

- Conditional toolbar display (only when authenticated)
- User menu with avatar and dropdown
- User initials display
- User profile information
- Logout functionality
- Responsive navigation menu
- Authentication state reactive updates

#### UI Components:

- User avatar with initials
- User display name
- Email display in menu
- Logout button
- Mobile-responsive design

### 10. Environment Configuration

Updated environment files with auth settings:

- `tokenKey`: Storage key for JWT token
- `refreshTokenKey`: Storage key for refresh token
- `userKey`: Storage key for user data
- `tokenExpirationTime`: Default token expiration (1 hour)

## Security Best Practices Implemented

1. **No Hardcoded Credentials**: All credentials are user-provided
2. **Secure Token Storage**: Using browser storage APIs properly
3. **Token Expiration**: Automatic token validation and refresh
4. **HTTP-Only Approach**: Ready for HTTP-only cookies if backend supports
5. **XSS Protection**: No eval() or innerHTML with user data
6. **CSRF Protection**: Token-based authentication
7. **Password Strength**: Enforced strong password requirements
8. **Secure Communication**: Ready for HTTPS in production

## Testing

All core components include comprehensive unit tests:

- `auth.service.spec.ts`: 15+ test cases
- `auth.interceptor.spec.ts`: 6+ test cases
- `auth.guard.spec.ts`: 9+ test cases for all guards
- `login.component.spec.ts`: 10+ test cases
- `register.component.spec.ts`: 12+ test cases

Run tests with:
npm test
npm test

````

## Usage Examples

### Protecting a Route
```typescript
{
  path: 'admin',
  canActivate: [authGuard],
  loadComponent: () => import('./admin/admin.component')
}
````

### Role-Based Protection

```typescript
{
  path: 'admin',
  canActivate: [roleGuard([UserRole.ADMIN])],
  loadComponent: () => import('./admin/admin.component')
}
```

### Using Authentication Service

```typescript
// In a component
constructor(private authService: AuthService) {}

// Check if authenticated
if (this.authService.isUserAuthenticated()) {
  // User is logged in
}

// Get current user
const user = this.authService.getCurrentUser();

// Use signals (recommended)
const isAuth = this.authService.isAuthenticated(); // computed signal
const currentUser = this.authService.user(); // signal
```

### Login Flow

1. User navigates to `/auth/login`
2. Enters credentials and clicks "Iniciar Sesión"
3. Service sends POST to `/auth/login`
4. On success, token is stored and user is redirected
5. All subsequent API calls include Bearer token
6. Token auto-refreshes before expiration

### Registration Flow

1. User navigates to `/auth/register`
2. Fills registration form with validation
3. Accepts terms and conditions
4. Service sends POST to `/auth/register`
5. On success, user is automatically logged in and redirected

## API Endpoints Required

The authentication system expects the following backend endpoints:

### POST /auth/login

```typescript
Request: { email: string, password: string }
Response: { user: User, token: string, refreshToken?: string, expiresIn: number }
```

### POST /auth/register

```typescript
Request: { email: string, password: string, nombre: string, apellido: string, telefono?: string }
Response: { user: User, token: string, refreshToken?: string, expiresIn: number }
```

### POST /auth/logout

```typescript
Response: {
  message: string;
}
Response: {
  message: string;
}
```

### POST /auth/refresh

```typescript
Request: { refreshToken: string }
Response: { user: User, token: string, refreshToken?: string, expiresIn: number }
```

### POST /auth/password-reset-request

```typescript
Request: {
  email: string;
}
Response: {
  message: string;
}
```

### POST /auth/password-reset

```typescript
Request: { token: string, newPassword: string }
Response: { message: string }
```

### POST /auth/change-password

```typescript
Request: { currentPassword: string, newPassword: string }
Response: { message: string }
```

## Configuration

### Backend API URL

Update in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000' // Your backend URL
};
```

### Token Storage Keys

Modify in `auth.service.ts` if needed:

```typescript
private readonly TOKEN_KEY = 'auth_token';
private readonly REFRESH_TOKEN_KEY = 'refresh_token';
private readonly USER_KEY = 'user_data';
```

## Next Steps & Recommendations

1. **Mock Backend**: Consider using json-server or Angular in-memory-web-api for development
2. **Password Reset UI**: Create forgot-password and reset-password components
3. **Profile Page**: Add user profile management page
4. **Email Verification**: Implement email verification flow
5. **2FA Support**: Add two-factor authentication option
6. **Session Management**: Add "Remember this device" feature
7. **Activity Logging**: Log user login/logout activities
8. **Password Policy**: Implement configurable password policies
9. **Account Lockout**: Add brute-force protection
10. **Social Login**: Add OAuth providers (Google, Facebook, etc.)

## File Structure

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── auth.guard.spec.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── auth.interceptor.spec.ts
│   │   ├── error.interceptor.ts
│   │   └── error.interceptor.spec.ts
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── producto-financiero.model.ts
│   │   └── index.ts
│   └── services/
│       ├── auth.service.ts
│       ├── auth.service.spec.ts
│       ├── productos.service.ts
│       └── productos.service.spec.ts
├── features/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   ├── login.component.scss
│   │   │   └── login.component.spec.ts
│   │   └── register/
│   │       ├── register.component.ts
│   │       ├── register.component.html
│   │       ├── register.component.scss
│   │       └── register.component.spec.ts
│   ├── dashboard/
│   ├── productos/
│   └── contratacion/
├── app.component.ts (Updated with auth)
├── app.component.html (Updated with auth)
├── app.component.scss (Updated with auth)
├── app.config.ts (Updated with interceptor)
└── app.routes.ts (Updated with guards)
```

## Dependencies

All dependencies are already included in package.json:

- `@angular/core`: ^18.0.0
- `@angular/common`: ^18.0.0
- `@angular/forms`: ^18.0.0
- `@angular/router`: ^18.0.0
- `@angular/material`: ^18.2.14
- `rxjs`: ~7.8.0

## Support

For issues or questions about the authentication system:

1. Check the test files for usage examples
2. Review the inline code documentation
3. Consult Angular 18+ documentation for signals and standalone components
4. Check Material Design documentation for UI components

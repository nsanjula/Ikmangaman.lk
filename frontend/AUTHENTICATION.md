# Authentication Integration

This document describes the authentication system integration between the React frontend and FastAPI backend.

## Overview

The authentication system provides:

- User registration with form validation
- User login with JWT token management
- Persistent authentication state across browser sessions
- Protected routes that require authentication
- Context-based authentication state management

## Backend Endpoints

### Registration

- **Endpoint**: `POST /signup`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "firstname": "string",
  "lastname": "string (optional)",
  "date_of_birth": "YYYY-MM-DD",
  "username": "string",
  "password": "string"
}
```

- **Response**: Success message

### Login

- **Endpoint**: `POST /auth/login`
- **Content-Type**: `application/x-www-form-urlencoded` (FormData)
- **Request Body**:

```
username=string&password=string
```

- **Response**:

```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

## Frontend Components

### API Service (`client/lib/api.ts`)

- Handles all authentication API calls
- Manages token storage in localStorage
- Provides helper methods for authentication state
- Includes proper error handling for network issues

### Authentication Context (`client/contexts/AuthContext.tsx`)

- React context for managing authentication state
- Provides hooks for login, logout, and authentication status
- Persists authentication state across browser sessions

### Form Components

- **RegisterForm**: Handles user registration with validation
- **LoginForm**: Handles user login with credential validation
- Both forms integrate with the backend APIs and authentication context

### Utility Components

- **AuthStatus**: Shows current authentication status with login/logout buttons
- **ProtectedRoute**: Component wrapper that guards routes requiring authentication

## Usage Examples

### Using Authentication Context

```tsx
import { useAuth } from "../contexts/AuthContext";

const MyComponent = () => {
  const { isAuthenticated, logout, login } = useAuth();

  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }

  return <button onClick={() => navigate("/login")}>Login</button>;
};
```

### Creating Protected Routes

```tsx
import ProtectedRoute from "../components/ProtectedRoute";

// In App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

### Form Integration

```tsx
// The forms automatically handle:
// - Input validation
// - API calls to backend
// - Error display
// - Authentication state updates
// - Navigation after success
```

## Configuration

### Backend Configuration

- FastAPI server should run on `http://localhost:8000`
- CORS is configured to allow requests from `http://localhost:8080`
- Database tables are automatically created on startup

### Frontend Configuration

- API base URL is configured in `client/lib/api.ts`
- Token storage uses browser localStorage
- Authentication state persists across browser sessions

## Error Handling

The system includes comprehensive error handling for:

- Network connectivity issues
- Invalid credentials
- Server errors
- Form validation errors
- Duplicate username registration

## Security Features

- Passwords are hashed on the backend
- JWT tokens for stateless authentication
- Automatic token cleanup on logout
- Protected routes redirect to login when unauthenticated
- CORS protection against unauthorized origins

## Testing the Integration

1. Start the backend server (FastAPI)
2. Start the frontend development server
3. Navigate to `/register` to create a new account
4. Navigate to `/login` to authenticate
5. Use `AuthStatus` component to verify authentication state
6. Test protected routes to ensure proper redirection

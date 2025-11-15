---
id: task-015
title: "React Frontend: Authentication Pages"
category: "Frontend"
priority: "P1"
estimated_hours: 8
---

## Task Overview

Implement login, logout, and session management UI for user authentication.

## Description

Create authentication pages and integrate with backend authentication API.

**Scope**:
- Create Login page with email/password form
- Implement login form validation
- Implement login API call
- Store JWT token in localStorage or HttpOnly cookie
- Create logout functionality
- Implement "stay logged in" (remember me)
- Create session timeout warning
- Create password change page
- Implement auth context for global user state
- Add loading and error states

## Acceptance Criteria

- [ ] Login page renders with email and password fields
- [ ] Form validation: email format, password required
- [ ] Submit button disabled while loading
- [ ] Error message displays on login failure
- [ ] Success login redirects to dashboard
- [ ] JWT token stored after login
- [ ] Logout clears token and redirects to login
- [ ] Session timeout warning appears before expiration
- [ ] Remember me checkbox persists session
- [ ] Password change page accessible from settings
- [ ] Auth context provides user info to all components
- [ ] Protected routes redirect to login if not authenticated
- [ ] Component tests pass

## Inputs

- Authentication API endpoints from backend
- Login UI requirements
- Session management requirements

## Outputs

- Login page (`frontend/src/pages/LoginPage.tsx`)
- Password change page (`frontend/src/pages/ChangePasswordPage.tsx`)
- Auth context (`frontend/src/context/AuthContext.tsx`)
- Protected route component (`frontend/src/components/ProtectedRoute.tsx`)
- Auth hook (`frontend/src/hooks/useAuth.ts`)
- HTTP client with auth headers (`frontend/src/services/api.ts`)
- Component tests

## Dependencies

- Task-014 (Core UI Components)
- Task-003 (Authentication Backend)

## Technical Notes

**Auth Context** provides:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}
```

**Token Storage**:
- Option 1: localStorage (vulnerable to XSS but simpler)
- Option 2: HttpOnly cookie (more secure, but requires CSRF token)
- Recommendation: HttpOnly cookie + CSRF token for production

**API Client Setup**:
```typescript
// Automatically add auth header to all requests
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401 response
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
    }
  }
);
```

**Session Timeout**:
- Track last activity
- Warn user 5 minutes before timeout
- Auto-logout on timeout
- Allow user to extend session

**Login Form**:
- Email field with validation
- Password field (masked)
- Remember me checkbox
- Submit button
- Error display
- Loading state

## Success Criteria

✓ Login/logout works correctly
✓ Token is stored securely
✓ Session timeout is handled
✓ Auth context is accessible globally

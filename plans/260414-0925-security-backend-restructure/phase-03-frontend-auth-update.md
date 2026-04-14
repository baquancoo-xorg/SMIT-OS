# Phase 3: Frontend Auth Update

**Priority:** HIGH
**Effort:** 2 days
**Status:** completed
**Depends on:** Phase 1, Phase 2

## Overview

Update AuthContext để sử dụng cookie-based JWT auth thay vì localStorage.

## Context

**Current state:** [AuthContext.tsx](../../src/contexts/AuthContext.tsx)
- Line 29: Restore session từ localStorage
- Line 58: Save user_id to localStorage
- Không handle 401 responses

**Target state:**
- Gọi /api/auth/me để check session
- Cookies tự động gửi với mọi request
- Redirect login khi 401

## Implementation Steps

### Step 1: Update AuthContext
**File:** `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include', // Important: send cookies
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
      // If 401, user is not logged in - that's fine
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        credentials: 'include',
      });

      if (res.status === 401) {
        // Session expired, redirect to login
        setCurrentUser(null);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important: receive cookies
      });

      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.error || 'Invalid credentials' };
      }

      const user = await res.json();
      setCurrentUser(user);
      // No localStorage needed - cookie handles session
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Fetch users after authentication
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      loading,
      isAdmin: currentUser?.isAdmin || false,
      login,
      logout,
      refreshUsers: fetchUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Step 2: Create API Wrapper with 401 Handling
**File:** `src/lib/api.ts`

```typescript
type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

class ApiClient {
  private baseUrl = '/api';

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (res.status === 401 && !skipAuth) {
      // Session expired - redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  get<T>(endpoint: string) {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data: unknown) {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.fetch(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
```

### Step 3: Update Login Page
**File:** `src/pages/LoginPage.tsx`

```typescript
// Ensure login form uses AuthContext.login()
// Remove any localStorage references
// Handle loading state properly

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  const result = await login(username, password);
  
  if (result.success) {
    navigate('/'); // Redirect to dashboard
  } else {
    setError(result.error || 'Login failed');
  }
  
  setIsLoading(false);
};
```

### Step 4: Add Protected Route Wrapper
**File:** `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

### Step 5: Update App Router
**File:** `src/App.tsx`

```typescript
import { ProtectedRoute } from './components/ProtectedRoute';

// Wrap protected routes
<Route path="/" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminPage />
  </ProtectedRoute>
} />

// Login is public
<Route path="/login" element={<LoginPage />} />
```

### Step 6: Clean Up localStorage References
Search and remove all localStorage usage:

```bash
grep -r "localStorage" src/
```

Remove:
- `localStorage.getItem('smit_os_user_id')`
- `localStorage.setItem('smit_os_user_id', ...)`
- `localStorage.removeItem('smit_os_user_id')`

## Files to Create

| File | Purpose |
|------|---------|
| src/lib/api.ts | API wrapper with 401 handling |
| src/components/ProtectedRoute.tsx | Route protection HOC |

## Files to Modify

| File | Changes |
|------|---------|
| src/contexts/AuthContext.tsx | Cookie-based auth |
| src/pages/LoginPage.tsx | Use new login flow |
| src/App.tsx | Add ProtectedRoute wrappers |

## Testing Checklist

- [ ] Fresh browser visit shows login page
- [ ] Login sets cookie (check DevTools > Application > Cookies)
- [ ] Refresh page maintains session
- [ ] Logout clears cookie and redirects
- [ ] Expired token redirects to login
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin routes redirect non-admin users

## Edge Cases

- [ ] Multiple tabs: logout in one tab affects others on next API call
- [ ] Token expiry: graceful redirect to login
- [ ] Network error: show error message, don't redirect

## Security Notes

- Cookies sent automatically with `credentials: 'include'`
- No token in JavaScript memory (XSS-safe)
- SameSite=Strict prevents CSRF
- Must use HTTPS in production for Secure cookie

## Next Phase

After completion, proceed to [Phase 4: Backend Modularization](phase-04-backend-modularization.md)

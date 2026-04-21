import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    requiresTOTP?: boolean;
    tempToken?: string;
  }>;
  verifyTOTP: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
  refreshCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.status === 401) {
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
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.error || 'Invalid credentials' };
      }
      const data = await res.json();
      if (data.requiresTOTP) {
        return { success: false, requiresTOTP: true, tempToken: data.tempToken };
      }
      setCurrentUser(data);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const verifyTOTP = useCallback(async (tempToken: string, code: string) => {
    try {
      const res = await fetch('/api/auth/login/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Invalid code' };
      }
      const user = await res.json();
      setCurrentUser(user);
      return { success: true };
    } catch {
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const contextValue = useMemo(() => ({
    currentUser,
    setCurrentUser,
    users,
    loading,
    isAdmin: currentUser?.isAdmin || false,
    login,
    verifyTOTP,
    refreshCurrentUser: checkSession,
    logout,
    refreshUsers: fetchUsers,
  }), [currentUser, users, loading, login, verifyTOTP, checkSession, logout, fetchUsers]);

  return (
    <AuthContext.Provider value={contextValue}>
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

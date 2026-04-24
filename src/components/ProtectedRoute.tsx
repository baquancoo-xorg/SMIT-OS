import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, requireAdmin, fallback }: ProtectedRouteProps) {
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
    return fallback ? <>{fallback}</> : <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requireAdmin && !currentUser.isAdmin) {
    return fallback ? <>{fallback}</> : <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

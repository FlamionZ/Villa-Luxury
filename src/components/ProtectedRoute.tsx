'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, don't render content
  // (AuthProvider will handle redirect)
  if (!user && pathname !== '/admin/login') {
    return null;
  }

  // If authenticated and on login page, don't render login page
  // (AuthProvider will handle redirect)
  if (user && pathname === '/admin/login') {
    return null;
  }

  return <>{children}</>;
}
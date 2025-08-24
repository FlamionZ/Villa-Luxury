'use client';

import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, children }: AdminHeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="admin-header">
      <h1>{title}</h1>
      <div className="header-actions">
        {children}
        <div className="user-menu">
          <span className="user-info">
            <i className="fas fa-user-circle"></i>
            {user?.username || 'Admin User'}
          </span>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children?: React.ReactNode;
}

/** Redirects to /login if user is not authenticated. */
export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f19' }}>
        <div className="flex items-center gap-3 text-indigo-400 text-sm font-medium">
          <div className="spinner spinner-indigo" />
          Initializing CoreCode...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
};

/** Redirects non-admin users to /student/dashboard. */
export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-indigo-600 text-sm font-medium">
          <div className="spinner spinner-indigo" />
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = ['SUPER_ADMIN', 'ASSESSMENT_ADMIN', 'REVIEWER'].includes(user.role);
  if (!isAdmin) return <Navigate to="/student/dashboard" replace />;

  return children ? <>{children}</> : <Outlet />;
};


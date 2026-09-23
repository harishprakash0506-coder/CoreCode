import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentNavbar } from './components/StudentNavbar';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';

const StudentLayout: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    if (tab === 'history') navigate('/student/history');
    else if (tab === 'profile') navigate('/student/profile');
    else navigate('/student/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <StudentNavbar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <StudentDashboard user={user} activeTab={activeTab} />
      </main>
    </div>
  );
};

const AdminLayout: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      <AdminNavbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1">
        <AdminSidebar activeTab={activeTab} setActiveTab={(tab) => navigate(`/admin/${tab}`)} />
        <main className="flex-1 overflow-y-auto">
          <AdminDashboard activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 text-white min-h-screen flex items-center justify-center" style={{ background: '#0b0f19' }}>
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-slate-400">This module is part of upcoming Phase features.</p>
    </div>
  </div>
);

/** Root component with routing and authentication context */
export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentLayout activeTab="dashboard" />} />
          <Route path="/student/history" element={<StudentLayout activeTab="history" />} />
          <Route path="/student/profile" element={<StudentLayout activeTab="profile" />} />
        </Route>

        {/* Admin protected routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminLayout activeTab="dashboard" />} />
          <Route path="/admin/students" element={<AdminLayout activeTab="students" />} />
          <Route path="/admin/questions" element={<AdminLayout activeTab="questions" />} />
          <Route path="/admin/assessments" element={<PlaceholderPage title="Assessments" />} />
          <Route path="/admin/submissions" element={<PlaceholderPage title="Submissions" />} />
          <Route path="/admin/results" element={<PlaceholderPage title="Results" />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        {/* Catch-all – redirect based on auth state */}
        <Route path="*" element={<RedirectBasedOnAuth />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

/** Helper component that redirects unknown routes based on authentication */
const RedirectBasedOnAuth: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f19' }}>
        <div className="flex items-center gap-3 text-indigo-400 text-sm font-medium">
          <div className="spinner spinner-indigo" />
          Loading CoreCode…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = ['SUPER_ADMIN', 'ASSESSMENT_ADMIN', 'REVIEWER'].includes(user.role);
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

export default App;




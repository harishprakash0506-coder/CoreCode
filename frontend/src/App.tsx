import { useEffect, useState } from 'react';
import { api, type User } from './services/api';
import { StudentNavbar } from './components/StudentNavbar';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = api.getToken();
      if (token) {
        const u = await api.getProfile();
        setUser(u);
      }
    } catch (err) {
      console.error('Session validation error', err);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-semibold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          Initializing CoreCode Platform...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white">
        {authMode === 'login' ? (
          <LoginModal
            onSuccess={(u) => setUser(u)}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterModal
            onSuccess={() => setAuthMode('login')}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ASSESSMENT_ADMIN' || user.role === 'REVIEWER';

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
        <AdminNavbar user={user} onLogout={handleLogout} />
        <div className="flex flex-1">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-y-auto">
            <AdminDashboard activeTab={activeTab} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      <StudentNavbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <StudentDashboard user={user} activeTab={activeTab} />
      </main>
    </div>
  );
}

export default App;

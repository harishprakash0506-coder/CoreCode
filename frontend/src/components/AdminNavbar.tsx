import React from 'react';
import { LogOut, Shield } from 'lucide-react';

interface Props {
  user: any;
  onLogout: () => void;
}

export const AdminNavbar: React.FC<Props> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Role: {user?.role || 'SUPER_ADMIN'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-100">{user?.full_name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
};

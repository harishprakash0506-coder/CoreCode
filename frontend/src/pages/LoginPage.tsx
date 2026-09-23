import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Code2, Zap, Shield, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CODE_LINES = [
  'function solve(n) {',
  '  if (n <= 1) return n;',
  '  return solve(n-1) + solve(n-2);',
  '}',
  '',
  'class BinarySearch {',
  '  search(arr, target) {',
  '    let lo = 0, hi = arr.length-1;',
  '    while (lo <= hi) {',
  '      const mid = (lo+hi) >> 1;',
  '      if (arr[mid] === target) return mid;',
  '      arr[mid] < target ? lo=mid+1 : hi=mid-1;',
  '    }',
  '    return -1;',
  '  }',
  '}',
  '',
  'const isPrime = (n) => {',
  '  for (let i=2; i*i<=n; i++)',
  '    if (n % i === 0) return false;',
  '  return n > 1;',
  '}',
  '',
  'function mergeSort(arr) {',
  '  if (arr.length <= 1) return arr;',
  '  const mid = Math.floor(arr.length / 2);',
  '  return merge(',
  '    mergeSort(arr.slice(0, mid)),',
  '    mergeSort(arr.slice(mid))',
  '  );',
  '}',
];

const features = [
  { icon: Code2, label: '300 Curated Questions', sub: '30 per level across 10 levels' },
  { icon: Zap, label: 'Real-Time Execution', sub: 'C, C++, Java, Python supported' },
  { icon: Shield, label: 'Secure Assessments', sub: 'Anti-cheat + server-authoritative timer' },
  { icon: BarChart2, label: 'Instant Results', sub: '5 hidden tests, 50 marks per question' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const isAdmin = ['SUPER_ADMIN', 'ASSESSMENT_ADMIN', 'REVIEWER'].includes(user.role);
      navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      const isAdmin = ['SUPER_ADMIN', 'ASSESSMENT_ADMIN', 'REVIEWER'].includes(loggedInUser.role);
      navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0b0f19' }}>

      {/* ── LEFT PANEL: Branding ── */}
      <div
        className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1526 0%, #111827 50%, #0b0f19 100%)' }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        {/* Scrolling code lines */}
        <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
          <div className="absolute inset-0 flex flex-col justify-center px-12 opacity-[0.04]">
            {CODE_LINES.map((line, i) => (
              <div key={i} className="text-indigo-300 font-mono text-sm leading-6 whitespace-pre">{line}</div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10 animate-slide-in-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">CoreCode</div>
              <div className="text-xs text-indigo-400 font-semibold tracking-widest uppercase">Assessment Platform</div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 animate-slide-up space-y-4">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Code.<br />Solve.<br />
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Prove.
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            India's most structured coding assessment platform with 300 hand-curated questions across 10 progressive levels.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-3 stagger">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-slate-500 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 text-xs text-slate-600">
          CoreCode © 2026 · Built for excellence in coding education
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white">CoreCode</span>
        </div>

        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white">Welcome back</h2>
            <p className="text-slate-400 mt-1.5 text-sm">Sign in to your CoreCode account to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-start gap-3 text-sm ${shake ? 'animate-shake' : ''}`}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button id="login-submit" type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><div className="spinner spinner-sm" /> Authenticating...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Create student account
            </Link>
          </p>

          {/* Admin hint */}
          <p className="text-center text-xs text-slate-600 mt-4">
            Admin or Reviewer? Contact your system administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
};

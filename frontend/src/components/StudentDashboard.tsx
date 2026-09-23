import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Award, Play, Sparkles, Layers
} from 'lucide-react';

interface Props {
  user: any;
  activeTab: string;
}

export const StudentDashboard: React.FC<Props> = ({ user, activeTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const levelInfo = [
    { num: 1, title: 'Input/Output & Conditionals', topic: 'Operators, if/else, switch', color: 'from-blue-500 to-indigo-600' },
    { num: 2, title: 'Loops & Iterations', topic: 'for, while, nested loops', color: 'from-indigo-500 to-purple-600' },
    { num: 3, title: 'Numbers & Digits', topic: 'Digit extraction, primes, math', color: 'from-purple-500 to-pink-600' },
    { num: 4, title: '1D Arrays', topic: 'Array manipulation & traversal', color: 'from-pink-500 to-rose-600' },
    { num: 5, title: 'Strings', topic: 'String ops, palindrome, anagram', color: 'from-rose-500 to-orange-600' },
    { num: 6, title: '2D Arrays / Matrices', topic: 'Matrix ops, row/column sums', color: 'from-amber-500 to-yellow-600' },
    { num: 7, title: 'Functions & Recursion', topic: 'Reusable code, recursive calls', color: 'from-emerald-500 to-teal-600' },
    { num: 8, title: 'OOP Concepts', topic: 'Classes, objects, methods', color: 'from-teal-500 to-cyan-600' },
    { num: 9, title: 'Searching & Sorting', topic: 'Linear/Binary search, Bubble sort', color: 'from-cyan-500 to-blue-600' },
    { num: 10, title: 'Basic DSA', topic: 'Stacks, Queues, Hash Maps', color: 'from-violet-500 to-fuchsia-600' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sData, hData] = await Promise.all([
        api.getStudentDashboardStats().catch(() => null),
        api.getStudentHistory().catch(() => []),
      ]);
      setStats(sData);
      setHistory(Array.isArray(hData) ? hData : []);
    } catch (err) {
      console.error('Failed to load student dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-indigo-400 font-medium">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          Loading CoreCode Portal...
        </div>
      </div>
    );
  }

  if (activeTab === 'history') {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Assessment History</h1>
            <p className="text-sm text-gray-400">Your past coding assessment attempts & scores</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-3">
            <Award className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">No Assessments Attempted Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Select any level from the Dashboard to start your 60-minute assessment attempt.
            </p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-gray-800">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Assessment ID</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Started At</th>
                  <th className="px-6 py-4">Q1 Marks</th>
                  <th className="px-6 py-4">Q2 Marks</th>
                  <th className="px-6 py-4">Total Score</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-800/30 transition-all">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">{h.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-semibold text-white">Level {h.level_num}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(h.started_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-200">{h.q1_score} / 50</td>
                    <td className="px-6 py-4 font-semibold text-gray-200">{h.q2_score} / 50</td>
                    <td className="px-6 py-4 font-bold text-indigo-400 text-base">{h.total_score} / 100</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        h.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="glass-panel p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{user?.full_name}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                ROLE: {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Assessments Taken</p>
              <p className="text-2xl font-extrabold text-white mt-1">{stats?.total_assessments_taken || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
              <p className="text-xs text-gray-400 font-semibold uppercase">Average Assessment Score</p>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1">{stats?.average_score || 0} / 100</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden glass-panel p-8 border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-gray-900">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            CoreCode Question Bank Engine Ready
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Select Your Assessment Level
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Choose a level to attempt 2 randomly selected questions (60 minutes). Non-repeating question pool logic guarantees unique questions on retry until all 30 questions per level are attempted.
          </p>
        </div>
      </div>

      {/* Level Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Levels 1–10 Assessment Question Pool
          </h2>
          <span className="text-xs text-gray-400">300 total curated Excel questions (30 / level)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {levelInfo.map((l) => {
            const prog = stats?.level_progress?.[`Level ${l.num}`] || { attempted_questions: 0, remaining: 30 };
            const attempted = prog.attempted_questions;

            return (
              <div
                key={l.num}
                className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4 group hover:border-indigo-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${l.color} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                      {l.num}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400">
                      Pool: {attempted}/30
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {l.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.topic}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-800/80">
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${(attempted / 30) * 100}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => alert(`Phase 1 verification active. Ready to launch Level ${l.num} Assessment session in Phase 2.`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Assessment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

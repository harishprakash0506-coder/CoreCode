import React, { useEffect, useState } from 'react';
import { api, type QuestionAdmin } from '../services/api';
import { 
  Users, HelpCircle, FileCheck, 
  Search, Shield, Eye
} from 'lucide-react';

interface Props {
  activeTab: string;
}

export const AdminDashboard: React.FC<Props> = ({ activeTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<QuestionAdmin[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionAdmin | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [selectedLevel]);

  const loadAdminData = async () => {
    try {
      const [sData, stData, qData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStudents(),
        api.getAdminQuestionBank(selectedLevel),
      ]);
      setStats(sData);
      setStudents(stData);
      setQuestions(qData);
    } catch (err) {
      console.error('Error loading admin dashboard', err);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.question_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="light-panel p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions</span>
            <HelpCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.total_questions || 300}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Verified 30 per level (Levels 1-10)</p>
        </div>

        <div className="light-panel p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.total_students || students.length}</p>
          <p className="text-xs text-slate-500 mt-1">Registered Platform Candidates</p>
        </div>

        <div className="light-panel p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessments</span>
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.total_assessments || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Completed Assessment Sessions</p>
        </div>

        <div className="light-panel p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Security</span>
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">Enforced</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Hidden Test Cases Backend-Only</p>
        </div>
      </div>

      {/* Main Content Sections based on activeTab */}
      {activeTab === 'students' && (
        <div className="light-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Student Directory</h2>
            <span className="text-xs text-slate-500">{students.length} registered students</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs">{s.id}</td>
                  <td className="px-6 py-4 font-semibold">{s.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{s.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === 'questions' || activeTab === 'dashboard') && (
        <div className="light-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">CoreCode 300 Excel Question Bank</h2>
              <p className="text-xs text-slate-500">Source of Truth: CoreCode_30_Unique_Questions_Per_Level.xlsx</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedLevel || ''}
                  onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Levels (300)</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Level {i + 1} (30)</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Q-ID</th>
                  <th className="px-6 py-3.5">Level</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Topic</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Sample Cases</th>
                  <th className="px-6 py-3.5">Hidden Cases</th>
                  <th className="px-6 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredQuestions.slice(0, 50).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{q.question_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{q.level_name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{q.title}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{q.topic}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">2 Visible (0 marks)</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">5 Hidden (10 marks ea)</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedQuestion(q)}
                        className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                        title="View Question Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold">{selectedQuestion.question_id}</span>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedQuestion.title}</h3>
              </div>
              <button onClick={() => setSelectedQuestion(null)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Problem Statement</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{selectedQuestion.problem_statement}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Input Format</p>
                  <p className="text-xs text-slate-700 mt-1">{selectedQuestion.input_format}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Output Format</p>
                  <p className="text-xs text-slate-700 mt-1">{selectedQuestion.output_format}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Visible Sample Test Cases (2)</p>
                <div className="space-y-2">
                  {selectedQuestion.sample_test_cases.map((tc, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                      <p><span className="text-slate-400 font-bold">Input:</span> {tc.input_data}</p>
                      <p className="mt-1"><span className="text-slate-400 font-bold">Output:</span> {tc.expected_output}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

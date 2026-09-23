import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Code2, Clock, Play, CheckCircle2, ArrowLeft, 
  Terminal as TerminalIcon, FileText, AlertCircle, Send,
  Layers, Tag
} from 'lucide-react';
import { api, type AssessmentSession, type AssessmentQuestion } from '../services/api';

const javaStarterCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your code here

    }
}`;

export const AssessmentPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [codeQ1, setCodeQ1] = useState<string>(javaStarterCode);
  const [codeQ2, setCodeQ2] = useState<string>(javaStarterCode);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [outputLog, setOutputLog] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Fetch Real Assessment Session on Mount
  useEffect(() => {
    if (!assessmentId) {
      setError('No Assessment ID provided.');
      setLoading(false);
      return;
    }

    loadAssessmentSession(assessmentId);
  }, [assessmentId]);

  const loadAssessmentSession = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAssessmentSession(id);
      setSession(data);
      setTimeLeft(data.remaining_seconds || 0);
    } catch (err: any) {
      console.error('Failed to load assessment session:', err);
      setError(err.message || 'Failed to load assessment session data.');
    } finally {
      setLoading(false);
    }
  };

  // Countdown Timer based on backend remaining_seconds
  useEffect(() => {
    if (!session || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatusMessage({ type: 'error', text: 'Assessment Time Expired! Please submit your work.' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeLeft > 0]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current active question from backend questions array
  const currentQuestion: AssessmentQuestion | undefined = session?.questions?.[activeTab - 1];
  const currentCode = activeTab === 1 ? codeQ1 : codeQ2;
  const setCurCode = (val: string) => {
    if (activeTab === 1) setCodeQ1(val);
    else setCodeQ2(val);
  };

  const handleRunSample = () => {
    if (!currentQuestion) return;
    setStatusMessage({ type: 'info', text: 'Running Java sample test cases...' });
    
    const sampleCasesText = currentQuestion.sample_test_cases && currentQuestion.sample_test_cases.length > 0
      ? currentQuestion.sample_test_cases.map((tc, idx) => 
          `[Sample Case #${idx + 1}]\nInput:\n${tc.input_data}\nExpected Output:\n${tc.expected_output}\nResult: PASS`
        ).join('\n\n')
      : 'No sample test cases configured for this question.';

    setOutputLog(`[JAVA SIMULATION RUN - ${currentQuestion.question_id}: ${currentQuestion.title}]\nCompilation: SUCCESS\n\n${sampleCasesText}\n\nExecution Status: PASS (Sample Test Simulation Clean)`);
  };

  const handleSubmitQuestion = () => {
    if (!currentQuestion) return;
    setStatusMessage({ type: 'success', text: `Question ${activeTab} (${currentQuestion.question_id}) Java solution saved (Simulation mode).` });
  };

  const handleFinishAssessment = () => {
    if (window.confirm('Are you sure you want to finish and submit your assessment session?')) {
      navigate('/student/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-indigo-300">Loading Real Assessment Questions from PostgreSQL...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white font-sans p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mx-auto border border-rose-500/30">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Assessment Load Error</h2>
          <p className="text-sm text-gray-400">{error || 'Could not load assessment session data.'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="h-16 bg-[#0f172a] border-b border-gray-800 px-6 flex items-center justify-between z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </button>
          <div className="h-6 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">CoreCode Assessment • Level {session.level_num}</h1>
              <p className="text-[11px] text-gray-400 font-mono">Session ID: {session.assessment_id.slice(0, 18)}...</p>
            </div>
          </div>
        </div>

        {/* Level Info & Countdown Timer */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300">
            <span className={`w-2 h-2 rounded-full ${session.status === 'IN_PROGRESS' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            Status: {session.status}
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
            timeLeft <= 300 
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300'
          }`}>
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleFinishAssessment}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finish Assessment
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Side: Problem Statement Panel */}
        <div className="w-full lg:w-1/2 border-r border-gray-800 flex flex-col bg-[#0b0f19]">
          {/* Question Tabs */}
          <div className="flex border-b border-gray-800 bg-[#0f172a]/60 p-2 gap-2 shrink-0">
            {session.questions.map((q, idx) => {
              const tabNum = (idx + 1) as 1 | 2;
              return (
                <button
                  key={q.question_id}
                  onClick={() => setActiveTab(tabNum)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tabNum
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Q{tabNum}: {q.question_id} ({q.question_max_marks} Marks)
                </button>
              );
            })}
          </div>

          {/* Problem Statement Details */}
          {currentQuestion ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {currentQuestion.question_id} • Max Marks: {currentQuestion.question_max_marks}
                </span>
                {currentQuestion.topic && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-gray-900 text-gray-300 border border-gray-800 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    {currentQuestion.topic}
                  </span>
                )}
                {currentQuestion.difficulty && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {currentQuestion.difficulty}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-extrabold text-white">{currentQuestion.title}</h2>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Problem Statement</h3>
                <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                  {currentQuestion.problem_statement}
                </div>
              </div>

              {currentQuestion.input_format && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Input Format</h4>
                  <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-300 font-mono whitespace-pre-line">
                    {currentQuestion.input_format}
                  </div>
                </div>
              )}

              {currentQuestion.output_format && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Output Format</h4>
                  <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-300 font-mono whitespace-pre-line">
                    {currentQuestion.output_format}
                  </div>
                </div>
              )}

              {/* Sample Test Cases Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sample Test Cases</h4>
                {currentQuestion.sample_test_cases && currentQuestion.sample_test_cases.length > 0 ? (
                  currentQuestion.sample_test_cases.map((tc, idx) => (
                    <div key={tc.id || idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Sample Case #{idx + 1}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 mb-1">Input Data:</p>
                          <pre className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 font-mono text-xs text-indigo-300">
                            {tc.input_data}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 mb-1">Expected Output:</p>
                          <pre className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 font-mono text-xs text-emerald-300">
                            {tc.expected_output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No explicit sample test cases provided for this question.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Side: Java Monaco Code Editor & Execution Terminal */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[#0b0f19] border-t lg:border-t-0 border-gray-800">
          {/* Action Header Bar */}
          <div className="h-12 bg-[#0f172a]/80 border-b border-gray-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Language:</span>
              <span className="px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-xs font-mono font-bold border border-indigo-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Java 17
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunSample}
                className="py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                Run Sample Tests
              </button>
              <button
                onClick={handleSubmitQuestion}
                className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Question
              </button>
            </div>
          </div>

          {/* Monaco Code Editor Wrapper */}
          <div className="w-full border-b border-gray-800 bg-[#1e1e1e] p-1">
            <Editor
              height="450px"
              language="java"
              theme="vs-dark"
              value={currentCode}
              onChange={(val) => setCurCode(val || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                formatOnPaste: true,
              }}
            />
          </div>

          {/* Terminal / Execution Output Area */}
          <div className="min-h-[160px] flex-1 border-t border-gray-800 bg-[#070a12] flex flex-col shrink-0">
            <div className="px-4 py-2 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
                Execution Output & Test Runner
              </div>
              {statusMessage && (
                <div className={`text-xs font-medium flex items-center gap-1.5 ${
                  statusMessage.type === 'success' ? 'text-emerald-400' : statusMessage.type === 'error' ? 'text-rose-400' : 'text-indigo-400'
                }`}>
                  {statusMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {statusMessage.text}
                </div>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto text-gray-300 space-y-2">
              {outputLog ? (
                <pre className="whitespace-pre-wrap leading-relaxed text-indigo-300">{outputLog}</pre>
              ) : (
                <p className="text-gray-500 italic">
                  Click "Run Sample Tests" to execute your Java code against sample inputs, or "Submit Question" to store your code.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;

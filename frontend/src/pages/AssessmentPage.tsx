import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Code2, Clock, Play, CheckCircle2, ArrowLeft, 
  Terminal as TerminalIcon, FileText, AlertCircle, Send
} from 'lucide-react';

interface MockQuestion {
  id: string;
  title: string;
  statement: string;
  sampleInput: string;
  sampleOutput: string;
  initialCode: string;
}

const javaStarterCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Write your code here

    }
}`;

const mockQuestions: Record<number, MockQuestion> = {
  1: {
    id: 'Q1',
    title: 'Question 1: Calculate Total Score with Bonus',
    statement: `Write a program that takes three integers representing base scores and a bonus factor.
Calculate the weighted total according to the formula: (Score1 + Score2 + Score3) * Bonus.

Input Format:
First line contains score1, score2, score3 separated by spaces.
Second line contains bonus factor.

Output Format:
Print the final total score as an integer.`,
    sampleInput: `10 20 30\n2`,
    sampleOutput: `120`,
    initialCode: javaStarterCode,
  },
  2: {
    id: 'Q2',
    title: 'Question 2: Filter and Find Maximum Pair',
    statement: `Given an array of integers, find the maximum sum of any two adjacent elements in the array.

Input Format:
First line contains an integer N (the size of array).
Second line contains N space-separated integers.

Output Format:
Print a single integer representing the maximum adjacent sum.`,
    sampleInput: `5\n3 7 2 9 4`,
    sampleOutput: `11`,
    initialCode: javaStarterCode,
  },
};

export const AssessmentPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [codeQ1, setCodeQ1] = useState(mockQuestions[1].initialCode);
  const [codeQ2, setCodeQ2] = useState(mockQuestions[2].initialCode);
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 60 minutes
  const [outputLog, setOutputLog] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // 60-Minute Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = mockQuestions[activeTab];
  const currentCode = activeTab === 1 ? codeQ1 : codeQ2;
  const setCurCode = (val: string) => {
    if (activeTab === 1) setCodeQ1(val);
    else setCodeQ2(val);
  };

  const handleRunSample = () => {
    setStatusMessage({ type: 'info', text: 'Running Java sample test cases...' });
    setOutputLog(`[JAVA SIMULATION RUN - Q${activeTab}]\nSample Input:\n${currentQuestion.sampleInput}\n\nExpected Output:\n${currentQuestion.sampleOutput}\n\nCompilation: SUCCESS\nExecution Status: PASS (Sample Test Simulation Clean)`);
  };

  const handleSubmitQuestion = () => {
    setStatusMessage({ type: 'success', text: `Question ${activeTab} Java solution submitted successfully (Simulation mode).` });
  };

  const handleFinishAssessment = () => {
    if (window.confirm('Are you sure you want to finish and submit your assessment session?')) {
      navigate('/student/dashboard');
    }
  };

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
            Exit to Dashboard
          </button>
          <div className="h-6 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">CoreCode Assessment Workspace</h1>
              <p className="text-[11px] text-gray-400 font-mono">Session ID: {assessmentId?.slice(0, 16) || 'ACTIVE'}</p>
            </div>
          </div>
        </div>

        {/* Level Info & Countdown Timer */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Level Session Active
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-sm">
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
            <button
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 1
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Question 1 (50 Marks)
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 2
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Question 2 (50 Marks)
            </button>
          </div>

          {/* Problem Statement Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {currentQuestion.id} • Max Marks: 50
              </span>
              <h2 className="text-xl font-extrabold text-white mt-3">{currentQuestion.title}</h2>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Problem Statement</h3>
              <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                {currentQuestion.statement}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sample Input</h4>
                <pre className="p-3 rounded-lg bg-gray-950 border border-gray-800 font-mono text-xs text-indigo-300">
                  {currentQuestion.sampleInput}
                </pre>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sample Output</h4>
                <pre className="p-3 rounded-lg bg-gray-950 border border-gray-800 font-mono text-xs text-emerald-300">
                  {currentQuestion.sampleOutput}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Monaco Code Editor & Terminal Panel */}
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

          {/* Terminal / Test Output Area */}
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

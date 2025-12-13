import React, { useState, useEffect } from 'react';
import { generateAptitudeTest } from '../services/geminiService';
import { TestConfig, TestQuestion, TestResult, MockTestSubmission, QuestionDetail, UserProfile } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

// --- Components ---

const TestSetup: React.FC<{ onStart: (config: TestConfig) => void }> = ({ onStart }) => {
  const [mode, setMode] = useState<'Practice' | 'FullMock' | 'Company'>('Practice');
  const [topic, setTopic] = useState('General');
  const [count, setCount] = useState(10);

  const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture'];

  const handleStart = () => {
    onStart({
      mode,
      topic: mode === 'Company' ? `Aptitude questions asked in ${topic}` : topic,
      questionCount: count,
      timeLimit: count * 1.5 // 1.5 mins per question
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 animate-fade-in-up">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <span className="mr-2">⚙️</span> Configure Test
        </h2>
        <p className="text-slate-400 mb-8">Select your preference to generate an AI-powered aptitude test.</p>
        
        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { id: 'Practice', label: 'Quick Practice', icon: '⚡' },
            { id: 'FullMock', label: 'Full Mock Test', icon: '📝' },
            { id: 'Company', label: 'Company Specific', icon: '🏢' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all duration-300 ${
                mode === m.id 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="font-semibold text-sm">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50">
          {mode === 'Company' ? (
             <div>
               <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Target Company</label>
               <select 
                 value={topic} 
                 onChange={(e) => setTopic(e.target.value)}
                 className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
               >
                 {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
          ) : (
            <div>
              <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Focus Topic</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              >
                <option value="General">Mixed (Quant + Logical)</option>
                <option value="Quantitative">Quantitative Aptitude</option>
                <option value="Logical">Logical Reasoning</option>
                <option value="Data Interpretation">Data Interpretation</option>
              </select>
            </div>
          )}

          <div>
             <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Number of Questions</label>
             <div className="flex space-x-3">
               {[5, 10, 20, 30].map(n => (
                 <button
                   key={n}
                   onClick={() => setCount(n)}
                   className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                     count === n 
                       ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                       : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   {n} Qs
                 </button>
               ))}
             </div>
          </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] hover:-translate-y-0.5"
        >
          Generate Test & Start
        </button>
      </div>
    </div>
  );
};

const TestRunner: React.FC<{ 
  questions: TestQuestion[]; 
  config: TestConfig; 
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}> = ({ questions, config, onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (idx: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: idx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const details = questions.map(q => {
      const userAns = answers[q.id];
      const isUnattempted = userAns === undefined;
      const isCorrect = userAns === q.correctIndex;
      
      if (isUnattempted) unattempted++;
      else if (isCorrect) correct++;
      else wrong++;

      return {
        questionId: q.id,
        userAnswerIndex: isUnattempted ? null : userAns,
        correctIndex: q.correctIndex,
        isCorrect
      };
    });

    onComplete({
      score: correct * 1, 
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      unattemptedCount: unattempted,
      timeTaken: (config.timeLimit * 60) - timeLeft,
      details
    });
  };

  const currentQ = questions[currentIndex];
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 min-h-[80vh] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-xl backdrop-blur border border-slate-700 shadow-lg sticky top-0 z-20">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Question</span>
          <div className="text-xl font-bold text-white leading-none mt-1">{currentIndex + 1} <span className="text-slate-500 text-sm font-normal">/ {questions.length}</span></div>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <button onClick={handleSubmit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
          Submit Test
        </button>
      </div>

      {/* Question Card */}
      <div className="flex-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 lg:p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          
          <div className="flex justify-between mb-4">
             <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${
               currentQ.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
               currentQ.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
               'bg-red-500/10 text-red-400 border-red-500/20'
             }`}>{currentQ.difficulty}</span>
             <span className="text-xs text-slate-500 font-bold uppercase">{currentQ.category}</span>
          </div>
          
          <p className="text-xl text-slate-200 leading-relaxed font-medium mb-8">
            {currentQ.question}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center group ${
                  answers[currentQ.id] === idx
                    ? 'bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                  answers[currentQ.id] === idx ? 'border-blue-500 bg-blue-500 scale-110' : 'border-slate-600 group-hover:border-slate-400'
                }`}>
                  {answers[currentQ.id] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800 font-medium transition-all"
        >
          Previous
        </button>
        <div className="flex space-x-1.5 overflow-x-auto max-w-[50%] scrollbar-hide px-2">
          {questions.map((_, i) => (
             <div key={i} className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
               i === currentIndex ? 'bg-blue-500 scale-125' : answers[questions[i].id] !== undefined ? 'bg-emerald-500/50' : 'bg-slate-700'
             }`}></div>
          ))}
        </div>
        <button 
          onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
          disabled={currentIndex === questions.length - 1}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800 font-medium transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// --- New Components for Firebase History ---

const TestHistoryCard: React.FC<{ test: MockTestSubmission; onClick: () => void }> = ({ test, onClick }) => {
  const date = test.dateTaken?.toDate ? test.dateTaken.toDate() : new Date(test.dateTaken);
  
  return (
    <div 
      onClick={onClick}
      className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 rounded-2xl p-5 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{test.testName}</h3>
           <p className="text-slate-500 text-xs mt-1">{date.toLocaleDateString()} • {date.toLocaleTimeString()}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${
          test.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          test.percentage >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
          'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {test.percentage}% Score
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {test.correctAnswers} Correct
         </div>
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-red-500"></span> {test.wrongAnswers} Wrong
         </div>
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-slate-500"></span> {test.timeTaken ? Math.round(test.timeTaken / 60) : 0} min
         </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden flex">
         <div style={{ width: `${(test.correctAnswers / test.totalQuestions) * 100}%` }} className="h-full bg-emerald-500"></div>
         <div style={{ width: `${(test.wrongAnswers / test.totalQuestions) * 100}%` }} className="h-full bg-red-500"></div>
      </div>
    </div>
  );
};

const HistoryDetailView: React.FC<{ test: MockTestSubmission; onBack: () => void }> = ({ test, onBack }) => {
  const percentage = test.percentage;

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in-up">
      <button onClick={onBack} className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-lg">
         <span>← Back to History</span>
      </button>

      {/* Summary Header */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 mb-8 backdrop-blur shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl select-none rotate-12">📝</div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
           <div>
             <h1 className="text-3xl font-bold text-white mb-2">{test.testName}</h1>
             <p className="text-slate-400 text-sm">Completed on {new Date(test.dateTaken?.toDate ? test.dateTaken.toDate() : test.dateTaken).toLocaleString()}</p>
           </div>
           
           <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <div className="text-2xl font-bold text-white">{test.score}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Score</div>
              </div>
              <div className="text-center px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                <div className={`text-2xl font-bold ${percentage >= 80 ? 'text-emerald-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {percentage}%
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Accuracy</div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center">
           <span className="text-2xl font-bold text-emerald-400">{test.correctAnswers}</span>
           <span className="text-xs text-emerald-500/70 uppercase font-bold mt-1">Correct</span>
        </div>
        <div className="bg-red-900/10 border border-red-500/20 p-5 rounded-2xl flex flex-col items-center">
           <span className="text-2xl font-bold text-red-400">{test.wrongAnswers}</span>
           <span className="text-xs text-red-500/70 uppercase font-bold mt-1">Wrong</span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col items-center">
           <span className="text-2xl font-bold text-slate-300">{test.skipped}</span>
           <span className="text-xs text-slate-500 uppercase font-bold mt-1">Skipped</span>
        </div>
      </div>

      {/* Question List */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span>📋</span> Detailed Review
      </h2>
      <div className="space-y-6">
        {test.questionDetails.map((q, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border transition-all ${
             q.isCorrect ? 'bg-emerald-900/5 border-emerald-500/20' : 'bg-red-900/5 border-red-500/20'
          }`}>
             <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-slate-400">Q{idx + 1}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                         q.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>{q.isCorrect ? 'Correct' : 'Incorrect'}</span>
                   </div>
                   <p className="text-lg text-slate-200 font-medium">{q.questionText}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl border text-sm ${
                   q.isCorrect 
                     ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' 
                     : 'bg-red-500/10 border-red-500/30 text-red-100'
                }`}>
                   <span className="opacity-60 block text-xs uppercase font-bold mb-1">Your Answer</span>
                   {q.selectedOption || <span className="italic opacity-50">Skipped</span>}
                </div>
                {!q.isCorrect && (
                   <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-100 text-sm">
                      <span className="opacity-60 block text-xs uppercase font-bold mb-1">Correct Answer</span>
                      {q.correctOption}
                   </div>
                )}
             </div>

             {q.explanation && (
                <div className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-300 border border-slate-700/50 mt-4">
                   <strong className="text-blue-400 block mb-1 text-xs uppercase">Explanation</strong>
                   {q.explanation}
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modified Main Component ---

const AptitudeTest: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const [view, setView] = useState<'NEW' | 'HISTORY' | 'RUNNING' | 'RESULT_SUMMARY' | 'HISTORY_DETAIL'>('NEW');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [currentResult, setCurrentResult] = useState<MockTestSubmission | null>(null);
  const [historyList, setHistoryList] = useState<MockTestSubmission[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<MockTestSubmission | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      if (view === 'HISTORY' && user) {
        setLoading(true);
        try {
          // v9 Query Syntax - Removing orderBy to avoid index requirement
          // We will sort client-side instead
          const q = query(
             collection(db, "mock_test"), 
             where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockTestSubmission));
          
          // Client-side sorting
          data.sort((a, b) => {
             const timeA = a.dateTaken?.toMillis ? a.dateTaken.toMillis() : new Date(a.dateTaken).getTime();
             const timeB = b.dateTaken?.toMillis ? b.dateTaken.toMillis() : new Date(b.dateTaken).getTime();
             return timeB - timeA;
          });

          setHistoryList(data);
        } catch (error) {
          console.error("Error fetching history:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchHistory();
  }, [view, user]);

  const startTest = async (cfg: TestConfig) => {
    setConfig(cfg);
    setLoading(true);
    const qs = await generateAptitudeTest(cfg.topic || 'General', cfg.questionCount, 'Medium');
    setQuestions(qs);
    setLoading(false);
    setView('RUNNING');
  };

  const finishTest = async (res: TestResult) => {
    if (!config || !user) return;
    setLoading(true);

    const percentage = Math.round((res.correctCount / res.totalQuestions) * 100);
    
    // Transform to Firestore format
    const submission: MockTestSubmission = {
      userId: user.uid,
      testName: config.topic,
      score: res.score,
      totalQuestions: res.totalQuestions,
      correctAnswers: res.correctCount,
      wrongAnswers: res.wrongCount,
      skipped: res.unattemptedCount,
      percentage: percentage,
      timeTaken: res.timeTaken,
      dateTaken: Timestamp.now(),
      questionDetails: res.details.map(d => {
        const q = questions.find(qu => qu.id === d.questionId);
        return {
          questionId: d.questionId,
          questionText: q?.question || "Unknown Question",
          options: q?.options || [],
          selectedOption: d.userAnswerIndex !== null && q ? q.options[d.userAnswerIndex] : null,
          correctOption: q ? q.options[d.correctIndex] : "Unknown",
          explanation: q?.explanation || "No explanation provided.",
          isCorrect: d.isCorrect
        };
      })
    };

    try {
      // Save to Firebase (v9 addDoc)
      await addDoc(collection(db, "mock_test"), submission);
      setCurrentResult(submission);
      setView('RESULT_SUMMARY');
    } catch (e) {
      console.error("Error saving test:", e);
      alert("Test finished but failed to save to history.");
      setCurrentResult(submission); // Show result anyway
      setView('RESULT_SUMMARY');
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 animate-pulse font-medium">Processing...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Top Header & Tabs (Only visible if not inside a running test) */}
      {view !== 'RUNNING' && view !== 'RESULT_SUMMARY' && view !== 'HISTORY_DETAIL' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Mock Test Engine</h2>
            <p className="text-slate-400">Generate unlimited AI aptitude tests or review your performance history.</p>
          </div>
          
          <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700 inline-flex">
            <button
              onClick={() => setView('NEW')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                view === 'NEW' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Start New Test
            </button>
            <button
              onClick={() => setView('HISTORY')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                view === 'HISTORY' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Past Attempts
            </button>
          </div>
        </div>
      )}

      {/* VIEW: New Test Setup */}
      {view === 'NEW' && <TestSetup onStart={startTest} />}

      {/* VIEW: Running Test */}
      {view === 'RUNNING' && config && (
        <TestRunner 
          questions={questions} 
          config={config} 
          onComplete={finishTest} 
          onCancel={() => setView('NEW')} 
        />
      )}

      {/* VIEW: Immediate Result Summary */}
      {view === 'RESULT_SUMMARY' && currentResult && (
        <div className="animate-fade-in-up">
           <HistoryDetailView 
             test={currentResult} 
             onBack={() => { setCurrentResult(null); setView('NEW'); }} 
           />
        </div>
      )}

      {/* VIEW: History List */}
      {view === 'HISTORY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
           {historyList.length > 0 ? (
             historyList.map(test => (
               <TestHistoryCard 
                 key={test.id} 
                 test={test} 
                 onClick={() => { setSelectedHistoryItem(test); setView('HISTORY_DETAIL'); }} 
               />
             ))
           ) : (
             <div className="col-span-full text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                <div className="text-6xl mb-4 opacity-50">📉</div>
                <h3 className="text-xl font-bold text-white mb-2">No Tests Taken Yet</h3>
                <p className="text-slate-500 mb-6">Start your first mock test to see analytics here.</p>
                <button onClick={() => setView('NEW')} className="text-blue-400 font-bold hover:underline">Start a Test Now</button>
             </div>
           )}
        </div>
      )}

      {/* VIEW: History Detail */}
      {view === 'HISTORY_DETAIL' && selectedHistoryItem && (
        <HistoryDetailView 
          test={selectedHistoryItem} 
          onBack={() => { setSelectedHistoryItem(null); setView('HISTORY'); }} 
        />
      )}

    </div>
  );
};

export default AptitudeTest;
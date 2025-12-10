import React, { useState, useEffect } from 'react';
import { generateAptitudeTest } from '../services/geminiService';
import { TestConfig, TestQuestion, TestResult } from '../types';

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
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Test Generator Engine</h2>
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
        
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
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                mode === m.id 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="font-semibold">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-6">
          {mode === 'Company' ? (
             <div>
               <label className="block text-slate-400 text-sm mb-2 font-medium">Target Company</label>
               <select 
                 value={topic} 
                 onChange={(e) => setTopic(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
               >
                 {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
          ) : (
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Focus Topic</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
              >
                <option value="General">Mixed (Quant + Logical)</option>
                <option value="Quantitative">Quantitative Aptitude</option>
                <option value="Logical">Logical Reasoning</option>
                <option value="Data Interpretation">Data Interpretation</option>
              </select>
            </div>
          )}

          <div>
             <label className="block text-slate-400 text-sm mb-2 font-medium">Number of Questions</label>
             <div className="flex space-x-4">
               {[5, 10, 20, 30].map(n => (
                 <button
                   key={n}
                   onClick={() => setCount(n)}
                   className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                     count === n ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
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
          className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
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
      score: correct * 1, // 1 mark per question
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
    <div className="max-w-4xl mx-auto py-6 px-4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-xl backdrop-blur border border-slate-700">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Question</span>
          <div className="text-xl font-bold text-white">{currentIndex + 1} <span className="text-slate-500 text-sm">/ {questions.length}</span></div>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium">
          Submit Test
        </button>
      </div>

      {/* Question Card */}
      <div className="flex-1">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-6">
          <div className="flex justify-between mb-4">
             <span className={`px-2 py-1 rounded text-xs border ${
               currentQ.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
               currentQ.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
               'bg-red-500/10 text-red-400 border-red-500/20'
             }`}>{currentQ.difficulty}</span>
             <span className="text-xs text-slate-500">{currentQ.category}</span>
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
                    ? 'bg-blue-600/20 border-blue-500 text-blue-100'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                  answers[currentQ.id] === idx ? 'border-blue-500 bg-blue-500' : 'border-slate-600 group-hover:border-slate-500'
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
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
        >
          Previous
        </button>
        <div className="flex space-x-1">
          {questions.map((_, i) => (
             <div key={i} className={`w-2 h-2 rounded-full ${
               i === currentIndex ? 'bg-blue-500' : answers[questions[i].id] !== undefined ? 'bg-emerald-500/50' : 'bg-slate-700'
             }`}></div>
          ))}
        </div>
        <button 
          onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
          disabled={currentIndex === questions.length - 1}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-30 hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const TestResultView: React.FC<{ 
  result: TestResult; 
  questions: TestQuestion[]; 
  onRetry: () => void;
}> = ({ result, questions, onRetry }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const percentage = Math.round((result.correctCount / result.totalQuestions) * 100);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      {!showAnalysis ? (
        <div className="text-center animate-fade-in-up">
          <div className="inline-block p-2 rounded-full bg-slate-800 mb-6 border border-slate-700">
             <span className="text-4xl">
               {percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}
             </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Test Completed!</h2>
          <p className="text-slate-400 mb-10">Here is how you performed</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-white mb-1">{result.score}</div>
              <div className="text-xs text-slate-500 uppercase">Total Score</div>
            </div>
            <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{result.correctCount}</div>
              <div className="text-xs text-emerald-500/70 uppercase">Correct</div>
            </div>
            <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/20">
              <div className="text-3xl font-bold text-red-400 mb-1">{result.wrongCount}</div>
              <div className="text-xs text-red-500/70 uppercase">Wrong</div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="text-3xl font-bold text-slate-400 mb-1">{Math.round(percentage)}%</div>
              <div className="text-xs text-slate-500 uppercase">Accuracy</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setShowAnalysis(true)}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Detailed Analysis
            </button>
            <button 
              onClick={onRetry}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/30"
            >
              Take Another Test
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <button onClick={() => setShowAnalysis(false)} className="mb-6 text-slate-400 hover:text-white flex items-center">
            ← Back to Summary
          </button>
          <h2 className="text-2xl font-bold text-white mb-6">Question Analysis</h2>
          <div className="space-y-6">
            {questions.map((q, i) => {
              const detail = result.details.find(d => d.questionId === q.id);
              const isCorrect = detail?.isCorrect;
              const userAns = detail?.userAnswerIndex;

              return (
                <div key={q.id} className={`p-6 rounded-2xl border ${
                  isCorrect ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'
                }`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-300">Question {i + 1}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>{isCorrect ? 'Correct' : userAns === null ? 'Skipped' : 'Wrong'}</span>
                  </div>
                  <p className="text-slate-200 mb-4">{q.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-3 rounded-lg border text-sm ${
                      isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 'bg-red-500/10 border-red-500/30 text-red-100'
                    }`}>
                      <span className="opacity-70 block text-xs mb-1">Your Answer:</span>
                      {userAns !== null && userAns !== undefined ? q.options[userAns] : 'Not Attempted'}
                    </div>
                    {!isCorrect && (
                      <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-100 text-sm">
                        <span className="opacity-70 block text-xs mb-1">Correct Answer:</span>
                        {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-300 border border-slate-700/50">
                    <strong className="text-blue-400 block mb-1">Explanation & Short Trick:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AptitudeTest: React.FC = () => {
  const [step, setStep] = useState<'SETUP' | 'TEST' | 'RESULT'>('SETUP');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const startTest = async (cfg: TestConfig) => {
    setConfig(cfg);
    setLoading(true);
    // Fetch questions from AI
    const qs = await generateAptitudeTest(cfg.topic || 'General', cfg.questionCount, 'Medium');
    setQuestions(qs);
    setLoading(false);
    setStep('TEST');
  };

  const finishTest = (res: TestResult) => {
    setResult(res);
    setStep('RESULT');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 animate-pulse">Generating your unique test...</p>
        <p className="text-xs text-slate-600 mt-2">Connecting to AI Engine</p>
      </div>
    );
  }

  if (step === 'SETUP') return <TestSetup onStart={startTest} />;
  if (step === 'TEST' && config) return <TestRunner questions={questions} config={config} onComplete={finishTest} onCancel={() => setStep('SETUP')} />;
  if (step === 'RESULT' && result && config) return <TestResultView result={result} questions={questions} onRetry={() => setStep('SETUP')} />;

  return null;
};

export default AptitudeTest;
import React, { useState } from 'react';
import { APTITUDE_PATTERNS } from '../constants';
import { AptitudePattern, AptitudeQuestion } from '../types';
import { generatePracticeQuestions } from '../services/geminiService';

const QuestionCard: React.FC<{ 
  question: AptitudeQuestion; 
  index: number 
}> = ({ question, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer flex justify-between items-start gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-500">Q{index + 1}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
              question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
              question.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {question.difficulty}
            </span>
          </div>
          <h4 className="text-slate-200 font-medium leading-relaxed">{question.question}</h4>
        </div>
        <div className="text-slate-400">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-950/30 border-t border-slate-800/50 p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-emerald-400">Answer:</span>
            <span className="text-sm text-white">{question.answer}</span>
          </div>

          <div className="space-y-4">
            {question.trickUsed && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <span className="text-xs font-bold text-yellow-500 uppercase block mb-1">⚡ Trick Used</span>
                <p className="text-sm text-yellow-100/80">{question.trickUsed}</p>
              </div>
            )}

            <div className="space-y-2">
               <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Step-by-Step Solution</span>
               <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-slate-700">
                 {question.explanation}
               </p>
            </div>

            {question.visualAid && (
               <div className="mt-4 bg-black/20 rounded-lg p-4 border border-white/5">
                 <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Visual Concept</span>
                 <pre className="font-mono text-xs text-emerald-300/80 whitespace-pre overflow-x-auto">
                   {question.visualAid}
                 </pre>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AptitudeCard: React.FC<{ pattern: AptitudePattern; onClick: () => void }> = ({ pattern, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl opacity-20 ${
      pattern.category === 'Quantitative' ? 'bg-orange-500' : 'bg-purple-500'
    }`}></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl ${
          pattern.category === 'Quantitative' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'
        }`}>
          {pattern.category === 'Quantitative' ? '📊' : '🧩'}
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-900/50 text-slate-400 border border-slate-700">
          {pattern.category}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
        {pattern.name}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
        {pattern.description}
      </p>
    </div>
  </div>
);

const AptitudeDetail: React.FC<{ pattern: AptitudePattern; onBack: () => void }> = ({ pattern, onBack }) => {
  const [questions, setQuestions] = useState<AptitudeQuestion[]>(pattern.sampleQuestions);
  const [loadingMore, setLoadingMore] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newQuestions = await generatePracticeQuestions(pattern.name, 5, 'Medium');
    setQuestions(prev => [...prev, ...newQuestions]);
    setLoadingMore(false);
  };

  const filteredQuestions = questions.filter(q => 
    difficultyFilter === 'All' ? true : q.difficulty === difficultyFilter
  );

  return (
    <div className="animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Library</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Topic Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 lg:p-8 backdrop-blur-sm sticky top-6">
            <h1 className="text-3xl font-bold text-white mb-2">{pattern.name}</h1>
             <span className={`inline-block mb-6 text-xs px-3 py-1 rounded-full border ${
               pattern.category === 'Quantitative' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-purple-500/30 text-purple-400 bg-purple-500/10'
            }`}>
              {pattern.category}
            </span>

            <p className="text-slate-300 leading-relaxed mb-6">{pattern.description}</p>
            
            <div className="space-y-4">
               <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                 <h3 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wide">⚡ Tricks & Shortcuts</h3>
                 <ul className="space-y-2 pl-4 list-disc text-slate-300 text-sm">
                   {pattern.tricks.map((trick, i) => <li key={i}>{trick}</li>)}
                 </ul>
               </div>

               <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4">
                 <h3 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wide">🎯 Strategy</h3>
                 <ul className="space-y-2 pl-4 list-disc text-slate-300 text-sm">
                   {pattern.strategy.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>

               {pattern.visualAid && (
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 overflow-hidden">
                  <h3 className="text-slate-400 font-bold text-sm mb-2 uppercase tracking-wide">👁️ Visual Concept</h3>
                  <pre className="font-mono text-[10px] md:text-xs text-emerald-100/90 leading-relaxed whitespace-pre overflow-x-auto">
                    {pattern.visualAid}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Questions (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📚</span> Practice Problems
              <span className="text-sm font-normal text-slate-500 ml-2">({questions.length} loaded)</span>
            </h3>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="bg-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, i) => (
              <QuestionCard key={i} question={q} index={i} />
            ))}
            
            {filteredQuestions.length === 0 && (
              <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No questions found for this difficulty level.
              </div>
            )}
          </div>

          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full mt-8 py-4 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Generating new problems...
              </>
            ) : (
              <>
                <span>✨</span> Load 5 More Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AptitudeLibrary: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<AptitudePattern | null>(null);
  const [filter, setFilter] = useState<'All' | 'Quantitative' | 'Logical'>('All');

  const filteredPatterns = APTITUDE_PATTERNS.filter(p => 
    filter === 'All' ? true : p.category === filter
  );

  if (selectedPattern) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
        <AptitudeDetail pattern={selectedPattern} onBack={() => setSelectedPattern(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Aptitude & Logic</h2>
          <p className="text-slate-400">Master Quant shortcuts and Logical reasoning patterns.</p>
        </div>
        
        <div className="flex space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          {(['All', 'Quantitative', 'Logical'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.map(pattern => (
          <AptitudeCard 
            key={pattern.id} 
            pattern={pattern} 
            onClick={() => setSelectedPattern(pattern)} 
          />
        ))}
      </div>
    </div>
  );
};

export default AptitudeLibrary;
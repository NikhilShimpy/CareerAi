import React, { useState } from 'react';
import { DSA_PATTERNS } from '../constants';
import { Pattern } from '../types';
import { generateDSAProblems } from '../services/geminiService';

interface PatternLibraryProps {
  selectedPattern: Pattern | null;
  onSelectPattern: (pattern: Pattern | null) => void;
}

const PatternCard: React.FC<{ pattern: Pattern; onClick: () => void }> = ({ pattern, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
    <div className="flex items-center space-x-3 mb-4">
      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">
        🧩
      </div>
      <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
        {pattern.name}
      </h3>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
      {pattern.description}
    </p>
    <div className="flex flex-wrap gap-2">
      {pattern.whenToUse.slice(0, 2).map((tag, idx) => (
        <span key={idx} className="text-xs px-2 py-1 rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const PatternDetail: React.FC<{ pattern: Pattern; onBack: () => void }> = ({ pattern, onBack }) => {
  const [activeTab, setActiveTab] = useState<'LeetCode' | 'GFG' | 'HackerRank' | 'CodeChef'>('LeetCode');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [dynamicProblems, setDynamicProblems] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false); // For mobile collapsing

  const platforms = ['LeetCode', 'GFG', 'HackerRank', 'CodeChef'] as const;

  // Merge static constants with dynamically fetched problems
  const allProblems = [...pattern.examples, ...dynamicProblems];
  
  const filteredProblems = allProblems.filter(ex => 
    ex.platform === activeTab && 
    (difficultyFilter === 'All' || ex.difficulty === difficultyFilter)
  );

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newProblems = await generateDSAProblems(pattern.name, activeTab, 5);
    // Standardize structure and merge
    const formatted = newProblems.map(p => ({
      ...p,
      platform: activeTab
    }));
    setDynamicProblems(prev => [...prev, ...formatted]);
    setLoadingMore(false);
  };

  return (
    <div className="animate-fade-in-up pb-20">
      {/* Sticky Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-900/90 backdrop-blur z-30 py-4 border-b border-slate-800">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
        <h2 className="text-xl font-bold text-white hidden md:block">{pattern.name}</h2>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT COLUMN: Problem List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls: Platform Tabs & Filter */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6 backdrop-blur-sm sticky top-24 z-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <span className="mr-2">📚</span> Problem Set
              </h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Difficulty:</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as any)}
                  className="bg-slate-900 text-slate-300 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="flex space-x-2 bg-slate-900/50 p-1.5 rounded-xl overflow-x-auto scrollbar-hide">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setActiveTab(platform)}
                  className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === platform 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Problems List */}
          <div className="space-y-4">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((ex, i) => (
                <div 
                  key={i} 
                  className="group bg-slate-900/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 p-5 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${
                        ex.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        ex.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {ex.difficulty || 'Medium'}
                      </span>
                      <span className="text-xs text-slate-500">{activeTab}</span>
                    </div>
                    <h4 className="text-base font-semibold text-slate-200 group-hover:text-blue-200 leading-snug">
                      {ex.name}
                    </h4>
                  </div>
                  
                  {/* Solve Button: Handles static (#) links by searching, and dynamic links directly */}
                  <a 
                    href={ex.url && ex.url !== '#' ? ex.url : `https://google.com/search?q=${encodeURIComponent(ex.name + ' ' + activeTab + ' problem')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-600/30 hover:border-blue-600 transition-all font-medium text-sm w-full md:w-auto shadow-sm hover:shadow-blue-500/20"
                  >
                    <span>Solve</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <p className="mb-2 text-xl">🔍</p>
                <p>No problems found in this category.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full py-4 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 group"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching from {activeTab}...</span>
              </>
            ) : (
              <>
                <span className="group-hover:scale-110 transition-transform">✨</span>
                <span>Load More Problems</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Sticky Info Panel (4 cols) */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex justify-end mb-2">
              <button 
                onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                className="text-xs text-blue-400 font-medium bg-slate-800 px-3 py-1 rounded-full border border-blue-500/30"
              >
                {isDetailsCollapsed ? 'Show Pattern Details' : 'Hide Pattern Details'}
              </button>
            </div>

            <div className={`space-y-6 transition-all ${isDetailsCollapsed ? 'hidden lg:block' : 'block'}`}>
              
              {/* Pattern Info Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 backdrop-blur shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl select-none">🧩</div>
                <div className="relative z-10">
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Pattern Insight</h3>
                  <h2 className="text-2xl font-bold text-white mb-4">{pattern.name}</h2>
                  <p className="text-slate-300 leading-relaxed text-sm mb-6 border-b border-slate-700/50 pb-6">
                    {pattern.description}
                  </p>
                  
                  <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                    <h4 className="text-blue-400 font-bold text-sm mb-1">💡 Core Intuition</h4>
                    <p className="text-blue-100/80 text-sm leading-relaxed">{pattern.coreIntuition}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-sm">When to use:</h4>
                    {pattern.whenToUse.map((item, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Aid Card */}
              {pattern.visualAid && (
                <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-5 shadow-inner">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                    <span className="mr-2">👁️</span> Visual Concept
                  </h3>
                  <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 overflow-x-auto custom-scrollbar">
                    <pre className="font-mono text-[11px] md:text-xs text-emerald-400/90 leading-relaxed whitespace-pre">
                      {pattern.visualAid}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const PatternLibrary: React.FC<PatternLibraryProps> = ({ selectedPattern, onSelectPattern }) => {
  const [search, setSearch] = useState('');

  const filteredPatterns = DSA_PATTERNS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPattern) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen">
        <PatternDetail pattern={selectedPattern} onBack={() => onSelectPattern(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Pattern Library</h2>
          <p className="text-slate-400">Master these {DSA_PATTERNS.length} patterns to crack any coding interview.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search patterns..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <svg className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.map(pattern => (
          <PatternCard 
            key={pattern.id} 
            pattern={pattern} 
            onClick={() => onSelectPattern(pattern)} 
          />
        ))}
        {filteredPatterns.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-500 text-lg">No patterns found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternLibrary;
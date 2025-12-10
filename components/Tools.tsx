import React, { useState } from 'react';
import { analyzeToolRequest } from '../services/geminiService';
import { ToolResult } from '../types';

const TOOLS = [
  { id: 'complexity', name: 'Time Complexity Calculator', icon: '⏱️', desc: 'Paste code to get Big O analysis.' },
  { id: 'pattern', name: 'Pattern Predictor', icon: '🔮', desc: 'Paste a problem description to guess the pattern.' },
  { id: 'dryrun', name: 'Dry Run Visualizer', icon: '👣', desc: 'Trace code execution step-by-step.' },
  { id: 'translator', name: 'Code Translator', icon: '🔄', desc: 'Convert code from one language to another.' },
];

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const output = await analyzeToolRequest(activeTool.name, input);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto min-h-screen">
      <h2 className="text-3xl font-bold text-white mb-8">Power Tools</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tool Selector */}
        <div className="space-y-3">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool); setResult(null); setInput(''); }}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                activeTool.id === tool.id 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' 
                  : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <div className="font-semibold">{tool.name}</div>
                  <div className="text-xs opacity-70 mt-1">{tool.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              Input for {activeTool.name}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none resize-none"
              placeholder="Paste code or problem description here..."
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </div>

          {/* Result Output */}
          {result && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-emerald-400">Analysis Result</h3>
                <button 
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Copy
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none font-mono bg-black/20 p-4 rounded-xl border border-white/5">
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tools;

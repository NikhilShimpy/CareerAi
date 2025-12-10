import React from 'react';
import { GUIDE_STEPS } from '../constants';

const Guide: React.FC<{ onPickRandom: () => void }> = ({ onPickRandom }) => {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          How to Tackle Any DSA Problem
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Don't memorize solutions. Follow this 7-step framework to break down any unseen problem systematically.
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden lg:block"></div>

        <div className="space-y-12">
          {GUIDE_STEPS.map((step, index) => (
            <div key={index} className={`relative flex items-center lg:justify-between ${index % 2 === 0 ? 'flex-row' : 'lg:flex-row-reverse'}`}>
              
              {/* Timeline Node */}
              <div className="absolute left-4 lg:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-4 border-blue-500 flex items-center justify-center z-10 hidden lg:flex">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>

              {/* Content Card */}
              <div className={`w-full lg:w-[45%] pl-12 lg:pl-0 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                <div className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-blue-300 mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.content}
                  </p>
                </div>
              </div>

              {/* Spacer for mobile alignment */}
              <div className="hidden lg:block w-[45%]"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/20 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Practice?</h3>
        <p className="text-slate-400 mb-8">Apply this framework to a random problem from our library.</p>
        <button 
          onClick={onPickRandom}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/30"
        >
          Pick a Random Problem
        </button>
      </div>
    </div>
  );
};

export default Guide;
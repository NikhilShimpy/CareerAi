import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "**AI Problem Solver Ready**\n\nPaste any LeetCode/GFG problem statement. I will provide:\n1. Pattern Detection\n2. Visual Logic\n3. Optimal Code (4 Languages)\n4. Time Complexity Analysis",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const responseText = await generateResponse(input, history);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Improved renderer for mixing text and code blocks
  const renderMessageContent = (content: string) => {
    // Split by code block delimiters
    const parts = content.split(/```/);
    
    return parts.map((part, index) => {
      // Odd indices are code blocks (inside ```...```)
      if (index % 2 === 1) {
        const firstLineBreak = part.indexOf('\n');
        const language = firstLineBreak > -1 ? part.slice(0, firstLineBreak).trim() : 'text';
        const code = firstLineBreak > -1 ? part.slice(firstLineBreak + 1) : part;
        
        return (
          <div key={index} className="my-4 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/50 shadow-inner group">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
               <span className="text-xs font-mono text-blue-400 lowercase">{language || 'code'}</span>
               <button 
                 className="text-xs text-slate-500 hover:text-white transition-colors"
                 onClick={() => navigator.clipboard.writeText(code)}
               >
                 Copy
               </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed scrollbar-thin">
              {code.trim()}
            </pre>
          </div>
        );
      } else {
        // Even indices are regular text (markdown-ish)
        return (
          <div key={index} className="prose prose-invert prose-sm max-w-none text-slate-200">
            {part.split('\n').map((line, i) => {
               const trimmed = line.trim();
               if (!trimmed) return <div key={i} className="h-2"></div>;
               
               // Headers
               if (trimmed.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-white pb-2 border-b border-slate-700/50">{trimmed.replace('# ', '')}</h1>;
               if (trimmed.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-2 text-blue-300 flex items-center"><span className="w-1.5 h-6 bg-blue-500 rounded mr-2 inline-block"></span>{trimmed.replace('## ', '')}</h2>;
               if (trimmed.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-emerald-300">{trimmed.replace('### ', '')}</h3>;
               
               // Lists
               if (trimmed.match(/^(\d+\.|-|\*)\s/)) {
                  // Basic Bold parsing for list items
                  const listContent = trimmed.replace(/^(\d+\.|-|\*)\s/, '');
                  const boldParts = listContent.split(/(\*\*.*?\*\*)/g);
                  
                  return (
                    <div key={i} className="ml-4 mb-2 flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">{trimmed.startsWith('-') || trimmed.startsWith('*') ? '•' : trimmed.split(' ')[0]}</span>
                      <span className="leading-relaxed">
                        {boldParts.map((p, j) => 
                          p.startsWith('**') ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong> : p
                        )}
                      </span>
                    </div>
                  );
               }

               // Regular paragraphs with bold parsing
               const boldParts = line.split(/(\*\*.*?\*\*)/g);
               return (
                 <p key={i} className="mb-2 leading-relaxed">
                   {boldParts.map((p, j) => 
                      p.startsWith('**') ? <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong> : p
                   )}
                 </p>
               );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] lg:h-screen max-w-5xl mx-auto px-0 lg:px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between px-4 lg:px-0">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">AI Problem Solver</h2>
          <p className="text-slate-400 text-sm">Strict 12-Section Format Active</p>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-slate-500 hover:text-white transition-colors border border-slate-700 rounded-md px-3 py-1 hover:bg-slate-800"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin px-4 lg:px-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] lg:max-w-[90%] rounded-2xl p-4 lg:p-8 shadow-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 border border-slate-700/50 text-slate-200 rounded-bl-none backdrop-blur-md'
              }`}
            >
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-800/80 rounded-2xl p-4 rounded-bl-none flex items-center space-x-2">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/50 p-2 lg:p-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your problem here..."
            className="w-full bg-slate-800 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 resize-none shadow-lg h-24 lg:h-28 text-base"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-2">
          Language Mirroring Active • 4-Language Code Gen
        </p>
      </div>
    </div>
  );
};

export default Chatbot;

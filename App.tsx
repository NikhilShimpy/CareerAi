import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from './services/firebase';
import { AppView, Pattern, UserProfile } from './types';
import { DSA_PATTERNS } from './constants';

// Components
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import PatternLibrary from './components/PatternLibrary';
import AptitudeLibrary from './components/AptitudeLibrary';
import AptitudeTest from './components/AptitudeTest';
import Guide from './components/Guide';
import Tools from './components/Tools';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import JobSearch from './components/JobSearch';
import DevelopedBy from './components/DevelopedBy';
import Login from './components/Login';
import AvatarSelection from './components/AvatarSelection';
import Profile from './components/Profile';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'avatar' | 'app'>('login');

  // App State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  // Check Auth Status on Load with Real-time Firestore Listener
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        if (!firebaseUser.emailVerified && firebaseUser.providerData[0].providerId === 'password') {
           // If email not verified for email/pass users
           setUser(null);
           setAuthView('login');
           setLoading(false);
           return;
        }

        // Set up real-time listener for the user's document using Modular Syntax
        unsubscribeFirestore = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              profileImage: userData.profileImage,
              authProvider: userData.authProvider,
              createdAt: userData.createdAt?.toDate().toISOString(),
              lastLogin: userData.lastLogin?.toDate().toISOString()
            });
            
            if (!userData.profileImage) {
              setAuthView('avatar');
            } else {
              setAuthView('app');
            }
          } else {
            // Document might not exist yet if just created, handled in Login logic
            if (!loading) setAuthView('login');
          }
          setLoading(false);
        }, (error) => {
           console.error("Firestore Listener Error:", error);
           setLoading(false);
        });

      } else {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        setUser(null);
        setAuthView('login');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const handleLoginSuccess = (isNewUser: boolean) => {
    // Auth observer will handle the state update, but for UX smoothness:
    if (isNewUser) {
      setAuthView('avatar');
    }
    // Else it will auto switch to 'app' via the useEffect
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthView('login');
    setCurrentView('home');
  };

  const handleAvatarComplete = () => {
    // Real-time listener will catch the update and switch view
  };

  const handleRandomProblem = () => {
    const randomPattern = DSA_PATTERNS[Math.floor(Math.random() * DSA_PATTERNS.length)];
    setSelectedPattern(randomPattern);
    setCurrentView('patterns');
  };

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return user ? <Profile user={user} onLogout={handleLogout} /> : null;
      case 'interview-prep':
        return <Chatbot />;
      case 'patterns':
        return <PatternLibrary selectedPattern={selectedPattern} onSelectPattern={setSelectedPattern} />;
      case 'aptitude':
        return <AptitudeLibrary />;
      case 'mock-test':
        return <AptitudeTest user={user} />;
      case 'guide':
        return <Guide onPickRandom={handleRandomProblem} />;
      case 'tools':
        return <Tools />;
      case 'resume-analyzer':
        return <ResumeAnalyzer />;
      case 'job-search':
        return <JobSearch />;
      case 'developed-by':
        return <DevelopedBy />;
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center min-h-[90vh] text-center p-6 animate-fade-in max-w-6xl mx-auto justify-center">
            <div className="mt-8 mb-8 relative">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative text-8xl">🚀</div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Optimize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Career</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
              The ultimate AI-powered career platform. Master DSA patterns, analyze resumes, beat ATS systems, and crack interviews.
            </p>
            
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <button 
                onClick={() => setCurrentView('patterns')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>🧩</span>
                <span>Learn Patterns</span>
              </button>
              <button 
                onClick={() => setCurrentView('resume-analyzer')}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>📄</span>
                <span>Check Resume</span>
              </button>
            </div>

            {/* Feature Sections */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              
              {/* Card 1: DSA */}
              <div 
                onClick={() => setCurrentView('patterns')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
                <h3 className="text-xl font-bold text-white mb-2">DSA Mastery</h3>
                <p className="text-slate-400 text-sm mb-4">Master Sliding Window, Two Pointers, and 15+ patterns with visuals.</p>
                <span className="text-blue-400 text-sm font-medium">Start Learning →</span>
              </div>

              {/* Card 2: Resume */}
              <div 
                onClick={() => setCurrentView('resume-analyzer')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">ATS Resume Scoring</h3>
                <p className="text-slate-400 text-sm mb-4">Get a detailed audit of your resume and fix missing keywords.</p>
                <span className="text-emerald-400 text-sm font-medium">Check Score →</span>
              </div>

              {/* Card 3: Interview */}
              <div 
                onClick={() => setCurrentView('interview-prep')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Coach</h3>
                <p className="text-slate-400 text-sm mb-4">Practice HR and Technical rounds with an AI that mirrors your language.</p>
                <span className="text-purple-400 text-sm font-medium">Start Mock Interview →</span>
              </div>

               {/* Card 4: Jobs */}
               <div 
                onClick={() => setCurrentView('job-search')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-orange-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">Job Search</h3>
                <p className="text-slate-400 text-sm mb-4">Aggregated search from LinkedIn, Naukri, and Indeed.</p>
                <span className="text-orange-400 text-sm font-medium">Find Jobs →</span>
              </div>

               {/* Card 5: Aptitude */}
               <div 
                onClick={() => setCurrentView('aptitude')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-pink-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Aptitude & Logic</h3>
                <p className="text-slate-400 text-sm mb-4">Quant tricks and logical reasoning for placement tests.</p>
                <span className="text-pink-400 text-sm font-medium">Practice Now →</span>
              </div>

               {/* Card 6: Test Engine */}
               <div 
                onClick={() => setCurrentView('mock-test')}
                className="group bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">Mock Test Engine</h3>
                <p className="text-slate-400 text-sm mb-4">Generate and attempt full-length mock tests for specific companies.</p>
                <span className="text-indigo-400 text-sm font-medium">Take Test →</span>
              </div>

            </div>
            
            <div className="mt-20 opacity-50 text-xs text-slate-500">
              Powered by Google Gemini 2.5 Flash • Built for Job Seekers
            </div>
          </div>
        );
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Login View
  if (authView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Avatar Selection View
  if (authView === 'avatar' && user) {
    return <AvatarSelection userId={user.uid} onComplete={handleAvatarComplete} />;
  }

  // 4. Main App Layout (Protected)
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200 font-inter">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:ml-0 relative overflow-x-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
          <div className="font-bold text-white flex items-center space-x-2">
            <span className="text-xl">🚀</span>
            <span>Career AI</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* View Content */}
        <div className="flex-1">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
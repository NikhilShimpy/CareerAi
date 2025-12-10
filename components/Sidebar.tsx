import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const NavItem = ({ 
  view, 
  label, 
  icon, 
  active, 
  collapsed,
  onClick 
}: { 
  view: AppView; 
  label: string; 
  icon: React.ReactNode; 
  active: boolean; 
  collapsed: boolean;
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 w-full mb-1 ${
      active 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <span className="text-xl shrink-0">{icon}</span>
    {!collapsed && (
      <span className="font-medium tracking-wide truncate transition-opacity duration-300">{label}</span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isMobileMenuOpen, toggleMobileMenu, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState === 'closed') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarState', newState ? 'closed' : 'open');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className="h-full flex flex-col p-4 lg:p-6 relative">
          
          {/* Collapse Toggle (Desktop) */}
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 shadow-lg"
          >
            <svg className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-8 px-2 transition-all duration-300`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Career AI
                </h1>
                <p className="text-xs text-slate-500 font-mono">Mastery Suite</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin overflow-x-hidden">
            <NavItem 
              view="home" 
              label="Home" 
              icon="🏠" 
              collapsed={isCollapsed}
              active={currentView === 'home'} 
              onClick={() => { onChangeView('home'); toggleMobileMenu(); }} 
            />
            
            {!isCollapsed && <div className="my-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider animate-fade-in">DSA & Aptitude</div>}
            {isCollapsed && <div className="my-2 border-t border-slate-800 mx-2"></div>}
            
            <NavItem 
              view="patterns" 
              label="Pattern Library" 
              icon="🧩" 
              collapsed={isCollapsed}
              active={currentView === 'patterns'} 
              onClick={() => { onChangeView('patterns'); toggleMobileMenu(); }} 
            />
            <NavItem 
              view="aptitude" 
              label="Aptitude & Logic" 
              icon="📊" 
              collapsed={isCollapsed}
              active={currentView === 'aptitude'} 
              onClick={() => { onChangeView('aptitude'); toggleMobileMenu(); }} 
            />
            <NavItem 
              view="mock-test" 
              label="Mock Test Engine" 
              icon="📝" 
              collapsed={isCollapsed}
              active={currentView === 'mock-test'} 
              onClick={() => { onChangeView('mock-test'); toggleMobileMenu(); }} 
            />
            <NavItem 
              view="tools" 
              label="Power Tools" 
              icon="🛠️" 
              collapsed={isCollapsed}
              active={currentView === 'tools'} 
              onClick={() => { onChangeView('tools'); toggleMobileMenu(); }} 
            />
             <NavItem 
              view="guide" 
              label="Interactive Guide" 
              icon="🧭" 
              collapsed={isCollapsed}
              active={currentView === 'guide'} 
              onClick={() => { onChangeView('guide'); toggleMobileMenu(); }} 
            />
            
            {!isCollapsed && <div className="my-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider animate-fade-in">Career</div>}
            {isCollapsed && <div className="my-2 border-t border-slate-800 mx-2"></div>}
            
            <NavItem 
              view="resume-analyzer" 
              label="Resume Analyzer" 
              icon="📄" 
              collapsed={isCollapsed}
              active={currentView === 'resume-analyzer'} 
              onClick={() => { onChangeView('resume-analyzer'); toggleMobileMenu(); }} 
            />
            <NavItem 
              view="job-search" 
              label="Job Search" 
              icon="🔍" 
              collapsed={isCollapsed}
              active={currentView === 'job-search'} 
              onClick={() => { onChangeView('job-search'); toggleMobileMenu(); }} 
            />
            <NavItem 
              view="interview-prep" 
              label="Ask Nik" 
              icon="🤖" 
              collapsed={isCollapsed}
              active={currentView === 'interview-prep'} 
              onClick={() => { onChangeView('interview-prep'); toggleMobileMenu(); }} 
            />
            
            <div className="my-2 border-t border-slate-800 mx-4"></div>
            <NavItem 
              view="developed-by" 
              label="Developed By" 
              icon="👨‍💻" 
              collapsed={isCollapsed}
              active={currentView === 'developed-by'} 
              onClick={() => { onChangeView('developed-by'); toggleMobileMenu(); }} 
            />
          </nav>

          {/* User Profile / Footer (Click to View Profile) */}
          {user && (
            <div className="pt-4 border-t border-slate-800 mt-2">
              <div 
                onClick={() => { onChangeView('profile'); toggleMobileMenu(); }}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-2'} py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer group hover:bg-slate-700/50 hover:border-blue-500/30 transition-all`}
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-600 group-hover:border-blue-400 transition-colors">
                  <img src={user.profileImage || "https://api.dicebear.com/9.x/notionists/svg?seed=Felix"} alt="User" className="w-full h-full object-cover" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                )}
                {!isCollapsed && (
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

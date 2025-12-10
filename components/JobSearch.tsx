import React, { useState, useEffect, useRef } from 'react';
import { fetchJobs } from '../services/geminiService';
import { MOCK_COMPANIES } from '../constants';
import { JobListing, Company, JobFilters } from '../types';

// Toast Notification Component
const Toast: React.FC<{ message: string; type?: 'info' | 'error'; onClose: () => void }> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-fade-in-up ${
      type === 'info' ? 'bg-slate-800 text-white border border-blue-500/50' : 'bg-red-900/90 text-white border border-red-500/50'
    }`}>
      <span className="text-xl">{type === 'info' ? 'ℹ️' : '⚠️'}</span>
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 text-slate-400 hover:text-white">✕</button>
    </div>
  );
};

const JobCard: React.FC<{ job: JobListing; onLinkClick: (job: JobListing) => void }> = ({ job, onLinkClick }) => (
  <div 
    onClick={() => onLinkClick(job)}
    className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 block shadow-sm hover:shadow-xl relative cursor-pointer"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{job.title}</h3>
        <p className="text-slate-400 text-sm font-medium">{job.company}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {job.type && (
          <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${
            job.type === 'Remote' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {job.type}
          </span>
        )}
        
        {/* Validation Badges */}
        {job.validationStatus === 'validated' && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
             <span>✓</span> Verified
          </span>
        )}
        {job.validationStatus === 'requires_login' && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
             <span>🔒</span> Login Req
          </span>
        )}
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
      <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
        📍 {job.location}
      </span>
      <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
        💼 {job.experience}
      </span>
      <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
        💰 {job.salary || 'Not disclosed'}
      </span>
    </div>

    {job.skills && (
       <div className="flex flex-wrap gap-1.5 mb-4">
         {job.skills.map(s => (
           <span key={s} className="text-[10px] bg-blue-900/20 text-blue-300 px-1.5 py-0.5 rounded">
             {s}
           </span>
         ))}
       </div>
    )}

    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-700/50 mt-auto">
      <span className="text-slate-500 flex items-center gap-1">
        🕒 {job.postedDate}
      </span>
      <span className="text-blue-500 font-medium group-hover:translate-x-1 transition-transform flex items-center">
        Via {job.portal} <span className="ml-1">→</span>
      </span>
    </div>
  </div>
);

const FilterPill: React.FC<{ 
  label: string; 
  value: string;
  onClick: () => void;
}> = ({ label, value, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
       value !== 'Any' 
         ? 'bg-blue-600 border-blue-500 text-white' 
         : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
    }`}
  >
    {label}: <span className={value !== 'Any' ? 'text-white' : 'text-slate-500'}>{value}</span>
  </button>
);

const JobSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    location: 'Any',
    salary: 'Any',
    experience: 'Any',
    datePosted: 'Any',
    jobType: 'Any'
  });
  
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type?: 'info' | 'error' } | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide logic on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const currentScrollY = scrollContainerRef.current.scrollTop;
      
      // If scrolling down significantly and filters are open, collapse them
      if (currentScrollY > lastScrollY && currentScrollY > 100 && showFilters) {
        setShowFilters(false);
      }
      
      // If scrolling up, expand them (optional, makes it feel like sticky header)
      if (currentScrollY < lastScrollY && !showFilters) {
         setShowFilters(true);
      }

      setLastScrollY(currentScrollY);
    };

    const div = scrollContainerRef.current;
    div?.addEventListener('scroll', handleScroll);
    return () => div?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, showFilters]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = MOCK_COMPANIES.filter(c => 
        c.name.toLowerCase().startsWith(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async (resetPage = true) => {
    const targetPage = resetPage ? 1 : page + 1;
    if (resetPage) {
      setJobs([]);
      setPage(1);
    }
    
    setLoading(true);
    setSuggestions([]);
    
    const results = await fetchJobs(query, filters, targetPage);
    
    if (resetPage) {
      setJobs(results);
    } else {
      setJobs(prev => [...prev, ...results]);
      setPage(targetPage);
    }
    setLoading(false);
  };

  const selectCompany = (name: string) => {
    setQuery(name);
    setSuggestions([]);
  };

  const handleJobClick = (job: JobListing) => {
    if (job.validationStatus === 'requires_login') {
      setToast({ msg: `Login required for ${job.portal}. Redirecting...` });
      setTimeout(() => {
        window.open(job.link, '_blank');
      }, 1500);
    } else if (job.validationStatus === 'archived') {
       setToast({ msg: "This job might be expired. Redirecting to similar search...", type: 'error' });
       setTimeout(() => {
         window.open(job.link, '_blank');
       }, 1500);
    } else {
      window.open(job.link, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 relative">
      
      {/* Toast Overlay */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Section (Fixed Top) */}
      <div className="bg-slate-900/80 backdrop-blur z-30 border-b border-slate-800 transition-all duration-300">
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          
          {/* Search Bar */}
          <div className="flex gap-4 relative z-40">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
                placeholder="Role, Skill, or Company..."
                className="w-full bg-slate-800 text-white rounded-xl pl-12 pr-4 py-4 text-base border border-slate-700 focus:outline-none focus:border-blue-500 shadow-xl"
              />
              <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => selectCompany(c.name)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center space-x-3 text-slate-300 border-b border-slate-700/50 last:border-0"
                    >
                      <span className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white">
                        {c.logo}
                      </span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => handleSearch(true)}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg whitespace-nowrap"
            >
              Search
            </button>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-4 rounded-xl border transition-all ${
                showFilters 
                  ? 'bg-slate-700 border-slate-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
          }`}>
             <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Date Posted */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Posted</label>
                   <select 
                     value={filters.datePosted}
                     onChange={(e) => setFilters(p => ({...p, datePosted: e.target.value}))}
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                   >
                     {['Any', 'Last 24 Hours', 'Last 3 Days', 'Last 7 Days', 'Last 30 Days'].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>

                {/* Experience */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience</label>
                   <select 
                     value={filters.experience}
                     onChange={(e) => setFilters(p => ({...p, experience: e.target.value}))}
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                   >
                     {['Any', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>

                {/* Job Type */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</label>
                   <select 
                     value={filters.jobType}
                     onChange={(e) => setFilters(p => ({...p, jobType: e.target.value}))}
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                   >
                     {['Any', 'Full-time', 'Internship', 'Contract', 'Remote'].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>

                {/* Location */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                   <select 
                     value={filters.location}
                     onChange={(e) => setFilters(p => ({...p, location: e.target.value}))}
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                   >
                     {['Any', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Remote', 'Hyderabad'].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>

                {/* Salary */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Salary</label>
                   <select 
                     value={filters.salary}
                     onChange={(e) => setFilters(p => ({...p, salary: e.target.value}))}
                     className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                   >
                     {['Any', '3-6 LPA', '6-10 LPA', '10-20 LPA', '20+ LPA'].map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                </div>
                
                {/* Apply Button */}
                <div className="flex items-end">
                  <button 
                    onClick={() => handleSearch(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20"
                  >
                    Apply Filters
                  </button>
                </div>

             </div>
          </div>
        </div>
      </div>

      {/* Scrollable Results Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin relative z-10"
      >
        <div className="max-w-6xl mx-auto pb-20">
          {jobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-400 text-sm">Showing {jobs.length} results</p>
                <div className="flex gap-2">
                    <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
                      <option>Sort: Recent</option>
                      <option>Sort: Salary (High to Low)</option>
                      <option>Sort: Relevance</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job, idx) => <JobCard key={job.id + idx} job={job} onLinkClick={handleJobClick} />)}
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => handleSearch(false)}
                  disabled={loading}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-all"
                >
                  {loading ? 'Loading...' : 'Load More Jobs'}
                </button>
              </div>
            </>
          ) : (
              !loading && (
                <div className="text-center py-20 opacity-50">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl text-slate-300">Start your search</p>
                  <p className="text-slate-500">Find jobs across LinkedIn, Naukri, and more.</p>
                </div>
              )
          )}
          
          {loading && jobs.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500">Scanning portals...</p>
              </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default JobSearch;
import React, { useState, useEffect } from 'react';
import { analyzeResume, fetchJobs } from '../services/geminiService';
import { AnalysisResult, JobListing, JobFilters } from '../types';

const ResumeAnalyzer: React.FC = () => {
  // Input State
  const [resumeMode, setResumeMode] = useState<'text' | 'file'>('file');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);

  const [jdMode, setJdMode] = useState<'text' | 'url'>('text');
  const [jdText, setJdText] = useState('');
  const [jdUrl, setJdUrl] = useState('');

  // Analysis State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hinglish' | 'Hindi' | 'Marathi'>('English');
  
  // Recommended Jobs State
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [jobFilters, setJobFilters] = useState<JobFilters>({
    location: 'Any',
    salary: 'Any',
    experience: 'Any',
    datePosted: 'Any',
    jobType: 'Any'
  });
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobPage, setJobPage] = useState(1);
  const [showJobFilters, setShowJobFilters] = useState(false);

  // UI Toggles
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'matchReport': true,
    'skillGaps': true,
    'tailoredResume': false,
    'recommendedJobs': true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        setResumeBase64(base64Content);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateJobFitScore = (job: JobListing, resumeSkills: string[]) => {
    if (!job.skills || job.skills.length === 0) return 60; // Base score
    const matched = job.skills.filter(s => 
      resumeSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rs.toLowerCase()))
    );
    const percentage = (matched.length / job.skills.length) * 100;
    // Boost score slightly for role relevance (simulated)
    return Math.min(Math.round(percentage + 30), 98);
  };

  const fetchRecommendations = async (analysisResult: AnalysisResult, reset = false) => {
    if (!analysisResult.suggestedJobRoles || analysisResult.suggestedJobRoles.length === 0) return;
    
    setLoadingJobs(true);
    const query = analysisResult.suggestedJobRoles.join(" OR ");
    // Use extracted experience level if filter is Any
    const activeFilters = {
      ...jobFilters,
      experience: jobFilters.experience === 'Any' ? analysisResult.candidateExperienceLevel : jobFilters.experience
    };

    const jobs = await fetchJobs(query, activeFilters, reset ? 1 : jobPage);
    
    // Calculate local scores
    const scoredJobs = jobs.map(j => ({
      ...j,
      matchScore: calculateJobFitScore(j, analysisResult.skillsFound)
    }));

    setRecommendedJobs(prev => reset ? scoredJobs : [...prev, ...scoredJobs]);
    setLoadingJobs(false);
    if (!reset) setJobPage(p => p + 1);
    else setJobPage(2);
  };

  const handleAnalyze = async (selectedLang = language) => {
    if ((resumeMode === 'text' && !resumeText.trim()) || (resumeMode === 'file' && !resumeFile)) {
      alert("Please provide resume content.");
      return;
    }
    
    if (jdMode === 'url' && !jdUrl.trim()) {
        alert("Please provide a Job Link.");
        return;
    }
    if (jdMode === 'text' && !jdText.trim()) {
        alert("Please provide Job Description.");
        return;
    }

    setLoading(true);
    setResult(null);
    setRecommendedJobs([]);

    const resumeInput = {
      text: resumeMode === 'text' ? resumeText : undefined,
      fileData: resumeMode === 'file' ? resumeBase64 || undefined : undefined,
      mimeType: resumeFile?.type || 'application/pdf'
    };

    const jdInput = {
      text: jdMode === 'text' ? jdText : undefined,
      url: jdMode === 'url' ? jdUrl : undefined
    };

    const output = await analyzeResume(resumeInput, jdInput, selectedLang);
    setResult(output);
    setLoading(false);

    // Auto-fetch jobs after analysis
    if (output) {
      fetchRecommendations(output, true);
    }
  };

  const handleLanguageChange = (lang: typeof language) => {
    setLanguage(lang);
    if ((resumeFile || resumeText) && (jdUrl || jdText)) {
      handleAnalyze(lang);
    }
  };

  const handleSampleData = () => {
    setResumeMode('text');
    setJdMode('text');
    setResumeText(`Nikhil Shimpy\nFull Stack Developer\nSkills: React, Node.js, Python.\nExp: 1 Year as Intern at TechCorp.\nProjects: E-commerce app using MERN stack.`);
    setJdText(`Senior Frontend Engineer\nReq: 5 Years exp, React, Redux, AWS, Docker, Microservices.\nResponsibilities: Lead frontend team, optimize performance.`);
  };

  // Render Helpers
  const ScoreCard = ({ title, score, colorClass }: { title: string; score: number; colorClass: string }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center flex-1">
      <div className={`text-3xl font-bold mb-1 ${colorClass}`}>{score}%</div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{title}</div>
      <div className="w-full bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass.replace('text-', 'bg-')}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  const SkillBadge = ({ skill, type }: { skill: string; type: 'found' | 'missing' | 'gap' }) => {
    const styles = {
      found: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      missing: 'bg-red-500/10 text-red-400 border-red-500/20',
      gap: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-medium border ${styles[type]} inline-block mr-2 mb-2`}>
        {type === 'found' ? '✓ ' : type === 'missing' ? '✗ ' : '⚠️ '}
        {skill}
      </span>
    );
  };

  const JobRecCard = ({ job }: { job: JobListing }) => (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/30 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-white text-lg">{job.title}</h4>
          <p className="text-slate-400 text-sm">{job.company}</p>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold text-lg">{job.matchScore}% Match</div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Job Fit Score</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-4">
        <span className="bg-slate-800 px-2 py-1 rounded">📍 {job.location}</span>
        <span className="bg-slate-800 px-2 py-1 rounded">💰 {job.salary}</span>
        <span className="bg-slate-800 px-2 py-1 rounded">🕒 {job.postedDate}</span>
        <span className="bg-slate-800 px-2 py-1 rounded">💼 {job.type}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {job.skills?.slice(0, 4).map(s => (
          <span key={s} className="text-[10px] bg-blue-900/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">
            {s}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <a 
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium text-center transition-colors shadow-lg shadow-blue-600/20"
        >
          View Job
        </a>
        <button 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700"
          onClick={() => alert("Job Saved!")}
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen flex flex-col animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Resume & Job Matcher</h2>
          <p className="text-slate-400">AI-Powered ATS Scoring • Gap Analysis • Tailored Suggestions</p>
        </div>
        <button onClick={handleSampleData} className="text-blue-400 text-sm hover:underline">
          Load Sample Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Inputs (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          
          {/* Resume Input */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center">
              <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-2 text-xs">1</span>
              Upload Resume
            </h3>
            
            <div className="flex bg-slate-900/50 p-1 rounded-lg mb-4">
              <button 
                onClick={() => setResumeMode('file')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${resumeMode === 'file' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                File
              </button>
              <button 
                onClick={() => setResumeMode('text')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${resumeMode === 'text' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Text
              </button>
            </div>

            {resumeMode === 'file' ? (
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center transition-colors relative bg-slate-900/30">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-2xl mb-2">📄</div>
                <p className="text-xs text-slate-300 truncate px-2">
                  {resumeFile ? resumeFile.name : 'Click to Upload Resume'}
                </p>
              </div>
            ) : (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text..."
                className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 resize-none"
              />
            )}
          </div>

          {/* JD Input */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4 flex items-center">
              <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">2</span>
              Job Description
            </h3>

            <div className="flex bg-slate-900/50 p-1 rounded-lg mb-4">
              <button 
                onClick={() => setJdMode('url')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${jdMode === 'url' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                URL
              </button>
              <button 
                onClick={() => setJdMode('text')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${jdMode === 'text' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Text
              </button>
            </div>

            {jdMode === 'url' ? (
              <input 
                type="text"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste JD text..."
                className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
              />
            )}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>⚡</span> Analyze Match
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Results (8 Cols) */}
        <div className="lg:col-span-8">
          
          {/* Language Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide sticky top-0 z-20 bg-slate-900/90 backdrop-blur py-2">
            {['English', 'Hinglish', 'Hindi', 'Marathi'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                  language === lang 
                    ? 'bg-white text-slate-900 border-white shadow-lg' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {!result && !loading && (
            <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-6 opacity-50">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Optimize?</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Upload your resume and the job description to get a detailed ATS analysis, skill gap report, and tailored suggestions.
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-32 bg-slate-800/50 rounded-2xl flex-1 animate-pulse"></div>
                <div className="h-32 bg-slate-800/50 rounded-2xl flex-1 animate-pulse"></div>
              </div>
              <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse"></div>
              <div className="h-40 bg-slate-800/50 rounded-2xl animate-pulse"></div>
            </div>
          )}

          {/* Results Content */}
          {result && !loading && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* 1. Match Report Card */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition-colors"
                  onClick={() => toggleSection('matchReport')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-3">📊</span> Match Report
                  </h3>
                  <span className="text-slate-400 text-xl">{expandedSections['matchReport'] ? '−' : '+'}</span>
                </div>
                
                {expandedSections['matchReport'] && (
                  <div className="p-6 border-t border-slate-700/50 bg-slate-900/20">
                    <div className="flex gap-4 mb-6">
                      <ScoreCard 
                        title="Resume Match" 
                        score={result.matchPercentage} 
                        colorClass={result.matchPercentage > 75 ? 'text-emerald-400' : result.matchPercentage > 50 ? 'text-yellow-400' : 'text-red-400'} 
                      />
                      <ScoreCard 
                        title="ATS Score" 
                        score={result.atsScore} 
                        colorClass={result.atsScore > 80 ? 'text-blue-400' : 'text-slate-400'} 
                      />
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 italic border-l-4 border-blue-500 pl-4 bg-blue-500/5 py-2 rounded-r">
                      "{result.summary}"
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">✅ Skills Found</h4>
                        <div className="flex flex-wrap">
                          {result.skillsFound.map(s => <SkillBadge key={s} skill={s} type="found" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Skill Gaps Card */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition-colors"
                  onClick={() => toggleSection('skillGaps')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-3">❌</span> Skill & Keyword Gaps
                  </h3>
                  <span className="text-slate-400 text-xl">{expandedSections['skillGaps'] ? '−' : '+'}</span>
                </div>

                {expandedSections['skillGaps'] && (
                  <div className="p-6 border-t border-slate-700/50 bg-slate-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                         <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Critical Missing Skills</h4>
                         {result.missingSkills.length > 0 ? (
                           <div className="flex flex-wrap">{result.missingSkills.map(s => <SkillBadge key={s} skill={s} type="missing" />)}</div>
                         ) : (
                           <p className="text-sm text-slate-500">No critical skills missing.</p>
                         )}
                      </div>
                      <div>
                         <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Keyword Gaps</h4>
                         {result.keywordGaps.length > 0 ? (
                           <div className="flex flex-wrap">{result.keywordGaps.map(s => <SkillBadge key={s} skill={s} type="gap" />)}</div>
                         ) : (
                           <p className="text-sm text-slate-500">Great keyword optimization!</p>
                         )}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <h4 className="text-sm font-bold text-white mb-3">💡 Improvement Plan</h4>
                      <ul className="space-y-2">
                        {result.improvementPlan.map((step, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start">
                            <span className="text-blue-500 mr-2 mt-0.5">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Tailored Resume Card */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition-colors"
                  onClick={() => toggleSection('tailoredResume')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-3">📝</span> Tailored Resume Suggestions
                  </h3>
                  <span className="text-slate-400 text-xl">{expandedSections['tailoredResume'] ? '−' : '+'}</span>
                </div>

                {expandedSections['tailoredResume'] && (
                  <div className="p-6 border-t border-slate-700/50 bg-slate-900/20 space-y-6">
                     
                     <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                       <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Suggested Profile Summary</h4>
                       <p className="text-sm text-slate-300 leading-relaxed font-medium">
                         "{result.tailoredSuggestions.profileSummary}"
                       </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Experience Bullet Points</h4>
                          <ul className="space-y-3">
                            {result.tailoredSuggestions.experience.map((exp, i) => (
                              <li key={i} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                {exp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Project Additions</h4>
                          <ul className="space-y-3">
                            {result.tailoredSuggestions.projects.map((proj, i) => (
                              <li key={i} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                {proj}
                              </li>
                            ))}
                          </ul>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* 4. Recommended Jobs Section (New) */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition-colors"
                  onClick={() => toggleSection('recommendedJobs')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-3">📌</span> Recommended Jobs & Internships
                  </h3>
                  <span className="text-slate-400 text-xl">{expandedSections['recommendedJobs'] ? '−' : '+'}</span>
                </div>

                {expandedSections['recommendedJobs'] && (
                  <div className="p-6 border-t border-slate-700/50 bg-slate-900/20">
                     
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-slate-400">
                          Based on your resume skills and experience.
                        </p>
                        <button 
                          onClick={() => setShowJobFilters(!showJobFilters)}
                          className="text-xs font-bold text-blue-400 hover:text-white flex items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
                        >
                          🔍 Filters {showJobFilters ? '▲' : '▼'}
                        </button>
                     </div>

                     {/* Filters Panel */}
                     {showJobFilters && (
                       <div className="bg-slate-800/50 p-4 rounded-xl mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 border border-slate-700">
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Location</label>
                            <select 
                              value={jobFilters.location}
                              onChange={e => setJobFilters(p => ({...p, location: e.target.value}))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white"
                            >
                              {['Any', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Remote', 'Hyderabad'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Type</label>
                            <select 
                              value={jobFilters.jobType}
                              onChange={e => setJobFilters(p => ({...p, jobType: e.target.value}))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white"
                            >
                              {['Any', 'Full-time', 'Internship', 'Contract', 'Remote'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Salary</label>
                            <select 
                              value={jobFilters.salary}
                              onChange={e => setJobFilters(p => ({...p, salary: e.target.value}))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white"
                            >
                               {['Any', '3-6 LPA', '6-10 LPA', '10-20 LPA', '20+ LPA'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <button 
                            onClick={() => result && fetchRecommendations(result, true)}
                            className="col-span-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold mt-2"
                          >
                            Apply Filters
                          </button>
                       </div>
                     )}

                     <div className="space-y-4">
                       {loadingJobs && recommendedJobs.length === 0 ? (
                         <div className="text-center py-10">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-slate-500">Finding matches...</p>
                         </div>
                       ) : recommendedJobs.length > 0 ? (
                         <>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {recommendedJobs.map((job, idx) => (
                               <JobRecCard key={idx} job={job} />
                             ))}
                           </div>
                           <button 
                             onClick={() => result && fetchRecommendations(result)}
                             disabled={loadingJobs}
                             className="w-full py-3 mt-4 border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-sm transition-all"
                           >
                             {loadingJobs ? 'Loading more...' : 'Load More Jobs'}
                           </button>
                         </>
                       ) : (
                         <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
                            <p className="text-slate-500">No jobs found matching your profile yet.</p>
                         </div>
                       )}
                     </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;

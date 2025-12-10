import React, { useState } from 'react';

const SocialLink: React.FC<{ 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  color: string;
}> = ({ href, icon, label, color }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-${color}-500/50 hover:bg-${color}-500/10 transition-all group`}
  >
    <span className={`text-${color}-400 group-hover:scale-110 transition-transform`}>{icon}</span>
    <span className="text-slate-300 font-medium group-hover:text-white">{label}</span>
  </a>
);

const SkillBadge: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-opacity-10 border-opacity-20 ${color}`}>
    {name}
  </span>
);

const DevelopedBy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'About' | 'QR'>('About');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setMessage('');
      setIsSent(false);
    }, 3000);
  };

  const skills = [
    { name: 'Python', color: 'bg-yellow-500 text-yellow-400 border-yellow-500' },
    { name: 'JavaScript', color: 'bg-yellow-300 text-yellow-200 border-yellow-300' },
    { name: 'React', color: 'bg-cyan-500 text-cyan-400 border-cyan-500' },
    { name: 'TensorFlow', color: 'bg-orange-500 text-orange-400 border-orange-500' },
    { name: 'GenAI', color: 'bg-purple-500 text-purple-400 border-purple-500' },
    { name: 'Flask', color: 'bg-white text-slate-300 border-white' },
    { name: 'Firebase', color: 'bg-amber-500 text-amber-400 border-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-4 lg:p-8 animate-fade-in pb-20">
      
      {/* Hero Header */}
      <div className="relative mb-12 p-8 lg:p-12 rounded-3xl overflow-hidden text-center bg-slate-800 border border-slate-700 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-slate-900/90 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 mb-6 shadow-xl shadow-blue-500/20">
            <img 
              src="https://github.com/nikhilshimpy.png" 
              alt="Nikhil Shimpy" 
              className="w-full h-full rounded-full object-cover bg-slate-950 border-4 border-slate-900"
            />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
            Nikhil Shimpy
          </h1>
          <p className="text-lg text-blue-300 font-medium mb-6">
            AI & ML Enthusiast | Full Stack Developer
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <SocialLink 
              href="https://nikhilshimpyyportfolio.vercel.app/" 
              icon="🌐" 
              label="Portfolio" 
              color="blue"
            />
            <SocialLink 
              href="https://www.linkedin.com/in/nikhilshimpy/" 
              icon="💼" 
              label="LinkedIn" 
              color="blue"
            />
            <SocialLink 
              href="https://github.com/nikhilshimpy" 
              icon="🐙" 
              label="GitHub" 
              color="purple"
            />
            <SocialLink 
              href="https://www.instagram.com/nikhilshimpyy/?hl=en" 
              icon="📸" 
              label="Instagram" 
              color="pink"
            />
          </div>

          <div className="flex gap-2">
            {['About', 'QR'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-lg' 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          {activeTab === 'About' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-3xl">👤</span> About Me
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
                <p>
                  Hi 👋, I’m <strong>Nikhil Shimpy</strong> — a passionate IT student at SGSITS Indore (Batch 2027) with a deep love for building intelligent systems.
                </p>
                <p>
                  I thrive on solving real-world problems through innovative tech solutions. My journey involves deep diving into <strong>Artificial Intelligence, Machine Learning, and Generative AI</strong> while maintaining a strong foothold in Full Stack Development.
                </p>
                
                <h3 className="text-white font-bold text-lg mt-6 mb-3">🚀 Why I Built This App</h3>
                <p>
                  DSA Master was born out of a desire to make algorithmic learning accessible and interactive. By combining modern AI with structured learning patterns, I aim to help students crack interviews at top tech giants like Google, Amazon, and Microsoft.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700">
                 <h3 className="text-white font-bold mb-4">🛠️ Tech Stack & Skills</h3>
                 <div className="flex flex-wrap gap-2">
                   {skills.map(s => <SkillBadge key={s.name} {...s} />)}
                 </div>
              </div>
            </div>
          )}

          {/* QR Code Section */}
          {activeTab === 'QR' && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <span className="mr-3 text-3xl">📱</span> Scan to Connect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Portfolio', url: 'https://nikhilshimpyyportfolio.vercel.app/' },
                   { label: 'LinkedIn', url: 'https://www.linkedin.com/in/nikhilshimpy/' },
                   { label: 'GitHub', url: 'https://github.com/nikhilshimpy' },
                 ].map((item) => (
                   <div key={item.label} className="flex flex-col items-center bg-white p-4 rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.url)}`}
                        alt={`${item.label} QR`}
                        className="w-32 h-32 mb-3"
                      />
                      <span className="text-slate-900 font-bold">{item.label}</span>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
             <h3 className="font-bold text-lg mb-4 opacity-90">Education</h3>
             <div className="mb-4">
               <div className="text-2xl font-bold">B.Tech (IT)</div>
               <div className="text-sm opacity-80">SGSITS Indore</div>
               <div className="text-xs opacity-60 mt-1">Batch 2027</div>
             </div>
             <div className="h-px bg-white/20 my-4"></div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-medium">Open to work?</span>
               <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold">YES</span>
             </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
             <h3 className="text-xl font-bold text-white mb-4">Send a Message</h3>
             {isSent ? (
               <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl text-center">
                 Message sent successfully! 🚀
               </div>
             ) : (
               <form onSubmit={handleSendMessage} className="space-y-4">
                 <input 
                   type="text" 
                   placeholder="Your Name" 
                   required
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
                 <input 
                   type="email" 
                   placeholder="Your Email" 
                   required
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
                 <textarea 
                   placeholder="Write a message..." 
                   rows={3}
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   required
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                 />
                 <button 
                   type="submit" 
                   className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                 >
                   Send Message
                 </button>
               </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopedBy;
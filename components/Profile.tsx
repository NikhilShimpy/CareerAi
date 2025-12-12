import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../services/firebase';
import { updateProfile, deleteUser, signOut } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

// Consistent Avatar Set
const AVATARS = [
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317833/image4_nfbdvk.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image10_prpun0.jpg",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image2_levtat.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image3_ergsfw.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image6_yfyyap.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image9_rvnbwo.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image5_sbju6u.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image7_kvh8hu.jpg",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image8_qfdmet.png",
  "https://res.cloudinary.com/dtarhtz5w/image/upload/v1765317832/image10_prpun0.jpg"
];

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [mode, setMode] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [newName, setNewName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.profileImage);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

    // Show toast 
  // Show toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!newName.trim()) {
      showToast("Name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const authUser = auth.currentUser;
      if (authUser) {
        // 1. Update Firebase Auth
        await updateProfile(authUser, {
          displayName: newName,
          photoURL: selectedAvatar
        });

        // 2. Update Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: newName,
          profileImage: selectedAvatar,
          // We can optionally update lastLogin here if we wanted to track 'profile update' activity
        });
        
        showToast("Profile updated successfully! 🎉");
        setMode('VIEW');
        
        // Slight delay to allow context refresh or force reload if needed
        setTimeout(() => window.location.reload(), 1000); 
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 animate-fade-in relative pb-20">
      
      {/* Success Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up">
          <span>✅</span>
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Hero Cover Section */}
      <div className="h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        
        {/* Main Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header Content */}
          <div className="p-8 md:p-10 border-b border-slate-700/50 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            
            {/* Avatar Circle */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full p-1.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-4 border-slate-900">
                  <img 
                    src={mode === 'EDIT' ? selectedAvatar : user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {mode === 'EDIT' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 pointer-events-none">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Preview</span>
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="flex-1 text-center md:text-left mb-2">
              {mode === 'VIEW' ? (
                <>
                  <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                  <p className="text-slate-400 text-lg flex items-center justify-center md:justify-start gap-2">
                    {user.email}
                    {user.authProvider === 'google' && (
                      <span className="bg-white/10 p-1 rounded-full" title="Google Linked">
                         <img src="https://www.google.com/favicon.ico" alt="G" className="w-3 h-3 opacity-70" />
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <div className="w-full max-w-md">
                   <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Display Name</label>
                   <input 
                     type="text"
                     value={newName}
                     onChange={(e) => setNewName(e.target.value)}
                     className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-xl text-white font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                     placeholder="Enter your name"
                   />
                </div>
              )}
            </div>

            {/* Action Buttons (View Mode) */}
            {mode === 'VIEW' && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setMode('EDIT')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={onLogout}
                  className="px-6 py-2.5 bg-slate-700/50 hover:bg-red-900/30 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/30 rounded-xl font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="p-8 md:p-10 bg-slate-900/30">
            
            {mode === 'VIEW' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Card 1: Account Created */}
                 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-xl mb-4 text-blue-400">📅</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Member Since</div>
                    <div className="text-white font-semibold text-lg">{formatDate(user.createdAt)}</div>
                 </div>

                 {/* Card 2: Last Login */}
                 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-xl mb-4 text-purple-400">🕒</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Last Login</div>
                    <div className="text-white font-semibold text-lg">{formatDate(user.lastLogin)}</div>
                 </div>

                 {/* Card 3: Auth Provider */}
                 <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xl mb-4 text-emerald-400">🔐</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Auth Method</div>
                    <div className="text-white font-semibold text-lg capitalize">{user.authProvider}</div>
                 </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 text-sm">1</span>
                  Select an Avatar
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-10">
                  {AVATARS.map((avatar, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`cursor-pointer relative group transition-all duration-300 ${
                        selectedAvatar === avatar ? 'scale-105' : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                    >
                       <div className={`rounded-full overflow-hidden border-2 aspect-square transition-all ${
                         selectedAvatar === avatar 
                           ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                           : 'border-slate-700 group-hover:border-slate-500'
                       }`}>
                         <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover bg-slate-800" />
                       </div>
                       {selectedAvatar === avatar && (
                         <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg">
                           SELECTED
                         </div>
                       )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-700/50">
                   <button 
                     onClick={handleSave}
                     disabled={loading}
                     className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                   >
                     {loading ? 'Saving Changes...' : 'Save Profile'}
                   </button>
                   <button 
                     onClick={() => { setMode('VIEW'); setNewName(user.name); setSelectedAvatar(user.profileImage); }}
                     className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 transition-all"
                   >
                     Cancel
                   </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

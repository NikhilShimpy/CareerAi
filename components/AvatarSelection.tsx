import React, { useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../services/firebase';

// Using consistent high-quality 3D avatar assets for premium feel
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

interface AvatarSelectionProps {
  userId: string;
  onComplete: () => void;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ userId, onComplete }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profileImage: selectedAvatar
      });
      onComplete();
    } catch (error) {
      console.error("Error saving avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 animate-fade-in">
      <div className="max-w-4xl w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 lg:p-12 shadow-2xl text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Choose Your Avatar</h2>
        <p className="text-slate-400 mb-10 text-lg">Select a profile picture to personalize your experience.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12">
          {AVATARS.map((avatar, index) => (
            <div 
              key={index}
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
                selectedAvatar === avatar ? 'scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`rounded-full overflow-hidden border-4 aspect-square ${
                selectedAvatar === avatar ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-transparent group-hover:border-slate-600'
              }`}>
                <img 
                  src={avatar} 
                  alt={`Avatar ${index + 1}`} 
                  className="w-full h-full object-cover bg-slate-700"
                />
              </div>
              {selectedAvatar === avatar && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                  SELECTED
                </div>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          disabled={!selectedAvatar || loading}
          className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
        >
          {loading ? 'Saving...' : 'Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default AvatarSelection;

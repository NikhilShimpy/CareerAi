import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../services/firebase';

interface LoginProps {
  onLoginSuccess: (isNewUser: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user doc
        await setDoc(userDocRef, {
          name: user.displayName || 'User',
          email: user.email,
          authProvider: 'google',
          profileImage: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        onLoginSuccess(true); // Is new user -> Go to avatar selection if needed, or skip if google has photo
      } else {
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        onLoginSuccess(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      if (isSignup) {
        // Signup
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        setMsg("Verification email sent! Please verify your email before logging in.");
        setIsSignup(false); // Switch to login view
      } else {
        // Login
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          setError("Your email is not verified. Please check your inbox.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
           // Should have been created during signup but if not:
           await setDoc(userDocRef, {
            name: name || 'User', // Name might be lost if switching modes, ideally stored in local state or passed
            email: email,
            authProvider: 'email',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          });
          onLoginSuccess(true);
        } else {
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          onLoginSuccess(false);
        }
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/20">
            🚀
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Master DSA, Aptitude & Career Skills</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        {msg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6 text-center">
            {msg}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-3 mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-slate-500 text-xs uppercase">Or with Email</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignup && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all mt-2"
          >
            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="ml-2 text-blue-400 font-bold hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

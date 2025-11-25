
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowRight, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onSuccess }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for verification flow
  const [verificationSent, setVerificationSent] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const { login, register, resendVerification } = useAuth();

  const handleFirebaseError = (err: any) => {
    let friendlyMessage = "An unexpected error occurred.";
    if (err.message) {
      if (err.message.includes("auth/email-already-in-use")) {
        friendlyMessage = "This email is already registered. Please log in.";
      } else if (err.message.includes("auth/invalid-email")) {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.message.includes("verify your email")) {
        friendlyMessage = "Email not verified. Please check your inbox.";
        setNeedsVerification(true); // Trigger UI to show Resend button
      } else if (err.message.includes("auth/configuration-not-found")) {
        friendlyMessage = "Configuration Error: Please enable 'Email/Password' in Firebase Console.";
      } else if (err.message.includes("auth/weak-password")) {
        friendlyMessage = "Password should be at least 6 characters.";
      } else if (err.message.includes("Invalid email or password")) {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else {
        friendlyMessage = err.message;
      }
    }
    setError(friendlyMessage);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        onSuccess();
      } else {
        if (!name.trim()) throw new Error("Name is required");
        await register(name, email, password);
        setVerificationSent(true); // Switch to success view
      }
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
      setError('');
      setIsSubmitting(true);
      try {
          await resendVerification(email, password);
          setVerificationSent(true);
          setNeedsVerification(false);
      } catch (err: any) {
          setError(err.message || "Failed to resend.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- SUCCESS VIEW: VERIFICATION SENT ---
  if (verificationSent) {
      return (
        <div className="min-h-full flex flex-col items-center justify-center p-4 bg-slate-50 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Verification Email Sent</h2>
                <p className="text-slate-600 mb-6">
                    We've sent a confirmation link to <span className="font-semibold text-slate-800">{email}</span>.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-500 mb-6">
                    Please check your inbox (and spam folder) and click the link to activate your account before logging in.
                </div>
                <button 
                    onClick={() => {
                        setVerificationSent(false);
                        setIsLogin(true); // Switch to login mode
                        setNeedsVerification(false);
                        setPassword(''); // Clear password for security
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-slate-50 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 border border-white/20">F</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Start building your startup strategy today.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex flex-col items-start gap-2">
                <div className="flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
                {needsVerification && (
                    <button 
                        type="button"
                        onClick={handleResend}
                        className="text-xs font-bold underline hover:text-red-800 flex items-center mt-1 ml-6"
                    >
                        <RefreshCw size={12} className="mr-1"/> Resend Verification Email
                    </button>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 flex items-center justify-center space-x-2 mt-6"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setNeedsVerification(false);
                }}
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-xs">
        <p>© 2025 FounderFrame. Secure Authentication.</p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Cpu,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerUser,
    loginWithPreset,
    loading,
    getStoredFirebaseConfig,
    saveFirebaseConfig,
  } = useAuth();

  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Incident Commander');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Firebase Config Modal State
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState(() => {
    return JSON.stringify(getStoredFirebaseConfig(), null, 2);
  });

  // Handle Google Login (Firebase)
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  // Handle Email & Password Form Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerUser(name, email, password, role);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemo = async () => {
    setErrorMsg(null);
    try {
      await loginWithPreset('commander');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Demo login failed. Please try again.');
    }
  };

  // Handle Save Firebase Settings
  const handleSaveFirebase = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(firebaseConfigInput);
      saveFirebaseConfig(parsed);
      setFirebaseModalOpen(false);
    } catch (err) {
      alert('Invalid JSON format for Firebase configuration.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-sky-500/20 selection:text-sky-200">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Container */}
      <div className="relative z-10 w-full max-w-[420px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {authMode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            {authMode === 'signin'
              ? 'Enter your credentials to access the disaster intelligence portal.'
              : 'Join the disaster response and geospatial intelligence network.'}
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
          >
            {/* Official Google SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/[0.08] w-full" />
            <span className="bg-[#11131a] px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              or continue with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Full Name (Sign Up only) */}
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 block">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Demo mode: enter any password or use 1-Click demo.')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={authMode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role (Sign Up only) */}
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="Incident Commander">Incident Commander (USAR Lead)</option>
                  <option value="UAV Recon Pilot">UAV Drone Recon Specialist</option>
                  <option value="Thermal & GIS Analyst">Thermal & Geospatial Analyst</option>
                  <option value="Field First Responder">Field First Responder</option>
                </select>
              </div>
            )}

            {/* Keep Signed In Checkbox */}
            {authMode === 'signin' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#0c0d12] border-white/[0.2] accent-sky-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none font-sans">
                  Keep me signed in
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-sky-500/20"
            >
              {loading ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Link */}
          <div className="text-center pt-1">
            {authMode === 'signin' ? (
              <p className="text-xs text-slate-400 font-sans">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-sans">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Subtle Footer: Demo Shortcut & Firebase Settings */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Access</span>
          </button>

          <button
            type="button"
            onClick={() => setFirebaseModalOpen(true)}
            className="hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Firebase Config</span>
          </button>
        </div>
      </div>

      {/* Firebase Configuration Modal */}
      {firebaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141722] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-100">Firebase Authentication Config</h3>
              </div>
              <button
                onClick={() => setFirebaseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Paste your Firebase credentials JSON below to connect your real Firebase project and Google Auth.
            </p>

            <form onSubmit={handleSaveFirebase} className="space-y-3">
              <div>
                <textarea
                  rows={8}
                  value={firebaseConfigInput}
                  onChange={(e) => setFirebaseConfigInput(e.target.value)}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-xl p-3 font-mono text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none"
                  placeholder='{ "apiKey": "...", "authDomain": "...", "projectId": "..." }'
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setFirebaseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold cursor-pointer shadow-sm"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

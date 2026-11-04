import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Mail,
} from 'lucide-react';
import {
  signInAdmin,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  verifyPasscode,
  startAdminSession,
  recordFailedAttempt,
  checkLockout,
  resetFailedAttempts,
} from '../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Login Mode: 'passcode' (Admin Password) or 'supabase_auth' (Email & Password)
  const [authMode, setAuthMode] = useState<'passcode' | 'supabase_auth'>('passcode');

  // Admin Password
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Supabase Auth Email + Password
  const [email, setEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [showSupabasePassword, setShowSupabasePassword] = useState(false);

  // Status feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSec, setLockoutSec] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setPasswordInput('');
    setEmail('');
    setSupabasePassword('');
    setError('');
    setSuccessMsg('');
    setIsSubmitting(false);

    const lockout = checkLockout();
    if (lockout.isLocked) {
      setLockoutSec(lockout.remainingSeconds);
      setError(`Too many failed attempts. Locked for ${lockout.remainingSeconds}s.`);
    } else {
      setLockoutSec(0);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  if (!isOpen) return null;

  // Handle Local / Custom Admin Password Sign-In
  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSec > 0) return;

    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const isValid = await verifyPasscode(passwordInput.trim());
      if (isValid) {
        resetFailedAttempts();
        startAdminSession();
        setSuccessMsg('Authentication successful! Welcome, Admin.');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        const result = recordFailedAttempt();
        if (result.isLocked) {
          setLockoutSec(result.remainingSeconds);
          setError(`Incorrect password! Security lockout activated for ${result.remainingSeconds}s.`);
        } else {
          setError(`Incorrect password. Please try again. (${result.attemptsLeft} attempts remaining)`);
        }
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Supabase Email & Password Sign-In
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSec > 0) return;

    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured yet. Please log in using Admin Password.');
        return;
      }

      const res = await signInAdmin(email.trim(), supabasePassword.trim());
      if (res && res.session) {
        resetFailedAttempts();
        startAdminSession();
        setSuccessMsg('Supabase Admin login successful!');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      }
    } catch (err: any) {
      if (err?.message?.includes('Invalid login credentials')) {
        setError('Galat Email ya Password! Kripya apna sahi email aur password enter karein.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Email verify nahi hua hai. Supabase Dashboard -> Authentication -> Users me check karein.');
      } else {
        setError(err?.message || 'Authentication error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in font-roboto">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 relative border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00acc1] mx-auto flex items-center justify-center mb-2.5 shadow-inner">
            <Lock size={22} />
          </div>
          <h2 id="admin-login-title" className="text-lg font-bold text-gray-900">
            Admin Sign In
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Only authorized administrator can edit blog posts & settings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'passcode' ? (
          /* PRIMARY FORM: ADMIN PASSWORD */
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSec > 0}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  autoFocus
                  className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !passwordInput.trim() || lockoutSec > 0}
              className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound size={16} />
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Admin Mode'}</span>
            </button>

            {isSupabaseConfigured() && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('supabase_auth');
                    setError('');
                  }}
                  className="text-xs text-gray-500 hover:text-[#00acc1] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <Mail size={13} />
                  <span>Or sign in with Supabase Email & Password</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          /* SECONDARY FORM: SUPABASE EMAIL & PASSWORD */
          <form onSubmit={handleSupabaseLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSupabasePassword ? 'text' : 'password'}
                  required
                  value={supabasePassword}
                  onChange={(e) => setSupabasePassword(e.target.value)}
                  placeholder="Enter Supabase account password"
                  className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowSupabasePassword(!showSupabasePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showSupabasePassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !supabasePassword.trim() || lockoutSec > 0}
              className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'Verifying...' : 'Sign In with Email'}</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('passcode');
                  setError('');
                }}
                className="text-xs text-[#00acc1] hover:underline cursor-pointer font-medium"
              >
                ← Back to Admin Password Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

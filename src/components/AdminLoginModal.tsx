import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  verifyPasscode,
  hashPasscode,
  setStoredPasscodeHash,
  recordFailedAttempt,
  resetFailedAttempts,
  checkLockout,
  startAdminSession,
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
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lockout state
  const [lockoutSec, setLockoutSec] = useState(0);

  // Change passcode mode
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Check lockout on mount and interval
  useEffect(() => {
    if (!isOpen) return;
    const { isLocked, remainingSeconds } = checkLockout();
    if (isLocked) {
      setLockoutSec(remainingSeconds);
    } else {
      setLockoutSec(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutSec <= 0) return;
    const interval = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSec]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSec > 0) return;
    setError('');
    setIsSubmitting(true);

    try {
      const isValid = await verifyPasscode(passcode.trim());
      if (isValid) {
        resetFailedAttempts();
        startAdminSession();
        onLoginSuccess();
        setPasscode('');
        setError('');
        onClose();
      } else {
        const result = recordFailedAttempt();
        if (result.isLocked) {
          setLockoutSec(result.remainingSeconds);
          setError(
            `Maximum attempts exceeded. Security lockout activated for ${result.remainingSeconds} seconds.`
          );
        } else {
          setError(
            `Incorrect passcode. ${result.attemptsLeft} attempt${
              result.attemptsLeft !== 1 ? 's' : ''
            } remaining before security lockout.`
          );
        }
      }
    } catch {
      setError('An error occurred during authentication verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPass.length < 6) {
      setError('New passcode must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('New passcodes do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify current passcode
      const isCurrentValid = await verifyPasscode(currentPass.trim());
      if (!isCurrentValid) {
        setError('Current passcode is incorrect.');
        setIsSubmitting(false);
        return;
      }

      // Hash and store new passcode
      const newHash = await hashPasscode(newPass.trim());
      setStoredPasscodeHash(newHash);

      setSuccessMsg('Admin passcode updated successfully!');
      setIsChangingPasscode(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setError('Failed to update passcode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-roboto">
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
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00acc1] mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Lock size={24} />
          </div>
          <h2 id="admin-login-title" className="text-lg font-bold text-gray-900">
            Secure Admin Access
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Protected area. Only authenticated administrator can edit profile, site title, and backup data.
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutSec > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <Clock size={16} className="shrink-0 text-red-600 animate-spin" />
            <div>
              <span className="font-bold">Security Lockout Active: </span>
              <span>Wait {lockoutSec}s to retry.</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && lockoutSec === 0 && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isChangingPasscode ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Master Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  disabled={lockoutSec > 0 || isSubmitting}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  placeholder="Enter passcode"
                  className="w-full text-sm px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                <span>Default: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">admin123</code></span>
                <span className="text-gray-500 font-medium">SHA-256 Protected</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutSec > 0 || isSubmitting || !passcode.trim()}
              className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Admin Controls'}</span>
            </button>

            <div className="text-center pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPasscode(true);
                  setError('');
                }}
                className="text-xs text-gray-500 hover:text-[#00acc1] transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <KeyRound size={13} />
                <span>Change Admin Passcode</span>
              </button>
            </div>
          </form>
        ) : (
          /* Change Passcode Form */
          <form onSubmit={handleChangePasscode} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Current Passcode
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current passcode"
                required
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Passcode
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="text-[11px] text-[#00acc1] hover:underline"
                >
                  {showNewPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Confirm New Passcode
              </label>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new passcode"
                required
                minLength={6}
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPasscode(false);
                  setError('');
                }}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

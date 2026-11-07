import React, { useState } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { changeAdminPasscode } from '../utils/security';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();
    const cleanCurrent = currentPassword.trim() || 'admin123';

    if (!cleanNew || cleanNew.length < 6) {
      setError('Naya password kam se kam 6 characters ka hona zaroori hai.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setError('New Password aur Confirm Password match nahi kar rahe hain!');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changeAdminPasscode(cleanCurrent, cleanNew);
      if (result.success) {
        onSuccess('Naya password set ho gaya! Ab admin123 band ho chuka hai aur sirf aapka naya password chalega.');
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Password update karne me error aaya.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-roboto">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00acc1] mx-auto flex items-center justify-center mb-2.5 shadow-inner">
            <KeyRound size={22} />
          </div>
          <h2 id="change-password-title" className="text-lg font-bold text-gray-900">
            Change Admin Password
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Set your own private, secure administrator password
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed mb-4">
          <strong>Security Warning:</strong> Naya password set hote hi default mastercode hamesha ke liye band ho jayega. Sirf aapka naya password hi admin mode kholega.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password (default: admin123)"
                className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong secret password"
                className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !newPassword.trim() || !confirmPassword.trim()}
              className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

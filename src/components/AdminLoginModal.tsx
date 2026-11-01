import React, { useState } from 'react';
import { Lock, X, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  currentPasscode: string;
  onUpdatePasscode?: (newPasscode: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentPasscode,
  onUpdatePasscode,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const target = currentPasscode || 'admin123';
    if (passcode.trim() === target) {
      onLoginSuccess();
      setPasscode('');
      setError('');
      onClose();
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim() || newPasscode.length < 4) {
      setError('New passcode must be at least 4 characters long.');
      return;
    }
    if (onUpdatePasscode) {
      onUpdatePasscode(newPasscode.trim());
      setSuccessMsg('Passcode updated successfully!');
      setIsChangingPasscode(false);
      setNewPasscode('');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in font-roboto">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 relative border border-teal-100"
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

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00acc1] mx-auto flex items-center justify-center mb-3">
            <Lock size={24} />
          </div>
          <h2 id="admin-login-title" className="text-lg font-bold text-gray-900">
            Admin Portal Access
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to create/edit posts, customize profile, and manage Supabase & Vercel deployment.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-1.5">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isChangingPasscode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  placeholder="Enter admin passcode"
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-between">
                <span>Default passcode: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">admin123</code></span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Unlock Admin Mode</span>
            </button>

            {onUpdatePasscode && (
              <div className="text-center pt-2 border-t border-gray-100">
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
            )}
          </form>
        ) : (
          <form onSubmit={handleChangePasscode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Admin Passcode
              </label>
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => {
                  setNewPasscode(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                placeholder="Enter new 4+ character passcode"
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPasscode(false);
                  setError('');
                }}
                className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  signInAdmin,
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import {
  verifyPasscode,
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
  const [activeTab, setActiveTab] = useState<'login' | 'database'>('login');

  // Supabase Auth Email + Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Database Connection Settings state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    tablesFound: boolean;
    message: string;
  } | null>(null);

  // Fallback passcode state if Supabase is not configured yet
  const [useFallbackPasscode, setUseFallbackPasscode] = useState(false);
  const [fallbackPasscode, setFallbackPasscode] = useState('');

  // Status feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  useEffect(() => {
    if (!isOpen) return;
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.key);
    setError('');
    setSuccessMsg('');
    setTestResult(null);
    setIsSubmitting(false);

    // If Supabase is not configured yet, notify user
    if (!isSupabaseConfigured()) {
      setUseFallbackPasscode(true);
    } else {
      setUseFallbackPasscode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Supabase Auth Login Handler
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (useFallbackPasscode) {
        // Fallback local verification when Supabase isn't connected yet
        const isValid = await verifyPasscode(fallbackPasscode.trim());
        if (isValid) {
          startAdminSession();
          onLoginSuccess();
          onClose();
        } else {
          setError('Incorrect passcode. Default passcode is: admin123');
        }
        return;
      }

      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured yet. Please open "Database Settings" below to enter your Supabase URL & Anon Key.');
        return;
      }

      const res = await signInAdmin(email.trim(), password.trim());
      if (res && res.session) {
        startAdminSession();
        onLoginSuccess();
        setSuccessMsg('Admin login successful!');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      if (err?.message?.includes('Invalid login credentials')) {
        setError('Galat Email ya Password! Kripya apna Supabase Admin email aur password check karein.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Email verify nahi hua hai. Supabase Dashboard -> Authentication -> Users me jakar confirm karein.');
      } else if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        setError('Supabase backend se connect nahi ho pa raha hai. Internet connection aur Project URL check karein.');
      } else {
        setError(err?.message || 'Authentication error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test and Save Supabase Connection
  const handleSaveAndTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingConn(true);
    setTestResult(null);
    setError('');

    try {
      saveSupabaseCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.connected) {
        setSuccessMsg('Supabase credentials successfully saved & verified!');
        setUseFallbackPasscode(false);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        tablesFound: false,
        message: err?.message || 'Could not connect to Supabase.',
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-roboto">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border border-gray-200"
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
            Admin Authentication
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Supabase Cloud Auth • Only verified admin can edit blog & profile
          </p>
        </div>

        {/* Tabs: Sign In / Database Setup */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-[#00acc1] text-[#00acc1]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Admin Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('database');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-[#00acc1] text-[#00acc1]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database size={14} />
            <span>Supabase Settings</span>
          </button>
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

        {activeTab === 'login' ? (
          /* TAB 1: ADMIN LOGIN FORM */
          <div>
            {!useFallbackPasscode ? (
              <form onSubmit={handleSupabaseLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter Supabase account password"
                      className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
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
                  disabled={isSubmitting || !email.trim() || !password.trim()}
                  className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  <span>{isSubmitting ? 'Verifying with Supabase...' : 'Log In as Admin'}</span>
                </button>

                <div className="pt-2 text-center space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUseFallbackPasscode(true);
                      setFallbackPasscode('admin123');
                      setError('');
                    }}
                    className="text-xs text-[#00acc1] hover:underline font-semibold cursor-pointer block mx-auto"
                  >
                    🔑 Password bhul gaye? Master passcode (admin123) se login karein
                  </button>
                  <p className="text-[10px] text-gray-400">
                    Supabase user password reset karne ke liye: Supabase Dashboard ➔ Authentication ➔ Users me jakar 3 dots (...) par click karein.
                  </p>
                </div>
              </form>
            ) : (
              /* Initial Setup Passcode Fallback */
              <form onSubmit={handleSupabaseLogin} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed">
                  <strong>Master Setup Passcode:</strong> Agar aap Supabase account password bhul gaye hain ya setup abhi chal raha hai, to default passcode hai: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">admin123</code>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Setup Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={fallbackPasscode}
                      onChange={(e) => setFallbackPasscode(e.target.value)}
                      placeholder="admin123"
                      className="w-full text-xs px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
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
                  disabled={isSubmitting || !fallbackPasscode.trim()}
                  className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound size={16} />
                  <span>{isSubmitting ? 'Verifying...' : 'Unlock with Setup Passcode'}</span>
                </button>

                <div className="pt-2 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('blog_admin_sec_hash_v3');
                      setFallbackPasscode('admin123');
                      setSuccessMsg('Passcode reset ho gaya hai: admin123');
                    }}
                    className="text-[11px] text-gray-500 hover:text-[#00acc1] hover:underline cursor-pointer"
                  >
                    Passcode reset karna hai? Default (admin123) karein
                  </button>

                  {isSupabaseConfigured() && (
                    <button
                      type="button"
                      onClick={() => setUseFallbackPasscode(false)}
                      className="text-[11px] text-[#00acc1] hover:underline cursor-pointer font-medium"
                    >
                      ← Back to Supabase Email & Password Login
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          /* TAB 2: SUPABASE DATABASE CONFIGURATION & CONNECTION TESTER */
          <form onSubmit={handleSaveAndTestConnection} className="space-y-3.5">
            <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="font-bold text-gray-800">Supabase Connection: </span>
              Apne Supabase project ka <strong>Project URL</strong> aur <strong>anon public key</strong> yahan paste karein. (Service Role key kabhi paste na karein).
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Supabase Project URL ya Project ID
              </label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co ya sirf Project ID (e.g. xyz)"
                className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Aap full URL (`https://xyz.supabase.co`) ya sirf apna **Project ID** bhi paste kar sakte hain.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Supabase Anon Public Key (anon public)
              </label>
              <textarea
                rows={3}
                required
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs font-mono px-3 py-2 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Use ONLY the `anon` `public` key. Never expose the `service_role` secret key.
              </span>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded text-xs border ${
                  testResult.connected && testResult.tablesFound
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : testResult.connected && !testResult.tablesFound
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-start gap-1.5 font-medium">
                  {testResult.connected && testResult.tablesFound ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0 text-amber-600 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            {/* SQL Copy Card */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Supabase Database SQL Schema
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Tables (`posts`, `author_profile`, `comments`) banane ke liye script copy karein:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded transition cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>
              <div className="text-[11px] text-gray-500 bg-white p-2 rounded border border-gray-100 leading-normal">
                <strong>Kaise karein:</strong> Supabase Dashboard kholiye ➔ Left menu se <strong>SQL Editor</strong> par click karein ➔ <strong>New query</strong> me paste karke green <strong>Run</strong> button dabayein.
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isTestingConn || !supabaseUrl.trim() || !supabaseAnonKey.trim()}
                className="w-full py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isTestingConn ? 'animate-spin' : ''} />
                <span>{isTestingConn ? 'Testing Connection...' : 'Save & Test Connection'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

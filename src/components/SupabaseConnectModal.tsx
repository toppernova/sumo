import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  CloudUpload,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Power,
  Zap,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  isManuallyDisconnected,
  disconnectSupabase,
  reconnectSupabase,
  getSupabaseProjectRef,
  testSupabaseConnection,
  syncLocalDataToSupabase,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';
import { BlogPost, AuthorProfile, SiteSettings } from '../data/blogData';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPost[];
  profile: AuthorProfile;
  settings: SiteSettings;
  onConnectedRefresh: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  posts,
  profile,
  settings,
  onConnectedRefresh,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    tablesFound: boolean;
    message: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [projectRef, setProjectRef] = useState('');

  const isConnected = isSupabaseConfigured();
  const manuallyDisconnected = isManuallyDisconnected();

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setProjectRef(getSupabaseProjectRef());
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        connected: false,
        tablesFound: false,
        message: 'Kripya Supabase URL aur Anon Public Key dono enter karein.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Save and reconnect
    saveSupabaseCredentials(url.trim(), key.trim());
    setProjectRef(getSupabaseProjectRef());

    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);

    if (result.connected) {
      onConnectedRefresh();
    }
  };

  const handleDisconnect = () => {
    const confirm = window.confirm(
      'Kya aap sach me Supabase Cloud connection disconnect karna chahte hain?\n\nDisconnect hone ke baad blog local storage mode me chala jayega, jab tak aap dobara "Reconnect" nahi dabate.'
    );
    if (!confirm) return;

    disconnectSupabase();
    setTestResult(null);
    setSyncResult(null);
    onConnectedRefresh();
  };

  const handleReconnect = () => {
    reconnectSupabase(url.trim() || undefined, key.trim() || undefined);
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setKey(creds.key);
    setProjectRef(getSupabaseProjectRef());
    setTestResult(null);
    setSyncResult(null);
    onConnectedRefresh();
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncLocalDataToSupabase(posts, profile, settings);
    setIsSyncing(false);
    if (res.success) {
      setSyncResult(`Safalta! ${res.count} blog posts aur author profile Supabase Cloud database me sync ho gaye hain.`);
      onConnectedRefresh();
    } else {
      setSyncResult(`Sync adhura raha: ${res.error || 'Database tables check karein'}`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-emerald-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/90 rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Database size={18} />
            </div>
            <div>
              <h2 id="supabase-title" className="text-base font-bold text-gray-900">
                Supabase Cloud Database Settings
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-semibold text-gray-700">
                  {isConnected ? 'Permanently Connected (Always Active)' : 'Disconnected (Offline Mode)'}
                </span>
                {projectRef && (
                  <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                    ID: {projectRef}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 grow">
          {/* Permanent Connection Guarantee Banner */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-md text-xs text-emerald-950 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 mb-0.5">
                Permanent Cloud Connection System:
              </p>
              <p className="text-emerald-800 text-[11px] leading-normal">
                Website aur Supabase ka connection ab <strong>permanently active</strong> rehta hai. Jab tak Admin khud se neeche <em>'Disconnect'</em> button nahi dabata, tab tak browser refresh, tab band karne ya new device me kholne par bhi connection kabhi nahi hatega.
              </p>
            </div>
          </div>

          {/* If Disconnected, prominent Reconnect Banner */}
          {manuallyDisconnected && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Cloud Connection Disconnected
                </p>
                <p className="text-[11px] text-amber-700">
                  Aapne connection manually band kiya tha. Wapas cloud activate karne ke liye reconnect karein.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReconnect}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs transition cursor-pointer shrink-0"
              >
                <Zap size={14} />
                <span>Reconnect Now</span>
              </button>
            </div>
          )}

          {/* Form Credentials */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://fwyuvemoesinkpjitjbf.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-300 rounded font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="sb_publishable_... ya eyJhbGci..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-300 rounded font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons: Test, Reconnect, Disconnect */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isTesting ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>{isTesting ? 'Verifying...' : 'Save & Verify Connection'}</span>
              </button>

              {isConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  title="Disconnect cloud database (switches to local mode)"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                >
                  <Power size={13} />
                  <span>Disconnect</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReconnect}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded transition cursor-pointer"
                >
                  <Zap size={13} />
                  <span>Reconnect</span>
                </button>
              )}
            </div>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-medium"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Test Feedback Message */}
          {testResult && (
            <div
              className={`p-3.5 rounded-md text-xs flex flex-col gap-2 ${
                testResult.connected
                  ? testResult.tablesFound
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-300'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.connected ? (
                  testResult.tablesFound ? (
                    <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message}</span>
              </div>

              {testResult.connected && !testResult.tablesFound && (
                <div className="mt-1 flex items-center justify-between bg-white/80 p-2.5 rounded border border-amber-200">
                  <span className="text-[11px] font-medium text-amber-900">
                    Tables banana zaroori hai. Ek click me SQL script copy karein:
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition cursor-pointer shrink-0"
                  >
                    {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Migration Tool: Sync Current Posts to Supabase Cloud */}
          {isConnected && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Sync Posts & Profile to Cloud
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Aapke {posts.length} blog posts aur author profile ko permanently Supabase database me sync karein.
                  </p>
                </div>
                <button
                  onClick={handleSyncToCloud}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-semibold rounded transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <CloudUpload size={14} />
                  <span>{isSyncing ? 'Syncing...' : 'Upload All / Sync'}</span>
                </button>
              </div>

              {syncResult && (
                <div
                  className={`p-2.5 rounded text-xs ${
                    syncResult.startsWith('Safalta')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {syncResult}
                </div>
              )}
            </div>
          )}

          {/* SQL Schema Copy Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Complete Supabase SQL Schema (Tables + Storage + RLS)
                </p>
                <p className="text-[11px] text-gray-500">
                  Supabase ke <strong>SQL Editor</strong> me paste karke <strong>Run</strong> daba dein. Saari tables aur upload policies ek saath ban jayengi.
                </p>
              </div>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded transition cursor-pointer shrink-0 shadow-xs"
              >
                {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/90 flex items-center justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

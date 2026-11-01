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
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
  getSupabaseClient,
  syncLocalDataToSupabase,
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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();

  const handleTestConnection = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Temporarily save
    saveSupabaseCredentials(url.trim(), key.trim());
    const client = getSupabaseClient();

    if (!client) {
      setTestResult({ success: false, message: 'Invalid URL format or credentials.' });
      setIsTesting(false);
      return;
    }

    try {
      const { data, error } = await client.from('posts').select('id').limit(1);
      if (error) {
        if (error.message.includes('relation "public.posts" does not exist')) {
          setTestResult({
            success: false,
            message: 'Connected to Supabase, but the "posts" table is missing! Please run the SQL schema first.',
          });
        } else {
          setTestResult({ success: false, message: `Error: ${error.message}` });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Connected successfully to Supabase Database!',
        });
        onConnectedRefresh();
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setKey('');
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
      setSyncResult(`Successfully migrated ${res.count} posts & profile to Supabase!`);
      onConnectedRefresh();
    } else {
      setSyncResult(`Sync failed: ${res.error || 'Check table schema'}`);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- Supabase Schema for Blogger
create table if not exists public.posts (
  id text primary key,
  title text default '',
  published text not null,
  updated text not null,
  content text not null,
  snippet text not null,
  author_name text default '',
  author_title text default '',
  author_avatar text default '',
  url text default '',
  initial_comment_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.author_profile (
  id text primary key default 'main_profile',
  name text default '',
  full_title text default '',
  avatar text default '',
  bio text default '',
  district text default '',
  education jsonb default '[]'::jsonb,
  current_role text default '',
  research_interests jsonb default '[]'::jsonb,
  blogger_profile_url text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.site_settings (
  id text primary key default 'main_settings',
  site_title text default 'Motivation, Education and Research',
  tagline text default '',
  header_bg_image text default '/ocean-header.jpg',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.comments (
  id text primary key,
  post_id text references public.posts(id) on delete cascade,
  author text not null,
  avatar text default '',
  date text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;
alter table public.author_profile enable row level security;
alter table public.site_settings enable row level security;
alter table public.comments enable row level security;

create policy "public_read_posts" on public.posts for select using (true);
create policy "public_write_posts" on public.posts for all using (true);
create policy "public_profile" on public.author_profile for all using (true);
create policy "public_settings" on public.site_settings for all using (true);
create policy "public_comments" on public.comments for all using (true);
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-emerald-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80 rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h2 id="supabase-title" className="text-base font-bold text-gray-900">
                Supabase Cloud Database
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] font-medium text-gray-500">
                  {isConnected ? 'Connected to Supabase' : 'Offline / Local Storage Mode'}
                </span>
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
          {/* Quick Notice */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-md text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Connect your free Supabase PostgreSQL database:</span> Enter your project credentials below or set <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">VITE_SUPABASE_URL</code> in Vercel.
          </div>

          {/* Form */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
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
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-gray-300 rounded font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Test & Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isTesting ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>{isTesting ? 'Connecting...' : 'Test & Connect'}</span>
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-red-600 transition cursor-pointer"
                >
                  Disconnect
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
              className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Migration tool */}
          {isConnected && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Sync Current Posts to Supabase Cloud
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Upload your current {posts.length} blog posts and author profile to Supabase.
                  </p>
                </div>
                <button
                  onClick={handleSyncToCloud}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-semibold rounded transition cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload size={14} />
                  <span>{isSyncing ? 'Syncing...' : 'Upload All'}</span>
                </button>
              </div>

              {syncResult && (
                <p className="text-xs font-medium text-emerald-700 mt-1">
                  {syncResult}
                </p>
              )}
            </div>
          )}

          {/* SQL Schema Copy Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Supabase SQL Migration Schema
              </p>
              <p className="text-[11px] text-gray-500">
                Copy and paste into your Supabase SQL Editor to create all required tables.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded transition cursor-pointer shrink-0"
            >
              {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

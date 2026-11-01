import React, { useState } from 'react';
import {
  X,
  Triangle,
  Database,
  GitBranch,
  Rocket,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupabaseConnect: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  onOpenSupabaseConnect,
}) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  if (!isOpen) return null;

  const envTemplate = `VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"`;

  const gitCommands = `git init
git add .
git commit -m "Deploy blog to Vercel with Supabase"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const copyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-900 text-white rounded-t-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center border border-gray-700">
              <Triangle size={16} className="fill-white" />
            </div>
            <div>
              <h2 id="deploy-modal-title" className="text-base font-bold">
                Deploy to Vercel & Supabase
              </h2>
              <p className="text-[11px] text-gray-400">
                Step-by-step instructions to take your website live with cloud database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-gray-400 hover:text-white rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow">
          {/* Step 1: Supabase */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-2 grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Set Up Your Supabase Cloud Database
                  </h3>
                </div>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>supabase.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Create a free project on Supabase. Go to <strong>SQL Editor</strong>, paste and run the provided <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">supabase-schema.sql</code> file to create your tables.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSupabaseConnect();
                }}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-semibold"
              >
                <span>View & Copy SQL Schema in Supabase Connect Modal →</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Step 2: GitHub */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-2 grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-gray-800" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Push Project to GitHub
                  </h3>
                </div>
                <button
                  onClick={copyGit}
                  className="text-xs text-gray-600 hover:text-black flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedGit ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedGit ? 'Copied Git commands!' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="text-[11px] p-3 bg-gray-900 text-gray-200 rounded font-mono overflow-x-auto leading-relaxed">
                {gitCommands}
              </pre>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Step 3: Vercel */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-2.5 grow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket size={16} className="text-gray-900" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Import to Vercel & Add Environment Variables
                  </h3>
                </div>
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-black hover:underline flex items-center gap-1 font-medium"
                >
                  <span>vercel.com/new</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                In Vercel, click <strong>Add New Project</strong> &rarr; <strong>Import</strong> your GitHub repository. The Framework Preset will automatically detect <strong>Vite</strong> with <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">vercel.json</code>.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Add Environment Variables in Vercel:
                  </span>
                  <button
                    onClick={copyEnv}
                    className="text-xs text-gray-600 hover:text-black flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedEnv ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedEnv ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-800 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                  {envTemplate}
                </pre>
                <p className="text-[11px] text-gray-500">
                  Where to find these in Supabase: <strong>Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL & anon key</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Step 4: Finished */}
          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">4. Click Deploy!</span>
              <span>
                Vercel will build and deploy your blog with continuous deployment. Whenever you write or edit posts, they will be saved directly into your Supabase cloud PostgreSQL database!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-lg">
          <span className="text-xs text-gray-500">
            Pre-configured with <code className="font-mono text-gray-700">vercel.json</code> & <code className="font-mono text-gray-700">@supabase/supabase-js</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

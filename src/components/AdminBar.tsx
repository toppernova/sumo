import React, { useRef } from 'react';
import {
  Plus,
  User,
  Settings,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Database,
  Triangle,
  Sparkles,
} from 'lucide-react';

interface AdminBarProps {
  onNewPost: () => void;
  onEditProfile: () => void;
  onSiteSettings: () => void;
  onClearToEmpty: () => void;
  onLoadDemoData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  isSupabaseConnected: boolean;
  onOpenSupabase: () => void;
  onOpenVercelDeploy: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  onNewPost,
  onEditProfile,
  onSiteSettings,
  onClearToEmpty,
  onLoadDemoData,
  onExportData,
  onImportData,
  isSupabaseConnected,
  onOpenSupabase,
  onOpenVercelDeploy,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gray-950 text-white text-xs border-b border-gray-800 shadow-lg sticky top-0 z-40 font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Toolbar Label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white bg-[#00acc1] px-2.5 py-1 rounded text-[11px] uppercase tracking-wide shadow-xs">
            <Sparkles size={13} />
            <span>Blog Controls</span>
          </div>
          <span className="text-[11px] text-gray-400 hidden md:inline">
            Editable Website & Deployment Tools
          </span>
        </div>

        {/* Center: Main Creation & Integration Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Post Button */}
          <button
            onClick={onNewPost}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white font-semibold rounded text-xs transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>+ New Post</span>
          </button>

          {/* Edit Profile Button */}
          <button
            onClick={onEditProfile}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded text-xs transition border border-gray-700 cursor-pointer"
          >
            <User size={13} className="text-[#00acc1]" />
            <span>Edit Profile</span>
          </button>

          {/* Site Settings Button */}
          <button
            onClick={onSiteSettings}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded text-xs transition border border-gray-700 cursor-pointer"
          >
            <Settings size={13} className="text-[#00acc1]" />
            <span>Site Title</span>
          </button>

          {/* Supabase Cloud Connection Button */}
          <button
            onClick={onOpenSupabase}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded text-xs transition border border-gray-700 cursor-pointer"
            title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Click to connect Supabase Cloud Database'}
          >
            <Database size={13} className="text-emerald-400" />
            <span>Supabase</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Vercel Deploy Guide Button */}
          <button
            onClick={onOpenVercelDeploy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black hover:bg-gray-800 text-white font-semibold rounded text-xs transition border border-gray-700 cursor-pointer shadow-xs"
            title="Step-by-step Vercel + Supabase deployment instructions"
          >
            <Triangle size={12} className="fill-white" />
            <span>Deploy</span>
          </button>
        </div>

        {/* Right: Data Export/Import, Empty Reset, and Demo */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            title="Download blog backup JSON"
            className="inline-flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer text-[11px]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import/Restore blog data JSON"
            className="inline-flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer text-[11px]"
          >
            <Upload size={13} />
            <span className="hidden sm:inline">Restore</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Reset to Empty Button */}
          <button
            onClick={onClearToEmpty}
            title="Clear all details and start fresh with empty fields"
            className="inline-flex items-center gap-1 text-[11px] text-red-300 hover:text-white bg-red-950/60 hover:bg-red-800 px-2.5 py-1 rounded transition cursor-pointer border border-red-800/60 ml-1"
          >
            <Trash2 size={12} />
            <span>Empty Details</span>
          </button>

          {/* Load Demo button */}
          <button
            onClick={onLoadDemoData}
            title="Load original sample demo blog data"
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 px-2 py-1 rounded transition cursor-pointer ml-0.5 hover:bg-gray-800"
          >
            <RotateCcw size={11} />
            <span>Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};


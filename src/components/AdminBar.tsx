import React, { useRef } from 'react';
import {
  Plus,
  User,
  Settings,
  Download,
  Upload,
  Sparkles,
  LogOut,
  ShieldCheck,
  KeyRound,
  Database,
} from 'lucide-react';

interface AdminBarProps {
  isSupabaseConnected?: boolean;
  onOpenDatabase?: () => void;
  onNewPost: () => void;
  onEditProfile: () => void;
  onSiteSettings: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onLogout: () => void;
  onChangePasscode: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  isSupabaseConnected = false,
  onOpenDatabase,
  onNewPost,
  onEditProfile,
  onSiteSettings,
  onExportData,
  onImportData,
  onLogout,
  onChangePasscode,
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
        {/* Left: Toolbar Label with Admin Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white bg-[#00acc1] px-2.5 py-1 rounded text-[11px] uppercase tracking-wide shadow-xs">
            <Sparkles size={13} />
            <span>Admin Controls</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Active</span>
          </div>
        </div>

        {/* Center: Admin Edit Actions */}
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

          {/* Site Title Button */}
          <button
            onClick={onSiteSettings}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded text-xs transition border border-gray-700 cursor-pointer"
          >
            <Settings size={13} className="text-[#00acc1]" />
            <span>Site Title</span>
          </button>

          {/* Supabase Cloud Database & Sync Button */}
          {onOpenDatabase && (
            <button
              onClick={onOpenDatabase}
              title="Supabase Cloud Database & Data Sync"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-medium rounded text-xs transition border cursor-pointer ${
                isSupabaseConnected
                  ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-gray-800 border-gray-700 text-amber-300 hover:bg-gray-700'
              }`}
            >
              <Database size={13} className={isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{isSupabaseConnected ? 'Cloud: Active' : 'Connect Cloud'}</span>
            </button>
          )}
        </div>

        {/* Right: Data Export/Import, Security Passcode, and Logout */}
        <div className="flex items-center gap-2">
          {/* Backup Button */}
          <button
            onClick={onExportData}
            title="Download blog backup JSON"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-gray-300 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer text-[11px] border border-gray-800"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Restore Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import/Restore blog data JSON"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-gray-300 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer text-[11px] border border-gray-800"
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

          {/* Security / Change Passcode Button */}
          <button
            onClick={onChangePasscode}
            title="Manage security & change admin passcode"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-gray-300 hover:text-[#00acc1] rounded hover:bg-gray-800 transition cursor-pointer text-[11px] border border-gray-800"
          >
            <KeyRound size={12} />
            <span className="hidden md:inline">Security</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Lock and exit admin mode"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white rounded transition cursor-pointer text-[11px] border border-red-800/60 font-semibold"
          >
            <LogOut size={12} />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

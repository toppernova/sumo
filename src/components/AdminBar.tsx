import React, { useRef } from 'react';
import { Plus, User, Settings, Edit3, RotateCcw, Download, Upload } from 'lucide-react';

interface AdminBarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onNewPost: () => void;
  onEditProfile: () => void;
  onSiteSettings: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  isEditMode,
  onToggleEditMode,
  onNewPost,
  onEditProfile,
  onSiteSettings,
  onResetData,
  onExportData,
  onImportData,
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
    <div className="bg-gray-900 text-white text-xs border-b border-gray-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Edit Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white bg-[#00acc1] px-2.5 py-1 rounded text-[11px] uppercase tracking-wide">
            <Edit3 size={13} />
            <span>Blog Editor</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEditMode}
              onChange={onToggleEditMode}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-[#00acc1] relative"></div>
            <span className="text-[11px] text-gray-300 font-medium">
              {isEditMode ? 'Edit Mode Active' : 'Viewer Mode'}
            </span>
          </label>
        </div>

        {/* Center: Action Buttons */}
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
            <span>Site Title & Banner</span>
          </button>
        </div>

        {/* Right: Data Export/Import & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            title="Download your blog backup JSON"
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import/Restore blog data JSON"
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition cursor-pointer"
          >
            <Upload size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onResetData}
            title="Reset to default original Sulekh blog data"
            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-800/80 transition cursor-pointer ml-1"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

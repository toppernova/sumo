import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter, Edit2 } from 'lucide-react';
import { AuthorProfile, BlogPost } from '../data/blogData';
import { getArchiveGroups, ArchiveGroup } from '../utils/blogUtils';

interface SidebarProps {
  posts: BlogPost[];
  profile: AuthorProfile;
  selectedArchive: string;
  onSelectArchive: (archiveKey: string) => void;
  onOpenProfile: () => void;
  onEditProfile: () => void;
  onOpenReportAbuse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isEditMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  posts,
  profile,
  selectedArchive,
  onSelectArchive,
  onOpenProfile,
  onEditProfile,
  onOpenReportAbuse,
  isMobileOpen,
  onCloseMobile,
  isEditMode,
}) => {
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);
  const [showAllArchive, setShowAllArchive] = useState(false);

  const archiveGroups: ArchiveGroup[] = getArchiveGroups(posts);
  const visibleArchiveGroups = showAllArchive ? archiveGroups : archiveGroups.slice(0, 8);

  const sidebarContent = (
    <div className="flex flex-col space-y-6 text-[#757575] font-roboto relative">
      {/* Profile Widget */}
      <div className="flex flex-col items-center text-center relative group">
        {/* Quick Edit Profile Button */}
        {isEditMode && (
          <button
            onClick={onEditProfile}
            title="Edit Author Profile & Photo"
            className="absolute top-0 right-0 p-1.5 bg-gray-100 hover:bg-[#00acc1] hover:text-white rounded-full text-gray-600 transition shadow-xs cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
        )}

        {/* Circular Avatar */}
        <div
          onClick={onOpenProfile}
          className="w-28 h-28 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-gray-50 mb-4 cursor-pointer hover:opacity-90 transition"
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/author-profile.png';
            }}
          />
        </div>

        {/* Author Name */}
        <h2 className="text-sm font-bold text-[#212121] uppercase tracking-wide leading-snug px-1">
          {profile.name}
        </h2>
        {/* Subtitle / Designation */}
        {profile.fullTitle && profile.fullTitle !== profile.name && (
          <p className="text-[11px] font-semibold text-[#00acc1] uppercase tracking-wide mt-1 px-1">
            {profile.fullTitle}
          </p>
        )}

        {/* Bio paragraph */}
        <p className="mt-3 text-xs leading-relaxed text-[#757575] px-1 font-light text-justify sm:text-center">
          {profile.bio}
        </p>

        {/* Buttons: Visit Profile & Edit Profile */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="px-5 py-1.5 rounded-full border border-[#00acc1] text-[#00acc1] hover:bg-[#00acc1]/10 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            VISIT PROFILE
          </button>
          {isEditMode && (
            <button
              onClick={onEditProfile}
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Edit2 size={11} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full border-t border-gray-200/60" />

      {/* Archive Widget */}
      <div className="w-full">
        <button
          onClick={() => setIsArchiveOpen(!isArchiveOpen)}
          className="flex items-center justify-between w-full py-1 text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wide group-hover:text-[#00acc1] transition">
              Archive
            </h3>
            {selectedArchive && (
              <span className="flex items-center gap-1 text-[10px] bg-[#00acc1] text-white px-1.5 py-0.5 rounded-full">
                <Filter size={10} /> Active
              </span>
            )}
          </div>
          {isArchiveOpen ? (
            <ChevronUp size={18} className="text-[#757575] group-hover:text-[#00acc1] transition" />
          ) : (
            <ChevronDown size={18} className="text-[#757575] group-hover:text-[#00acc1] transition" />
          )}
        </button>

        {isArchiveOpen && (
          <div className="mt-3 space-y-1 pl-1">
            {selectedArchive && (
              <button
                onClick={() => onSelectArchive('')}
                className="text-xs text-[#00acc1] font-semibold hover:underline block mb-2 cursor-pointer"
              >
                ← View all posts
              </button>
            )}

            <ul className="space-y-1.5 text-xs">
              {visibleArchiveGroups.map((group) => {
                const isSelected = selectedArchive === group.key;
                return (
                  <li key={group.key}>
                    <button
                      onClick={() => onSelectArchive(isSelected ? '' : group.key)}
                      className={`flex items-center justify-between w-full py-1 px-1.5 rounded text-left transition cursor-pointer ${
                        isSelected
                          ? 'text-[#00acc1] font-bold bg-[#00acc1]/10'
                          : 'text-[#616161] hover:text-[#00acc1]'
                      }`}
                    >
                      <span>{group.label}</span>
                      <span className="text-[11px] text-gray-400 font-mono ml-2">
                        {group.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {archiveGroups.length > 8 && (
              <button
                onClick={() => setShowAllArchive(!showAllArchive)}
                className="mt-3 text-xs text-[#00acc1] hover:underline font-medium cursor-pointer"
              >
                {showAllArchive ? 'Show less' : `Show more (${archiveGroups.length - 8} more)`}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-full border-t border-gray-200/60" />

      {/* Report Abuse Link */}
      <div>
        <button
          onClick={onOpenReportAbuse}
          className="text-xs text-[#00acc1] hover:underline cursor-pointer"
        >
          Report Abuse
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left side, fixed width in grid) */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white/95 backdrop-blur-xs p-6 shadow-xs border-r border-teal-100/50 self-start sticky top-14 rounded-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-slide-right">
            <div>
              <div className="flex justify-end mb-2">
                <button
                  onClick={onCloseMobile}
                  aria-label="Close sidebar menu"
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

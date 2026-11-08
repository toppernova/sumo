import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Edit2,
  Lock,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Github,
  Globe,
  Mail,
} from 'lucide-react';
import { AuthorProfile, BlogPost } from '../data/blogData';
import { getArchiveGroups, ArchiveGroup, formatSocialUrl } from '../utils/blogUtils';

interface SidebarProps {
  posts: BlogPost[];
  profile: AuthorProfile;
  selectedArchive: string;
  onSelectArchive: (archiveKey: string) => void;
  onOpenProfile: () => void;
  onEditProfile: () => void;
  onOpenReportAbuse: () => void;
  onOpenAdminLogin: () => void;
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
  onOpenAdminLogin,
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
        {/* Quick Edit Profile Button - Only visible in Admin Mode */}
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
          onClick={isEditMode ? (profile.name ? onOpenProfile : onEditProfile) : onOpenProfile}
          className="w-28 h-28 rounded-full overflow-hidden shadow-sm border-2 border-[#00acc1]/20 bg-gray-50 mb-4 cursor-pointer hover:opacity-90 hover:border-[#00acc1] transition flex items-center justify-center group/avatar"
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name || 'Author'}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
              <span className="text-3xl font-light">👤</span>
              {isEditMode && (
                <span className="text-[10px] text-[#00acc1] font-semibold mt-1 group-hover/avatar:underline">
                  Add Photo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Author Name */}
        <h2
          onClick={isEditMode ? (profile.name ? onOpenProfile : onEditProfile) : onOpenProfile}
          className="text-sm font-bold text-[#212121] uppercase tracking-wide leading-snug px-1 cursor-pointer hover:text-[#00acc1] transition"
        >
          {profile.name || (
            <span className="text-gray-400 italic">{isEditMode ? 'Your Name' : 'Author'}</span>
          )}
        </h2>
        {/* Subtitle / Designation */}
        {profile.fullTitle ? (
          <p className="text-[11px] font-semibold text-[#00acc1] uppercase tracking-wide mt-1 px-1">
            {profile.fullTitle}
          </p>
        ) : isEditMode ? (
          <p
            onClick={onEditProfile}
            className="text-[11px] text-gray-400 italic mt-0.5 px-1 cursor-pointer hover:text-[#00acc1]"
          >
            (Add your title / designation)
          </p>
        ) : null}

        {/* Bio paragraph */}
        <p
          onClick={isEditMode && !profile.bio ? onEditProfile : undefined}
          className={`mt-3 text-xs leading-relaxed text-[#757575] px-1 font-light text-justify sm:text-center ${
            isEditMode && !profile.bio ? 'cursor-pointer hover:text-gray-900' : ''
          }`}
        >
          {profile.bio || (
            <span className="text-gray-400 italic">
              {isEditMode
                ? "Click 'Edit' to enter your bio, education, and district details."
                : 'Welcome to our blog and research space.'}
            </span>
          )}
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

        {/* Social Media Links Widget - ONLY SHOWS LINKS ADDED BY ADMIN */}
        {profile.socialLinks && Object.values(profile.socialLinks).some((v) => Boolean(v && v.trim())) && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center flex-wrap gap-2 w-full px-2">
            {profile.socialLinks.instagram && (
              <a
                href={formatSocialUrl('instagram', profile.socialLinks.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Instagram size={14} />
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a
                href={formatSocialUrl('twitter', profile.socialLinks.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter / X"
                className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Twitter size={14} />
              </a>
            )}
            {profile.socialLinks.facebook && (
              <a
                href={formatSocialUrl('facebook', profile.socialLinks.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Facebook size={14} />
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={formatSocialUrl('linkedin', profile.socialLinks.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Linkedin size={14} />
              </a>
            )}
            {profile.socialLinks.youtube && (
              <a
                href={formatSocialUrl('youtube', profile.socialLinks.youtube)}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                className="w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Youtube size={14} />
              </a>
            )}
            {profile.socialLinks.whatsapp && (
              <a
                href={formatSocialUrl('whatsapp', profile.socialLinks.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <MessageCircle size={14} />
              </a>
            )}
            {profile.socialLinks.telegram && (
              <a
                href={formatSocialUrl('telegram', profile.socialLinks.telegram)}
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className="w-7 h-7 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Send size={14} />
              </a>
            )}
            {profile.socialLinks.github && (
              <a
                href={formatSocialUrl('github', profile.socialLinks.github)}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-800 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Github size={14} />
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={formatSocialUrl('website', profile.socialLinks.website)}
                target="_blank"
                rel="noopener noreferrer"
                title="Website / Portfolio"
                className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 hover:bg-[#00acc1] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Globe size={14} />
              </a>
            )}
            {profile.socialLinks.email && (
              <a
                href={formatSocialUrl('email', profile.socialLinks.email)}
                title="Email"
                className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
              >
                <Mail size={14} />
              </a>
            )}
          </div>
        )}
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

      {/* Report Abuse & Discreet Admin Link */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={onOpenReportAbuse}
          className="text-xs text-[#00acc1] hover:underline cursor-pointer"
        >
          Report Abuse
        </button>

        {!isEditMode ? (
          <button
            onClick={onOpenAdminLogin}
            className="text-[11px] text-gray-400 hover:text-[#00acc1] flex items-center gap-1 transition cursor-pointer"
            title="Administrator Sign-in"
          >
            <Lock size={11} />
            <span>Admin</span>
          </button>
        ) : (
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Admin Mode</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left side, fixed width in grid) */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white/95 backdrop-blur-xs p-6 shadow-xs border-r border-teal-100/50 self-start sticky top-14 rounded-sm max-h-[calc(100vh-4.5rem)] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Drawer Overlay (Opens on ANY screen size when hamburger is clicked) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer panel */}
          <div className="relative z-10 w-80 sm:w-88 max-w-[90vw] bg-white h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-slide-right">
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Menu & Profile
                </span>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close sidebar menu"
                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
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

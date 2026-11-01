import React, { useState } from 'react';
import { Menu, Search, X, ArrowLeft, Edit2 } from 'lucide-react';

interface HeaderProps {
  siteTitle: string;
  tagline: string;
  headerBgImage: string;
  isEditMode: boolean;
  onEditHeader: () => void;
  onToggleSidebar: () => void;
  isSinglePostActive: boolean;
  onBackToHome: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteTitle,
  tagline,
  headerBgImage,
  isEditMode,
  onEditHeader,
  onToggleSidebar,
  isSinglePostActive,
  onBackToHome,
  searchQuery,
  onSearchChange,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="relative w-full overflow-hidden shadow-md">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat transition-all duration-500"
        style={{
          backgroundImage: `url('${headerBgImage || '/ocean-header.jpg'}')`,
        }}
      />
      {/* Subtle overlay for text legibility */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Header Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0 flex flex-col justify-between min-h-[260px] md:min-h-[300px]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between w-full h-12">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <Menu size={24} />
            </button>

            {/* Back button when inside single post */}
            {isSinglePostActive && (
              <button
                onClick={onBackToHome}
                aria-label="Back to all posts"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black/25 hover:bg-black/40 rounded-full transition backdrop-blur-xs cursor-pointer"
              >
                <ArrowLeft size={18} />
                <span>Home</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Edit Header Button if Edit Mode is Active */}
            {isEditMode && (
              <button
                onClick={onEditHeader}
                title="Edit Blog Title & Banner"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-xs transition cursor-pointer border border-white/20"
              >
                <Edit2 size={12} />
                <span>Edit Title</span>
              </button>
            )}

            {/* Search Trigger or Expandable Input */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-3 py-1 text-gray-800 transition-all duration-300 w-64 sm:w-80">
                  <Search size={18} className="text-[#00acc1] shrink-0 mr-2" />
                  <input
                    type="text"
                    placeholder="Search this blog..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-500 py-1"
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchOpen(false);
                    }}
                    aria-label="Close search"
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search bar"
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  <Search size={22} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center Title & Subtitle */}
        <div className="text-center px-4 my-auto py-6 group relative">
          <h1
            onClick={onBackToHome}
            className="font-damion text-4xl sm:text-5xl md:text-6xl text-white font-normal tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-pointer hover:opacity-95 transition select-none"
          >
            {siteTitle || 'Motivation, Education and Research'}
          </h1>
          {tagline && (
            <p className="mt-3 text-white/95 text-xs sm:text-sm md:text-base font-light max-w-2xl mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] leading-relaxed font-roboto">
              {tagline}
            </p>
          )}
        </div>

        {/* Bottom Navigation: HOME tab with active underline */}
        <nav className="flex justify-center border-t border-white/20 mt-2">
          <button
            onClick={onBackToHome}
            className="py-2.5 px-6 text-sm font-bold uppercase tracking-widest text-white border-b-2 border-white cursor-pointer transition hover:bg-white/10"
          >
            HOME
          </button>
        </nav>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Upload, Image as ImageIcon, Palette, Check } from 'lucide-react';
import { SiteSettings } from '../data/blogData';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
}

const PRESET_BG_COLORS = [
  { name: 'Default Aqua', hex: '#58c6d5' },
  { name: 'Ocean Cyan', hex: '#00acc1' },
  { name: 'Deep Royal Teal', hex: '#0f766e' },
  { name: 'Slate Navy', hex: '#1e293b' },
  { name: 'Midnight Black', hex: '#0f172a' },
  { name: 'Emerald Forest', hex: '#047857' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Soft Slate', hex: '#334155' },
  { name: 'Subtle Gray', hex: '#e2e8f0' },
];

const PRESET_BANNERS = [
  {
    name: 'Ocean Ripple (Original)',
    url: '/ocean-header.jpg',
  },
  {
    name: 'Golden Sunrise',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
  },
  {
    name: 'Misty Emerald Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80',
  },
  {
    name: 'Deep Blue Galaxy',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&q=80',
  },
];

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [siteTitle, setSiteTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [headerBgImage, setHeaderBgImage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#58c6d5');

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle || '');
      setTagline(settings.tagline || '');
      const rawImg = settings.headerBgImage || '/ocean-header.jpg';
      setHeaderBgImage(rawImg.replace(/#bgcolor=[^&]*/, ''));

      let color = settings.backgroundColor;
      if (!color || color === '#58c6d5') {
        try {
          const savedColor = localStorage.getItem('sulekh_blog_chosen_bg_color');
          if (savedColor) color = savedColor;
        } catch {}
      }
      setBackgroundColor(color || '#58c6d5');
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHeaderBgImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (val: string) => {
    let clean = val.trim();
    if (clean && !clean.startsWith('#') && /^[0-9a-fA-F]{3,8}$/.test(clean)) {
      clean = `#${clean}`;
    }
    setBackgroundColor(clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      siteTitle: siteTitle.trim() || 'Motivation, Education and Research',
      tagline: tagline.trim(),
      headerBgImage: headerBgImage || '/ocean-header.jpg',
      backgroundColor: backgroundColor.trim() || '#58c6d5',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-teal-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00acc1]" />
            <h2 id="site-settings-title" className="text-base font-bold text-gray-800">
              Site Title & Banner Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 grow">
            {/* Banner & Background Live Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Header & Background Live Preview
              </label>
              <div
                className="p-3 rounded-lg border border-gray-300 shadow-inner transition-colors duration-300"
                style={{ backgroundColor: backgroundColor || '#58c6d5' }}
              >
                <div
                  className="h-28 rounded-md overflow-hidden relative p-4 flex flex-col justify-center items-center text-center bg-cover bg-center border border-white/30 shadow-md"
                  style={{ backgroundImage: `url('${headerBgImage}')` }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <h3 className="font-damion text-2xl text-white drop-shadow-md relative z-10">
                    {siteTitle || 'Motivation, Education and Research'}
                  </h3>
                  <p className="text-white/90 text-xs font-light max-w-sm drop-shadow relative z-10 mt-1 line-clamp-1">
                    {tagline || 'Your blog tagline here...'}
                  </p>
                </div>
                <div className="mt-2 mx-auto max-w-xs bg-white/95 backdrop-blur-xs py-1.5 px-3 rounded shadow-xs text-center text-[10px] text-gray-500 font-medium">
                  Page Background: {backgroundColor || '#58c6d5'}
                </div>
              </div>
            </div>

            {/* Background Colour Chooser */}
            <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#00acc1]" />
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Website Background Colour (पृष्ठभूमि रंग कोड)
                  </label>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-800">
                  {backgroundColor || '#58c6d5'}
                </span>
              </div>

              {/* Color picker input + HEX input */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="color"
                    value={backgroundColor.startsWith('#') && backgroundColor.length === 7 ? backgroundColor : '#58c6d5'}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shadow-xs"
                    title="Click to open color picker"
                  />
                </div>
                <div className="grow">
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#58c6d5"
                    className="w-full text-xs font-mono uppercase px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Apna pasandeeda HEX color code enter karein ya left icon par click karke color chunein.
                  </p>
                </div>
              </div>

              {/* Preset Palettes */}
              <div>
                <p className="text-[11px] text-gray-600 font-medium mb-1.5">Preset Color Palettes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_BG_COLORS.map((c) => {
                    const isSelected = backgroundColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setBackgroundColor(c.hex)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full border transition cursor-pointer ${
                          isSelected
                            ? 'border-[#00acc1] bg-teal-50 text-teal-800 font-bold ring-1 ring-[#00acc1]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        {isSelected && <Check size={11} className="text-[#00acc1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Site Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Blog Main Title (Damion Font)
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                required
                placeholder="e.g. Motivation, Education and Research"
                className="w-full text-sm px-3.5 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Blog Subtitle / Tagline
              </label>
              <textarea
                rows={2}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Enter description of your blog..."
                className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            {/* Preset Banners */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Choose Banner Texture
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setHeaderBgImage(preset.url)}
                    className={`relative h-16 rounded overflow-hidden border-2 text-left p-2 transition cursor-pointer group ${
                      headerBgImage === preset.url
                        ? 'border-[#00acc1] ring-2 ring-[#00acc1]/30'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{
                      backgroundImage: `url('${preset.url}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition" />
                    <span className="relative z-10 text-[11px] font-semibold text-white drop-shadow">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Banner Upload or URL */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Custom Banner Image
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded cursor-pointer transition shrink-0">
                  <Upload size={14} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={headerBgImage}
                  onChange={(e) => setHeaderBgImage(e.target.value)}
                  className="grow text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer"
            >
              <Save size={15} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

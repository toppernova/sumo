import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Upload, Image as ImageIcon } from 'lucide-react';
import { SiteSettings } from '../data/blogData';

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
}

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

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle || '');
      setTagline(settings.tagline || '');
      setHeaderBgImage(settings.headerBgImage || '/ocean-header.jpg');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      siteTitle: siteTitle.trim() || 'Motivation, Education and Research',
      tagline: tagline.trim(),
      headerBgImage: headerBgImage || '/ocean-header.jpg',
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
            {/* Banner Live Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Header Live Preview
              </label>
              <div
                className="h-32 rounded-lg overflow-hidden relative p-4 flex flex-col justify-center items-center text-center bg-cover bg-center border border-gray-200 shadow-inner"
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

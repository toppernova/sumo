import React, { useState, useEffect } from 'react';
import { X, Save, Upload, User, Plus, Trash2, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { AuthorProfile } from '../data/blogData';
import { compressImage, uploadImageToSupabaseStorage } from '../utils/imageUtils';
import { isSupabaseConfigured, SUPABASE_STORAGE_SQL } from '../lib/supabase';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AuthorProfile;
  onSave: (updatedProfile: AuthorProfile) => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [fullTitle, setFullTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [district, setDistrict] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [education, setEducation] = useState<Array<{ degree: string; institution?: string; details?: string }>>([]);
  const [researchInput, setResearchInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [copiedStorageSql, setCopiedStorageSql] = useState(false);

  const handleCopyStorageSql = () => {
    navigator.clipboard.writeText(SUPABASE_STORAGE_SQL);
    setCopiedStorageSql(true);
    setTimeout(() => setCopiedStorageSql(false), 2500);
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setFullTitle(profile.fullTitle || '');
      setAvatar(profile.avatar || '');
      setBio(profile.bio || '');
      setDistrict(profile.district || '');
      setCurrentRole(profile.currentRole || '');
      setEducation(profile.education ? [...profile.education] : []);
      setResearchInput(profile.researchInterests ? profile.researchInterests.join(', ') : '');
    }
    setAvatarError('');
    setAvatarSuccess('');
    setIsUploadingAvatar(false);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess('');
    setIsUploadingAvatar(true);

    try {
      // 1. Client-side compression (max 500x500 square for profile avatar, 85% JPEG quality)
      const compressed = await compressImage(file, 500, 500, 0.85);

      // 2. Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setAvatarError(
          'Supabase is not connected yet! Please connect Supabase in Database Settings to upload avatar to cloud, or enter an Image URL below.'
        );
        setIsUploadingAvatar(false);
        return;
      }

      // 3. Upload to Supabase Storage bucket 'blog-images'
      try {
        const publicUrl = await uploadImageToSupabaseStorage(compressed.blob, 'avatars');
        setAvatar(publicUrl);
        setAvatarSuccess(`Avatar uploaded to CDN! (${compressed.compressedSizeKb} KB JPEG)`);
      } catch (uploadErr: any) {
        // Fallback: If cloud RLS is missing, save compressed dataUrl locally so user is not blocked
        setAvatar(compressed.dataUrl);
        setAvatarSuccess(`Avatar photo set locally! (${compressed.compressedSizeKb} KB compressed)`);
        setAvatarError('Cloud upload notice: Supabase Storage Policy run karein agar cloud CDN URL chahiye.');
      }
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to process avatar image.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      { degree: '', institution: '', details: '' },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: string, val: string) => {
    setEducation((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const researchArr = researchInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...profile,
      name: name.trim(),
      fullTitle: fullTitle.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
      district: district.trim(),
      currentRole: currentRole.trim(),
      education: education.filter((e) => e.degree.trim()),
      researchInterests: researchArr,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-teal-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70 rounded-t-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#00acc1]" />
            <h2 id="profile-editor-title" className="text-base font-bold text-gray-800">
              Edit Author Details & Profile
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 grow">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0 flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile preview"
                    className="w-full h-full object-cover object-top"
                    onError={() => {
                      setAvatar('');
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <span className="text-3xl font-light">👤</span>
                    <span className="text-[10px] text-gray-400 mt-1">No Photo</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 grow w-full">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Profile Photo
                </span>
                <div className="flex flex-wrap gap-2">
                  <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-semibold rounded cursor-pointer transition ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload size={14} />
                    <span>{isUploadingAvatar ? 'Optimizing & Uploading...' : 'Upload Your Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingAvatar}
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-gray-300 hover:bg-red-50 rounded transition cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {avatarError && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{avatarError}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                      <button
                        type="button"
                        onClick={handleCopyStorageSql}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded cursor-pointer transition shadow-2xs"
                      >
                        {copiedStorageSql ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedStorageSql ? 'Copied Storage SQL!' : 'Copy Storage SQL Script'}</span>
                      </button>
                      <span className="text-[11px] text-amber-700">
                        (Supabase SQL Editor me paste karke Run karein)
                      </span>
                    </div>
                  </div>
                )}

                {avatarSuccess && (
                  <div className="p-2 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={14} className="text-[#00acc1] shrink-0" />
                    <span>{avatarSuccess}</span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Or enter Image URL (https://...)"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prof. Sulekh Kumar, Er. Rahul Sharma..."
                required
                className="w-full text-sm px-3.5 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            {/* Title / Designation */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Full Title / Designation (Sidebar Header)
              </label>
              <textarea
                rows={2}
                value={fullTitle}
                onChange={(e) => setFullTitle(e.target.value)}
                placeholder="e.g. PROF. SULEKH KUMAR(QUALIFIED UGC NET DEC-2024 & 2025 FOR ASSISTANT PROFESSOR & ADMISSION TO PH.D. IN COMPUTER SCIENCE & APPLICATION)"
                className="w-full text-xs px-3.5 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            {/* Bio Paragraph */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                About / Biography (Displayed on Sidebar)
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter your biography, education details, district, and current teaching or professional role..."
                required
                className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
              />
            </div>

            {/* Current Role & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Current Role / College
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. Assistant Professor, RVS College..."
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  District / Location
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Palamu District, Jharkhand, India"
                  className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                />
              </div>
            </div>

            {/* Academic Degrees & Education */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Degrees & Qualifications
                </label>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="inline-flex items-center gap-1 text-xs text-[#00acc1] hover:underline font-semibold cursor-pointer"
                >
                  <Plus size={14} /> Add Degree
                </button>
              </div>

              <div className="space-y-2">
                {education.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                    <input
                      type="text"
                      placeholder="Degree (e.g. MCA, B.Sc. IT, UGC NET)"
                      value={item.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      className="w-1/3 text-xs p-1.5 bg-white border border-gray-200 rounded"
                    />
                    <input
                      type="text"
                      placeholder="University / Details"
                      value={item.institution || item.details || ''}
                      onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                      className="grow text-xs p-1.5 bg-white border border-gray-200 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="p-1 text-red-500 hover:text-red-700 rounded transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Research & Topics */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Research Interests / Topics (comma-separated)
              </label>
              <input
                type="text"
                value={researchInput}
                onChange={(e) => setResearchInput(e.target.value)}
                placeholder="Computer Science, AI & ML, Positive Motivation, Education..."
                className="w-full text-xs px-3.5 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
              />
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
              <span>Save Author Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

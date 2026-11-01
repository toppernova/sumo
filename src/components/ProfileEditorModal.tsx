import React, { useState, useEffect } from 'react';
import { X, Save, Upload, User, Plus, Trash2 } from 'lucide-react';
import { AuthorProfile } from '../data/blogData';

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
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
      name: name.trim() || 'Author',
      fullTitle: fullTitle.trim(),
      avatar: avatar || '/author-profile.png',
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
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                <img
                  src={avatar}
                  alt="Profile preview"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/author-profile.png';
                  }}
                />
              </div>

              <div className="space-y-2 grow w-full">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Profile Photo
                </span>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-semibold rounded cursor-pointer transition">
                    <Upload size={14} />
                    <span>Upload Your Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setAvatar('/author-profile.png')}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded transition cursor-pointer"
                  >
                    Reset to Default
                  </button>
                </div>
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

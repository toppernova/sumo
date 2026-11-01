import React from 'react';
import { X, GraduationCap, Award, MapPin, Briefcase, BookOpen, ExternalLink, Edit2 } from 'lucide-react';
import { AuthorProfile } from '../data/blogData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AuthorProfile;
  onEdit?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-scale-up border border-teal-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
      >
        {/* Top Header Banner */}
        <div className="h-28 bg-linear-to-r from-[#00acc1] to-[#26c6da] relative p-4 flex justify-between items-start">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit Details</span>
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="w-8 h-8 rounded-full bg-black/20 text-white hover:bg-black/40 flex items-center justify-center transition cursor-pointer ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar floating */}
        <div className="px-6 relative -mt-14 pb-6">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/author-profile.png';
              }}
            />
          </div>

          <div className="mt-3">
            <h2 id="profile-title" className="text-xl font-bold text-gray-900">
              {profile.name}
            </h2>
            {profile.fullTitle && (
              <p className="text-xs font-semibold text-[#00acc1] mt-1 uppercase tracking-wide">
                {profile.fullTitle}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-4 text-sm text-gray-700">
            {profile.currentRole && (
              <div className="flex items-start gap-2.5">
                <Briefcase className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 block">Current Role</span>
                  <span>{profile.currentRole}</span>
                </div>
              </div>
            )}

            {profile.education && profile.education.length > 0 && (
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 block">Academic Qualifications</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-gray-600">
                    {profile.education.map((edu, idx) => (
                      <li key={idx}>
                        <span className="font-medium text-gray-800">{edu.degree}</span>
                        {(edu.institution || edu.details) && (
                          <span className="text-gray-600"> – {edu.institution || edu.details}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {profile.district && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 block">Hometown & Region</span>
                  <span>{profile.district}</span>
                </div>
              </div>
            )}

            {profile.bio && (
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 block">About the Blog & Research</span>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    {profile.bio}
                  </p>
                </div>
              </div>
            )}

            {profile.researchInterests && profile.researchInterests.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Award className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-900 block">Focus Topics</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {profile.researchInterests.map((interest, i) => (
                      <span key={i} className="text-xs bg-teal-50 text-[#00acc1] px-2 py-0.5 rounded-full font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            {profile.bloggerProfileUrl ? (
              <a
                href={profile.bloggerProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00acc1] hover:underline"
              >
                <span>View Blogger Profile</span>
                <ExternalLink size={14} />
              </a>
            ) : <span />}
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  className="px-3 py-1.5 border border-[#00acc1] text-[#00acc1] hover:bg-[#00acc1]/10 text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

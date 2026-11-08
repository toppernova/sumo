import React from 'react';
import {
  X,
  GraduationCap,
  Award,
  MapPin,
  Briefcase,
  BookOpen,
  ExternalLink,
  Edit2,
  Share2,
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
import { AuthorProfile } from '../data/blogData';
import { formatSocialUrl } from '../utils/blogUtils';

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
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
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
              <span className="text-4xl text-gray-400">👤</span>
            )}
          </div>

          <div className="mt-3">
            <h2 id="profile-title" className="text-xl font-bold text-gray-900">
              {profile.name || 'Your Name'}
            </h2>
            {profile.fullTitle ? (
              <p className="text-xs font-semibold text-[#00acc1] mt-1 uppercase tracking-wide">
                {profile.fullTitle}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic mt-0.5">
                (Click 'Edit Details' to set title)
              </p>
            )}
          </div>

          <div className="mt-5 space-y-4 text-sm text-gray-700">
            {!profile.name && !profile.bio && !profile.currentRole && (!profile.education || profile.education.length === 0) && (
              <div className="p-5 bg-teal-50/70 border border-teal-100 rounded-lg text-center space-y-3 my-2">
                <p className="text-sm font-semibold text-gray-800">
                  Profile is currently blank
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Admin can enter their own name, upload a photo, and fill in biography, designation, education degrees, and location.
                </p>
                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit();
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Enter My Profile Details</span>
                  </button>
                )}
              </div>
            )}

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

            {/* Social Media Links - ONLY SHOWS PLATFORMS ADDED BY ADMIN */}
            {profile.socialLinks && Object.values(profile.socialLinks).some((v) => Boolean(v && v.trim())) && (
              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                <Share2 className="w-5 h-5 text-[#00acc1] shrink-0 mt-0.5" />
                <div className="grow">
                  <span className="font-medium text-gray-900 block mb-2">Connect on Social Media</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.socialLinks.instagram && (
                      <a
                        href={formatSocialUrl('instagram', profile.socialLinks.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-pink-50/70 hover:bg-pink-100 text-pink-700 transition text-xs font-medium border border-pink-100 group"
                      >
                        <Instagram size={16} className="text-pink-600 shrink-0" />
                        <span className="truncate">Instagram</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a
                        href={formatSocialUrl('twitter', profile.socialLinks.twitter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-sky-50/70 hover:bg-sky-100 text-sky-700 transition text-xs font-medium border border-sky-100 group"
                      >
                        <Twitter size={16} className="text-sky-500 shrink-0" />
                        <span className="truncate">Twitter / X</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.facebook && (
                      <a
                        href={formatSocialUrl('facebook', profile.socialLinks.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-blue-50/70 hover:bg-blue-100 text-blue-700 transition text-xs font-medium border border-blue-100 group"
                      >
                        <Facebook size={16} className="text-blue-600 shrink-0" />
                        <span className="truncate">Facebook</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a
                        href={formatSocialUrl('linkedin', profile.socialLinks.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-blue-50/70 hover:bg-blue-100 text-blue-800 transition text-xs font-medium border border-blue-200 group"
                      >
                        <Linkedin size={16} className="text-blue-700 shrink-0" />
                        <span className="truncate">LinkedIn</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.youtube && (
                      <a
                        href={formatSocialUrl('youtube', profile.socialLinks.youtube)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-red-50/70 hover:bg-red-100 text-red-700 transition text-xs font-medium border border-red-100 group"
                      >
                        <Youtube size={16} className="text-red-600 shrink-0" />
                        <span className="truncate">YouTube</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.whatsapp && (
                      <a
                        href={formatSocialUrl('whatsapp', profile.socialLinks.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 transition text-xs font-medium border border-emerald-100 group"
                      >
                        <MessageCircle size={16} className="text-emerald-600 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.telegram && (
                      <a
                        href={formatSocialUrl('telegram', profile.socialLinks.telegram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-sky-50/70 hover:bg-sky-100 text-sky-700 transition text-xs font-medium border border-sky-100 group"
                      >
                        <Send size={16} className="text-sky-500 shrink-0" />
                        <span className="truncate">Telegram</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={formatSocialUrl('github', profile.socialLinks.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition text-xs font-medium border border-gray-200 group"
                      >
                        <Github size={16} className="text-gray-800 shrink-0" />
                        <span className="truncate">GitHub</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.website && (
                      <a
                        href={formatSocialUrl('website', profile.socialLinks.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md bg-teal-50/70 hover:bg-teal-100 text-teal-800 transition text-xs font-medium border border-teal-100 group"
                      >
                        <Globe size={16} className="text-teal-700 shrink-0" />
                        <span className="truncate">Website</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.email && (
                      <a
                        href={formatSocialUrl('email', profile.socialLinks.email)}
                        className="flex items-center gap-2 p-2 rounded-md bg-amber-50/70 hover:bg-amber-100 text-amber-800 transition text-xs font-medium border border-amber-100 group"
                      >
                        <Mail size={16} className="text-amber-700 shrink-0" />
                        <span className="truncate">{profile.socialLinks.email.replace(/^mailto:/, '')}</span>
                        <ExternalLink size={12} className="ml-auto opacity-50 group-hover:opacity-100" />
                      </a>
                    )}
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

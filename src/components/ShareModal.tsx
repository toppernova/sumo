import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Twitter, Facebook, Mail } from 'lucide-react';
import { BlogPost } from '../data/blogData';

interface ShareModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const authorName = post.author?.name?.trim() || 'Shruti Kumari';
  const shareTitle = post.title || 'Motivation, Education and Research';
  const shareUrl = `${window.location.origin}?post=${post.id}`;
  const shareText = `${shareTitle} - Blog by ${authorName}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative border border-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 id="share-title" className="text-base font-bold text-gray-800">
            Share this post
          </h3>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {post.title || post.snippet.slice(0, 80) + '...'}
          </p>
          {authorName && <p className="text-xs text-gray-500 mt-1">By {authorName}</p>}
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition shadow-xs ${opt.color}`}
              >
                <Icon size={16} />
                <span>{opt.name}</span>
              </a>
            );
          })}
        </div>

        {/* Copy Link Input */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Post Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="grow px-3 py-2 text-xs border border-gray-200 rounded-md bg-gray-50 text-gray-600 select-all focus:outline-none focus:ring-1 focus:ring-[#00acc1]"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-semibold rounded-md transition shrink-0"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

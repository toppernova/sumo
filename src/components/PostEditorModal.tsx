import React, { useState, useEffect } from 'react';
import { X, Save, Eye, FileText, Quote, Sparkles } from 'lucide-react';
import { BlogPost } from '../data/blogData';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: BlogPost | null;
  onSave: (postData: { id?: string; title: string; content: string; date: string }) => void;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  postToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      // If content has HTML paragraphs, convert to clean readable text for editing
      const cleanContent = postToEdit.content
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p><p>/gi, '\n\n')
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/&nbsp;/g, ' ');
      setContent(cleanContent);
      setDate(postToEdit.published.slice(0, 10));
    } else {
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().slice(0, 10));
    }
    setShowPreview(false);
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSave({
      id: postToEdit ? postToEdit.id : undefined,
      title: title.trim(),
      content: content.trim(),
      date: date || new Date().toISOString(),
    });
    onClose();
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent((prev) => prev + `\n${prefix}\n${suffix}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-teal-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70 rounded-t-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00acc1]" />
            <h2 id="editor-title" className="text-base font-bold text-gray-800">
              {postToEdit ? 'Edit Post' : 'Create New Post'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition cursor-pointer"
            >
              <Eye size={14} />
              <span>{showPreview ? 'Editor' : 'Preview'}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 grow">
            {showPreview ? (
              <div className="space-y-4">
                <div className="p-6 bg-white border border-gray-200 rounded-sm shadow-xs">
                  <div className="text-xs text-[#757575] mb-2 font-mono">
                    - {date || 'Today'}
                  </div>
                  {title && (
                    <h3 className="font-damion text-3xl text-[#212121] my-2 leading-tight">
                      {title}
                    </h3>
                  )}
                  <div className="text-[#555] font-roboto text-sm sm:text-base leading-relaxed whitespace-pre-line mt-3">
                    {content || '(No content yet...)'}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Post Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Post Title <span className="text-gray-400 font-normal lowercase">(optional for short quotes/shayari)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Positive Attitude of Life, Changing is the Rule of Nature..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-sm px-3.5 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
                  />
                </div>

                {/* Quick formatting helper buttons */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Post Content / Story / Quotes
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertFormatting('<blockquote>"Your quote here..."</blockquote>')}
                        className="text-[11px] px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition flex items-center gap-1 cursor-pointer"
                        title="Add Quote"
                      >
                        <Quote size={11} /> Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('Hum bhi dariya hain, humein apna hunar maloom hai;\nJis traf bhi chal padenge, rasta ho jayegi.')}
                        className="text-[11px] px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-[#00acc1] rounded transition flex items-center gap-1 cursor-pointer"
                        title="Add Shayari/Stanza Example"
                      >
                        <Sparkles size={11} /> Shayari
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    placeholder="Write your article, poem, inspirational thoughts, or educational notes here... Use double Enter for paragraphs."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full text-sm p-3.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:border-transparent focus:outline-none resize-y leading-relaxed font-roboto"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Tip: Enter simple text or shayari. Line breaks and paragraphs are preserved automatically.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Action buttons */}
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
              disabled={!content.trim()}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{postToEdit ? 'Save Changes' : 'Publish Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

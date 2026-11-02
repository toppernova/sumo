import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Eye,
  FileText,
  Quote,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Link,
  Plus,
  Trash2,
  CheckCircle2,
  Film,
} from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { extractYouTubeId } from '../utils/blogUtils';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit: BlogPost | null;
  onSave: (postData: {
    id?: string;
    title: string;
    content: string;
    date: string;
    coverImage?: string;
    coverVideo?: string;
  }) => void;
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
  const [coverImage, setCoverImage] = useState<string>('');
  const [coverVideo, setCoverVideo] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Photo tool state
  const [showPhotoTool, setShowPhotoTool] = useState(false);
  const [photoSourceType, setPhotoSourceType] = useState<'upload' | 'url'>('upload');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [previewPhotoData, setPreviewPhotoData] = useState<string>('');

  // Video tool state
  const [showVideoTool, setShowVideoTool] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      setCoverImage(postToEdit.coverImage || '');
      setCoverVideo(postToEdit.coverVideo || '');
    } else {
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().slice(0, 10));
      setCoverImage('');
      setCoverVideo('');
    }
    setShowPreview(false);
    setShowPhotoTool(false);
    setShowVideoTool(false);
    setPhotoUrlInput('');
    setPhotoCaption('');
    setPreviewPhotoData('');
    setVideoUrlInput('');
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !coverImage && !coverVideo) return;

    onSave({
      id: postToEdit ? postToEdit.id : undefined,
      title: title.trim(),
      content: content.trim(),
      date: date || new Date().toISOString(),
      coverImage: coverImage.trim() || undefined,
      coverVideo: coverVideo.trim() || undefined,
    });
    onClose();
  };

  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) {
      setContent((prev) => prev ? `${prev}\n\n${textToInsert}` : textToInsert);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB client check
    if (file.size > 10 * 1024 * 1024) {
      alert('Please choose an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewPhotoData(result);
    };
    reader.readAsDataURL(file);
  };

  // Insert Photo handler
  const handleInsertPhoto = (asCover: boolean = false) => {
    const finalUrl = photoSourceType === 'upload' ? previewPhotoData : photoUrlInput.trim();
    if (!finalUrl) {
      alert('Please select or paste an image first.');
      return;
    }

    if (asCover) {
      setCoverImage(finalUrl);
      setShowPhotoTool(false);
      setPreviewPhotoData('');
      setPhotoUrlInput('');
      setPhotoCaption('');
    } else {
      const captionHtml = photoCaption.trim()
        ? `<figcaption class="text-xs text-center text-gray-500 italic mt-1">${photoCaption.trim()}</figcaption>`
        : '';
      const imageHtml = `\n<figure class="my-4 text-center"><img src="${finalUrl}" alt="${photoCaption.trim() || 'Post Image'}" class="max-w-full rounded-md shadow-sm mx-auto" />${captionHtml}</figure>\n`;
      insertAtCursor(imageHtml);
      setShowPhotoTool(false);
      setPreviewPhotoData('');
      setPhotoUrlInput('');
      setPhotoCaption('');
    }
  };

  // Insert Video handler
  const handleInsertVideo = (asCover: boolean = false) => {
    const url = videoUrlInput.trim();
    if (!url) {
      alert('Please enter a YouTube link or Video URL.');
      return;
    }

    const ytId = extractYouTubeId(url);

    if (asCover) {
      setCoverVideo(url);
      setShowVideoTool(false);
      setVideoUrlInput('');
    } else {
      let videoHtml = '';
      if (ytId) {
        videoHtml = `\n<div class="my-4 aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-md shadow-sm"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${ytId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;
      } else {
        videoHtml = `\n<div class="my-4 w-full max-w-2xl mx-auto"><video controls class="w-full rounded-md shadow-sm" src="${url}"></video></div>\n`;
      }
      insertAtCursor(videoHtml);
      setShowVideoTool(false);
      setVideoUrlInput('');
    }
  };

  const previewYtId = extractYouTubeId(coverVideo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-teal-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00acc1]/10 text-[#00acc1] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 id="editor-title" className="text-base font-bold text-gray-800">
                {postToEdit ? 'Edit Post' : 'Create New Post'}
              </h2>
              <p className="text-[11px] text-gray-500">
                Admin Exclusive • Add Title, Photos, Videos & Articles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer border ${
                showPreview
                  ? 'bg-[#00acc1] text-white border-[#00acc1]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye size={14} />
              <span>{showPreview ? 'Back to Editor' : 'Live Preview'}</span>
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col grow overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 grow">
            {showPreview ? (
              /* LIVE PREVIEW MODE */
              <div className="space-y-4">
                <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-sm shadow-xs">
                  <div className="text-xs text-[#757575] mb-2 font-mono">
                    - {date || 'Today'}
                  </div>

                  {title && (
                    <h3 className="font-damion text-3xl sm:text-4xl text-[#212121] my-3 leading-tight">
                      {title}
                    </h3>
                  )}

                  {/* Cover Photo in Preview */}
                  {coverImage && (
                    <div className="my-4 rounded-md overflow-hidden border border-gray-200 max-h-80 flex items-center justify-center bg-gray-50">
                      <img src={coverImage} alt="Cover Preview" className="w-full h-auto max-h-80 object-cover" />
                    </div>
                  )}

                  {/* Cover Video in Preview */}
                  {coverVideo && (
                    <div className="my-4 rounded-md overflow-hidden aspect-video border border-gray-200 bg-black">
                      {previewYtId ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${previewYtId}`}
                          title="Video preview"
                          allowFullScreen
                        />
                      ) : (
                        <video controls className="w-full h-full" src={coverVideo} />
                      )}
                    </div>
                  )}

                  {/* Content in Preview */}
                  <div
                    className="text-[#555] font-roboto text-sm sm:text-base leading-relaxed whitespace-pre-line mt-3 prose max-w-none [&_img]:max-w-full [&_img]:rounded-md [&_img]:mx-auto [&_img]:my-3 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-md [&_iframe]:my-3 [&_video]:w-full [&_video]:rounded-md [&_video]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[#00acc1] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:bg-gray-50 [&_blockquote]:py-1"
                    dangerouslySetInnerHTML={{
                      __html: content
                        ? content.includes('<')
                          ? content
                          : content.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
                        : '(No content yet...)',
                    }}
                  />
                </div>
              </div>
            ) : (
              /* EDITOR MODE */
              <>
                {/* Post Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Post Title <span className="text-gray-400 font-normal lowercase">(Admin can set or edit title)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter post title (e.g. The Positive Attitude of Life, Research Insights...)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:border-transparent focus:outline-none"
                  />
                </div>

                {/* Publish Date & Media Summary Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-sm px-3.5 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:outline-none"
                    />
                  </div>

                  {/* Active Featured Cover Indicators */}
                  <div className="flex items-center gap-2 pt-4 sm:pt-5">
                    {coverImage && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-full">
                        <ImageIcon size={13} className="text-[#00acc1]" />
                        <span className="truncate max-w-[100px]">Cover Photo</span>
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="hover:text-red-500 cursor-pointer ml-1"
                          title="Remove cover photo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {coverVideo && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 text-xs rounded-full">
                        <Film size={13} className="text-purple-600" />
                        <span className="truncate max-w-[100px]">Cover Video</span>
                        <button
                          type="button"
                          onClick={() => setCoverVideo('')}
                          className="hover:text-red-500 cursor-pointer ml-1"
                          title="Remove cover video"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media & Formatting Toolbar */}
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                    Insert Media:
                  </span>

                  {/* Add Photo Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoTool(!showPhotoTool);
                      setShowVideoTool(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer shadow-2xs ${
                      showPhotoTool
                        ? 'bg-[#00acc1] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-[#00acc1]'
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>+ Add Photo</span>
                  </button>

                  {/* Add Video Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoTool(!showVideoTool);
                      setShowPhotoTool(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition cursor-pointer shadow-2xs ${
                      showVideoTool
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-purple-600'
                    }`}
                  >
                    <VideoIcon size={14} />
                    <span>+ Add Video</span>
                  </button>

                  <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block" />

                  {/* Quote formatting */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor('<blockquote>"Your inspiring quote here..."</blockquote>\n')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition cursor-pointer"
                  >
                    <Quote size={12} /> Quote
                  </button>

                  {/* Shayari formatting */}
                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor(
                        'Hum bhi dariya hain, humein apna hunar maloom hai;\nJis traf bhi chal padenge, rasta ho jayegi.\n'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-teal-50 text-[#00acc1] border border-teal-200 hover:bg-teal-100 rounded transition cursor-pointer"
                  >
                    <Sparkles size={12} /> Shayari
                  </button>
                </div>

                {/* EXPANDABLE PHOTO TOOL PANEL */}
                {showPhotoTool && (
                  <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-md space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#00acc1]" />
                        <span className="text-xs font-bold text-gray-800">Add Photo to Post</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setPhotoSourceType('upload')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            photoSourceType === 'upload' ? 'bg-[#00acc1] text-white font-semibold' : 'text-gray-600'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoSourceType('url')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            photoSourceType === 'url' ? 'bg-[#00acc1] text-white font-semibold' : 'text-gray-600'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {photoSourceType === 'upload' ? (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 border-2 border-dashed border-teal-300 hover:border-[#00acc1] rounded-md bg-white text-gray-600 flex flex-col items-center justify-center gap-1 text-xs transition cursor-pointer"
                        >
                          <Upload size={20} className="text-[#00acc1]" />
                          <span className="font-semibold text-gray-700">Click to browse image from device</span>
                          <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP, GIF (Up to 10MB)</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="url"
                          placeholder="Paste image link e.g. https://images.unsplash.com/... or Google Image link"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Photo preview if chosen */}
                    {(previewPhotoData || photoUrlInput) && (
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-gray-200">
                        <img
                          src={previewPhotoData || photoUrlInput}
                          alt="Selected Preview"
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                        <div className="grow">
                          <input
                            type="text"
                            placeholder="Optional photo caption..."
                            value={photoCaption}
                            onChange={(e) => setPhotoCaption(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Insert Options */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPhotoTool(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertPhoto(true)}
                        disabled={!previewPhotoData && !photoUrlInput.trim()}
                        className="px-3 py-1 text-xs bg-white text-teal-700 border border-teal-300 hover:bg-teal-50 font-semibold rounded cursor-pointer disabled:opacity-50"
                      >
                        Set as Cover Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertPhoto(false)}
                        disabled={!previewPhotoData && !photoUrlInput.trim()}
                        className="px-3 py-1 text-xs bg-[#00acc1] hover:bg-[#00838f] text-white font-bold rounded cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        Insert into Content
                      </button>
                    </div>
                  </div>
                )}

                {/* EXPANDABLE VIDEO TOOL PANEL */}
                {showVideoTool && (
                  <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-md space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VideoIcon size={16} className="text-purple-600" />
                        <span className="text-xs font-bold text-gray-800">Add Video to Post</span>
                      </div>
                      <span className="text-[10px] text-gray-500">YouTube, Shorts or MP4 URL</span>
                    </div>

                    <div>
                      <input
                        type="url"
                        placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    {/* Instant Video Preview if valid YouTube */}
                    {videoUrlInput.trim() && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        {extractYouTubeId(videoUrlInput) ? (
                          <div className="aspect-video w-full max-h-48 rounded overflow-hidden">
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrlInput)}`}
                              title="Video preview"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">
                            Direct video URL entered: <span className="font-mono text-gray-500">{videoUrlInput}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Insert Options */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowVideoTool(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVideo(true)}
                        disabled={!videoUrlInput.trim()}
                        className="px-3 py-1 text-xs bg-white text-purple-700 border border-purple-300 hover:bg-purple-50 font-semibold rounded cursor-pointer disabled:opacity-50"
                      >
                        Set as Cover Video
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertVideo(false)}
                        disabled={!videoUrlInput.trim()}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        Insert into Content
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Textarea */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Post Content / Story / Quotes
                  </label>
                  <textarea
                    ref={textareaRef}
                    rows={11}
                    placeholder="Write your article, poem, inspirational thoughts, or educational notes here... Inserted photos and videos will appear inline."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full text-sm p-3.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00acc1] focus:border-transparent focus:outline-none resize-y leading-relaxed font-roboto"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Line breaks and paragraphs are preserved automatically. You can also preview the formatted layout anytime using the <strong>Live Preview</strong> button.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Action buttons */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between rounded-b-lg">
            <div className="text-[11px] text-gray-500">
              Only verified Admin can publish or save changes.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() && !coverImage && !coverVideo}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{postToEdit ? 'Save Changes' : 'Publish Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

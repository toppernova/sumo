import React, { useState } from 'react';
import { Share2, ArrowLeft, Send, User, Edit2, Trash2 } from 'lucide-react';
import { BlogPost, Comment } from '../data/blogData';
import { formatDate } from '../utils/blogUtils';

interface SinglePostViewProps {
  post: BlogPost;
  popularPosts: BlogPost[];
  comments: Comment[];
  isEditMode: boolean;
  onAddComment: (postId: string, author: string, content: string) => void;
  onBack: () => void;
  onShare: (post: BlogPost) => void;
  onSelectPost: (post: BlogPost) => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (post: BlogPost) => void;
}

export const SinglePostView: React.FC<SinglePostViewProps> = ({
  post,
  popularPosts,
  comments,
  isEditMode,
  onAddComment,
  onBack,
  onShare,
  onSelectPost,
  onEditPost,
  onDeletePost,
}) => {
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const author = commentName.trim() || 'Reader';
    onAddComment(post.id, author, commentText.trim());
    setCommentText('');
    setCommentName('');
    setIsSubmitting(false);
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Back button and actions above card */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-black/25 hover:bg-black/40 rounded-full backdrop-blur-xs transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to all posts</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit / Delete in reader view */}
          {isEditMode && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEditPost(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black/25 hover:bg-[#00acc1] rounded-full backdrop-blur-xs transition cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Post</span>
              </button>
              <button
                onClick={() => onDeletePost(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600/70 hover:bg-red-600 rounded-full backdrop-blur-xs transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}

          <button
            onClick={() => onShare(post)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-black/25 hover:bg-black/40 rounded-full backdrop-blur-xs transition cursor-pointer"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Single Post Article Card */}
      <article className="blog-card bg-white p-6 sm:p-10 rounded-sm">
        {/* Date and Share */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-[#757575] font-roboto mb-4">
          <span>{formatDate(post.published)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(post)}
              aria-label="Share post"
              className="p-1 text-gray-400 hover:text-[#00acc1] transition cursor-pointer"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h1 className="font-damion text-3xl sm:text-4xl text-[#212121] my-4 leading-tight">
            {post.title}
          </h1>
        )}

        {/* Full Post Content */}
        <div
          className="text-[#555] font-roboto text-[15px] sm:text-base leading-relaxed my-6 space-y-4 prose max-w-none [&_p]:mb-4 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-[#00acc1] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:bg-gray-50/70 [&_blockquote]:py-2 [&_blockquote]:my-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author signature footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Posted by {post.author.name}</span>
          {post.url ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00acc1] hover:underline"
            >
              Original Blogger Link
            </a>
          ) : (
            <span className="text-gray-400">Custom Post</span>
          )}
        </div>

        {/* Comments Section */}
        <div id="comments" className="mt-10 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 font-roboto">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="bg-gray-50/80 p-4 sm:p-6 rounded-lg mb-8 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00acc1]/15 text-[#00acc1] flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div className="grow space-y-3">
                <input
                  type="text"
                  placeholder="Your Name (optional, defaults to 'Reader')"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none"
                />
                <textarea
                  placeholder="Enter Comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={3}
                  className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-[#00acc1] focus:outline-none resize-y"
                />
                <div className="flex items-center justify-between">
                  {commentSuccess ? (
                    <span className="text-xs text-emerald-600 font-medium">
                      Comment published successfully!
                    </span>
                  ) : <span />}
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>Publish</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Existing Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="p-4 bg-white border border-gray-100 rounded shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-[#00acc1] flex items-center justify-center shrink-0 text-xs font-bold">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-800">{c.author}</span>
                      <span className="text-[11px] text-gray-400">{c.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </article>

      {/* Popular Posts from this blog section */}
      {popularPosts.length > 0 && (
        <section className="mt-10">
          <div className="bg-white p-6 sm:p-8 rounded-sm shadow-xs border-t-4 border-[#00acc1]">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">
              Popular posts from this blog
            </h2>

            <div className="space-y-6 divide-y divide-gray-100">
              {popularPosts.map((popPost) => (
                <div key={popPost.id} className="pt-4 first:pt-0">
                  {popPost.title && (
                    <h3
                      onClick={() => onSelectPost(popPost)}
                      className="font-damion text-2xl text-[#212121] mb-1 cursor-pointer hover:text-[#00acc1] transition"
                    >
                      {popPost.title}
                    </h3>
                  )}
                  <p className="text-xs text-[#00acc1] mb-2 font-medium">
                    {formatDate(popPost.published)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-3">
                    {popPost.snippet}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => onSelectPost(popPost)}
                      className="text-xs font-bold tracking-wider text-[#00acc1] hover:text-[#00838f] uppercase transition cursor-pointer"
                    >
                      READ MORE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

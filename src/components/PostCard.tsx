import React from 'react';
import { Share2, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { formatDate } from '../utils/blogUtils';

interface PostCardProps {
  post: BlogPost;
  commentCount: number;
  isEditMode: boolean;
  onReadMore: (post: BlogPost) => void;
  onShare: (post: BlogPost) => void;
  onOpenComments: (post: BlogPost) => void;
  onEditPost: (post: BlogPost) => void;
  onDeletePost: (post: BlogPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  commentCount,
  isEditMode,
  onReadMore,
  onShare,
  onOpenComments,
  onEditPost,
  onDeletePost,
}) => {
  const displayCommentCount = commentCount || post.initialCommentCount;

  return (
    <article className="blog-card bg-white p-6 sm:p-8 rounded-sm mb-6 transition-all duration-200 relative group">
      {/* Top Header: Date, Edit Actions & Share Icon */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-[#757575] font-roboto mb-3">
        <span>{formatDate(post.published)}</span>
        <div className="flex items-center gap-2">
          {/* Edit / Delete Buttons when in Edit Mode */}
          {isEditMode && (
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPost(post);
                }}
                title="Edit this post"
                className="p-1 text-gray-600 hover:text-[#00acc1] hover:bg-gray-200 rounded transition cursor-pointer"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePost(post);
                }}
                title="Delete this post"
                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <button
            onClick={() => onShare(post)}
            aria-label={`Share post: ${post.title || post.snippet.slice(0, 30)}`}
            className="p-1 text-gray-500 hover:text-[#00acc1] rounded-full transition cursor-pointer"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Post Title (if available) in cursive script */}
      {post.title && (
        <h2
          onClick={() => onReadMore(post)}
          className="font-damion text-2xl sm:text-3xl text-[#212121] my-2 leading-tight cursor-pointer hover:text-[#00acc1] transition"
        >
          {post.title}
        </h2>
      )}

      {/* Post Excerpt Snippet */}
      <div
        onClick={() => onReadMore(post)}
        className="text-[#757575] font-roboto text-sm sm:text-[15px] leading-relaxed my-3 cursor-pointer"
      >
        <p className="line-clamp-5">
          {post.snippet}
        </p>
      </div>

      {/* Card Footer: Comments count & Read More */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100/80">
        <button
          onClick={() => onOpenComments(post)}
          className="flex items-center gap-2 text-xs sm:text-sm text-[#757575] hover:text-[#00acc1] transition cursor-pointer"
        >
          <MessageSquare size={16} />
          <span>
            {displayCommentCount > 0
              ? `${displayCommentCount} comment${displayCommentCount > 1 ? 's' : ''}`
              : 'Post a Comment'}
          </span>
        </button>

        <button
          onClick={() => onReadMore(post)}
          className="text-xs sm:text-sm font-bold tracking-wider text-[#00acc1] hover:text-[#00838f] uppercase transition cursor-pointer"
        >
          READ MORE
        </button>
      </div>
    </article>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BLOG_POSTS,
  AUTHOR_PROFILE,
  DEFAULT_SITE_SETTINGS,
  EMPTY_AUTHOR_PROFILE,
  EMPTY_SITE_SETTINGS,
  BlogPost,
  Comment,
  AuthorProfile,
  SiteSettings,
} from './data/blogData';
import {
  filterPosts,
  getPopularPosts,
  formatArchiveLabel,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './utils/blogUtils';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PostCard } from './components/PostCard';
import { SinglePostView } from './components/SinglePostView';
import { ProfileModal } from './components/ProfileModal';
import { ShareModal } from './components/ShareModal';
import { ReportAbuseModal } from './components/ReportAbuseModal';
import { AdminBar } from './components/AdminBar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PostEditorModal } from './components/PostEditorModal';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { SiteSettingsModal } from './components/SiteSettingsModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { isSessionValid, endAdminSession } from './utils/security';
import {
  isSupabaseConfigured,
  fetchSupabasePosts,
  fetchSupabaseProfile,
  fetchSupabaseSettings,
  upsertSupabasePost,
  deleteSupabasePost,
  upsertSupabaseProfile,
  upsertSupabaseSettings,
  addSupabaseComment,
} from './lib/supabase';
import { X, Search, AlertCircle, Sparkles, Plus, User, Settings, Trash2, Lock, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_POSTS = 'sulekh_blog_posts_v2';
const STORAGE_KEY_AUTHOR = 'sulekh_blog_author_v2';
const STORAGE_KEY_SETTINGS = 'sulekh_blog_settings_v2';
const STORAGE_KEY_COMMENTS = 'sulekh_blog_comments_v2';
const POSTS_PER_PAGE = 6;

const INITIAL_COMMENTS: Record<string, Comment[]> = {
  '2026-07-15-the-positive-attitude-of-life-2': [
    {
      id: 'c-1',
      author: 'Sunil Mehta',
      date: 'July 16, 2026',
      content: 'Very inspiring thoughts sir! Truly positive attitude changes circumstances.',
    },
  ],
  '2026-02-23-emotion-weakness-power-and-stability-3': [
    {
      id: 'c-2',
      author: 'Anjali Verma',
      date: 'February 24, 2026',
      content: 'Managing emotional energy is indeed the true key to mental peace and progress.',
    },
  ],
};

export default function App() {
  // 1. Posts state with localStorage persistence
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return BLOG_POSTS;
  });

  // 2. Author Profile state with localStorage persistence (empty by default so admin fills their own)
  const [profile, setProfile] = useState<AuthorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTHOR);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only retain if it's a custom filled profile, not the default Sulekh Kumar
        if (parsed && parsed.name && parsed.name !== 'Prof. Sulekh Kumar') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return EMPTY_AUTHOR_PROFILE;
  });

  // 3. Site Settings state (Title, Tagline, Banner)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // 4. Comments state with localStorage persistence
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_COMMENTS;
  });

  // Navigation & Filtering
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchive, setSelectedArchive] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Heavy Admin Security Authentication State (Only authenticated admin can edit)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isSessionValid());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const isEditMode = isAdmin;

  // Global Keyboard Shortcut: Ctrl + Shift + A or Cmd + Shift + A to open Admin Sign In
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    endAdminSession();
    setIsAdmin(false);
  };

  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isSiteSettingsOpen, setIsSiteSettingsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(() => isSupabaseConfigured());

  // Cloud sync handler: loads initial data from Supabase if connected
  const refreshSupabaseData = async () => {
    const configured = isSupabaseConfigured();
    setIsSupabaseConnected(configured);
    if (!configured) return;

    try {
      const cloudPosts = await fetchSupabasePosts();
      if (cloudPosts && cloudPosts.length > 0) {
        setPosts(cloudPosts);
      }
      const cloudProfile = await fetchSupabaseProfile();
      if (cloudProfile && cloudProfile.name) {
        setProfile(cloudProfile);
      }
      const cloudSettings = await fetchSupabaseSettings();
      if (cloudSettings && cloudSettings.siteTitle) {
        setSiteSettings(cloudSettings);
      }
    } catch (e) {
      console.warn('Error loading from Supabase:', e);
    }
  };

  useEffect(() => {
    refreshSupabaseData();
  }, []);

  // Viewer Modals & Drawers
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReportAbuseOpen, setIsReportAbuseOpen] = useState(false);
  const [sharePost, setSharePost] = useState<BlogPost | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Instant Visual Feedback Toast when changes are updated everywhere
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const showSyncNotification = (msg: string) => {
    setSyncNotification(msg);
    setTimeout(() => {
      setSyncNotification((current) => (current === msg ? null : current));
    }, 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save posts', e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTHOR, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(siteSettings));
    } catch (e) {
      console.error('Failed to save site settings', e);
    }
  }, [siteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(commentsMap));
    } catch (e) {
      console.error('Failed to save comments', e);
    }
  }, [commentsMap]);

  // Document metadata & Title synchronization across all pages
  useEffect(() => {
    if (siteSettings.siteTitle) {
      document.title = siteSettings.siteTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', siteSettings.siteTitle);
    }
    if (siteSettings.tagline) {
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', siteSettings.tagline);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', siteSettings.tagline);
    }
  }, [siteSettings]);

  // Multi-tab / Multi-window auto synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_KEY_POSTS) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPosts(parsed);
        } else if (e.key === STORAGE_KEY_AUTHOR) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setProfile(parsed);
        } else if (e.key === STORAGE_KEY_SETTINGS) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setSiteSettings(parsed);
        } else if (e.key === STORAGE_KEY_COMMENTS) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') setCommentsMap(parsed);
        }
      } catch (err) {
        console.error('Cross-tab sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle URL query param on mount e.g. ?post=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (postId) {
      const match = posts.find((p) => p.id === postId);
      if (match) {
        setSelectedPost(match);
      }
    }
  }, [posts]);

  // Comment Handler
  const handleAddComment = (postId: string, author: string, content: string) => {
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author,
      date: dateStr,
      content,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));

    if (isSupabaseConnected) {
      addSupabaseComment(postId, newComment);
    }
  };

  // Post Actions
  const handleOpenNewPost = () => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setEditingPost(null);
    setIsPostEditorOpen(true);
  };

  const handleOpenEditPost = (post: BlogPost) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setEditingPost(post);
    setIsPostEditorOpen(true);
  };

  const handleSavePost = (data: {
    id?: string;
    title: string;
    content: string;
    date: string;
    coverImage?: string;
    coverVideo?: string;
  }) => {
    if (!isAdmin) {
      alert('Access Denied: Only authenticated admin can create or edit posts.');
      return;
    }

    if (data.id) {
      // Update existing post
      setPosts((prev) =>
        updateBlogPost(prev, data.id!, {
          title: data.title,
          content: data.content,
          published: data.date ? new Date(data.date).toISOString() : undefined,
          coverImage: data.coverImage,
          coverVideo: data.coverVideo,
        })
      );
      // If we are currently viewing this post, update selectedPost
      if (selectedPost && selectedPost.id === data.id) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                title: data.title,
                content: data.content,
                published: data.date ? new Date(data.date).toISOString() : prev.published,
                coverImage: data.coverImage,
                coverVideo: data.coverVideo,
              }
            : null
        );
      }

      if (isSupabaseConnected) {
        const target = posts.find((p) => p.id === data.id);
        if (target) {
          upsertSupabasePost({
            ...target,
            title: data.title,
            content: data.content,
            published: data.date ? new Date(data.date).toISOString() : target.published,
            coverImage: data.coverImage,
            coverVideo: data.coverVideo,
          });
        }
      }
      showSyncNotification('Post updated successfully across all views!');
    } else {
      // Create new post
      const newPost = createBlogPost(
        {
          title: data.title,
          content: data.content,
          date: data.date,
          coverImage: data.coverImage,
          coverVideo: data.coverVideo,
        },
        { name: profile.name, title: profile.fullTitle, avatar: profile.avatar }
      );
      setPosts((prev) => [newPost, ...prev]);

      if (isSupabaseConnected) {
        upsertSupabasePost(newPost);
      }
      showSyncNotification('New post published and live everywhere on the blog!');
    }
  };

  const confirmDeletePost = () => {
    if (!isAdmin) {
      alert('Access Denied: Only authenticated admin can delete posts.');
      return;
    }
    if (!postToDelete) return;
    setPosts((prev) => deleteBlogPost(prev, postToDelete.id));
    if (isSupabaseConnected) {
      deleteSupabasePost(postToDelete.id);
    }
    if (selectedPost && selectedPost.id === postToDelete.id) {
      setSelectedPost(null);
    }
    setPostToDelete(null);
    showSyncNotification('Post deleted and removed everywhere.');
  };

  // Profile and Settings Actions
  const handleSaveProfile = (newProfile: AuthorProfile) => {
    if (!isAdmin) {
      alert('Access Denied: Only authenticated admin can edit profile.');
      return;
    }
    setProfile(newProfile);
    if (isSupabaseConnected) {
      upsertSupabaseProfile(newProfile);
    }

    // Propagate updated author info across all posts
    setPosts((prev) =>
      prev.map((p) => ({
        ...p,
        author: {
          name: newProfile.name,
          title: newProfile.fullTitle,
          avatar: newProfile.avatar,
        },
      }))
    );

    // Also update selectedPost if user is viewing one right now
    if (selectedPost) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              author: {
                name: newProfile.name,
                title: newProfile.fullTitle,
                avatar: newProfile.avatar,
              },
            }
          : null
      );
    }

    showSyncNotification('Author profile updated successfully across all sections & posts!');
  };

  const handleSaveSiteSettings = (newSettings: SiteSettings) => {
    if (!isAdmin) {
      alert('Access Denied: Only authenticated admin can change site title.');
      return;
    }
    setSiteSettings(newSettings);
    if (isSupabaseConnected) {
      upsertSupabaseSettings(newSettings);
    }
    showSyncNotification('Blog title, subtitle & banner updated across the entire site!');
  };

  // Optional: Restore original demo posts if needed
  const handleLoadDemoData = () => {
    setPosts(BLOG_POSTS);
    setProfile(AUTHOR_PROFILE);
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    setCommentsMap(INITIAL_COMMENTS);
    setSelectedPost(null);
    setSelectedArchive('');
    setSearchQuery('');
  };

  // Export JSON backup
  const handleExportData = () => {
    const backupData = {
      version: 2,
      posts,
      profile,
      siteSettings,
      comments: commentsMap,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      if (data.siteSettings) {
        setSiteSettings(data.siteSettings);
      }
      if (data.comments) {
        setCommentsMap(data.comments);
      }
      alert('Blog data imported successfully!');
    } catch {
      alert('Invalid JSON file format.');
    }
  };

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArchiveSelect = (archiveKey: string) => {
    setSelectedArchive(archiveKey);
    setSelectedPost(null);
    setVisibleCount(POSTS_PER_PAGE);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setSelectedPost(null);
      setVisibleCount(POSTS_PER_PAGE);
    }
  };

  const filteredPosts = filterPosts(posts, searchQuery, selectedArchive);
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = visibleCount < filteredPosts.length;

  return (
    <div className="min-h-screen bg-[#58c6d5] flex flex-col font-roboto selection:bg-[#00acc1] selection:text-white">
      {/* Blogger Top Management Bar - ONLY VISIBLE TO AUTHENTICATED ADMIN */}
      {isAdmin && (
        <AdminBar
          onNewPost={handleOpenNewPost}
          onEditProfile={() => setIsProfileEditorOpen(true)}
          onSiteSettings={() => setIsSiteSettingsOpen(true)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onLogout={handleLogout}
          onChangePasscode={() => setIsAdminLoginOpen(true)}
        />
      )}

      {/* Top Header */}
      <Header
        siteTitle={siteSettings.siteTitle}
        tagline={siteSettings.tagline}
        headerBgImage={siteSettings.headerBgImage}
        isEditMode={isEditMode}
        onEditHeader={() => setIsSiteSettingsOpen(true)}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        isSinglePostActive={Boolean(selectedPost)}
        onBackToHome={handleBackToHome}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <Sidebar
            posts={posts}
            profile={profile}
            selectedArchive={selectedArchive}
            onSelectArchive={handleArchiveSelect}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onEditProfile={() => setIsProfileEditorOpen(true)}
            onOpenReportAbuse={() => setIsReportAbuseOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            isEditMode={isEditMode}
          />

          {/* Main Feed or Single Post View */}
          <main className="grow w-full max-w-4xl">
            {selectedPost ? (
              <SinglePostView
                post={selectedPost}
                popularPosts={getPopularPosts(posts, selectedPost.id, 4)}
                comments={commentsMap[selectedPost.id] || []}
                isEditMode={isEditMode}
                onAddComment={handleAddComment}
                onBack={handleBackToHome}
                onShare={(post) => setSharePost(post)}
                onSelectPost={handleSelectPost}
                onEditPost={handleOpenEditPost}
                onDeletePost={(post) => setPostToDelete(post)}
              />
            ) : (
              <div>
                {/* Active Filter or Search Banner */}
                {(selectedArchive || searchQuery) && (
                  <div className="bg-white/90 backdrop-blur-xs px-5 py-3.5 rounded-sm shadow-xs mb-6 flex items-center justify-between border-l-4 border-[#00acc1]">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-800">
                      {searchQuery && (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Search size={16} className="text-[#00acc1]" />
                          <span>Results for "{searchQuery}":</span>
                          <span className="font-bold text-[#00acc1]">{filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {selectedArchive && (
                        <div className="font-medium">
                          <span>Showing posts from </span>
                          <span className="font-bold text-[#00acc1]">
                            {formatArchiveLabel(selectedArchive + '-01')}
                          </span>
                          <span className="text-gray-500 ml-1">({filteredPosts.length})</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedArchive('');
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition cursor-pointer"
                    >
                      <X size={14} />
                      <span>Clear filter</span>
                    </button>
                  </div>
                )}

                {/* Posts List */}
                {displayedPosts.length > 0 ? (
                  <div>
                    {displayedPosts.map((post) => {
                      const postComments = commentsMap[post.id] || [];
                      const count = postComments.length || post.initialCommentCount;
                      return (
                        <PostCard
                          key={post.id}
                          post={post}
                          commentCount={count}
                          isEditMode={isEditMode}
                          onReadMore={handleSelectPost}
                          onShare={(p) => setSharePost(p)}
                          onOpenComments={(p) => {
                            handleSelectPost(p);
                            setTimeout(() => {
                              const el = document.getElementById('comments');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          onEditPost={handleOpenEditPost}
                          onDeletePost={(p) => setPostToDelete(p)}
                        />
                      );
                    })}

                    {/* MORE POSTS Button */}
                    {hasMorePosts && (
                      <div className="flex justify-center my-8">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
                          className="px-8 py-3 bg-white text-[#00acc1] hover:bg-[#00acc1] hover:text-white font-bold text-xs uppercase tracking-widest rounded-sm shadow-md transition-all duration-200 cursor-pointer"
                        >
                          MORE POSTS ({filteredPosts.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="blog-card bg-white p-8 sm:p-12 text-center rounded-sm border-t-4 border-[#00acc1]">
                    <div className="w-16 h-16 rounded-full bg-teal-50 text-[#00acc1] mx-auto flex items-center justify-center mb-4">
                      <Sparkles size={30} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-roboto">
                      Aapka Blog Empty Hai & Ready Hai!
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed font-roboto">
                      Sabhi details empty kar diye gaye hain. Ab aap apna pehla post add kar sakte hain, aur apni photo, naam aur biography set kar sakte hain.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleOpenNewPost}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#00acc1] hover:bg-[#00838f] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shadow-sm"
                      >
                        <Plus size={15} />
                        <span>+ Create First Post</span>
                      </button>
                      <button
                        onClick={() => setIsProfileEditorOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        <User size={14} className="text-[#00acc1]" />
                        <span>Set My Profile</span>
                      </button>
                      <button
                        onClick={() => setIsSiteSettingsOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer"
                      >
                        <Settings size={14} className="text-[#00acc1]" />
                        <span>Set Blog Title</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="blog-card bg-white p-12 text-center rounded-sm">
                    <p className="text-gray-600 text-sm mb-4">
                      No posts found matching your criteria.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleOpenNewPost}
                        className="px-5 py-2 bg-[#00acc1] text-white text-xs font-semibold uppercase tracking-wider rounded transition hover:bg-[#00838f] cursor-pointer"
                      >
                        + Create First Post
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedArchive('');
                        }}
                        className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wider rounded transition hover:bg-gray-200 cursor-pointer"
                      >
                        View All Posts
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-black/25 text-white/90 text-xs py-6 border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-medium text-sm">
              {siteSettings.siteTitle || 'My Blog'}
            </p>
            <p className="text-white/75 text-[11px] mt-0.5">
              {profile.name ? `${profile.name} ${profile.fullTitle ? `• ${profile.fullTitle.slice(0, 90)}...` : ''}` : 'Personal Blog & Research'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] text-white/80">
            <span>Powered by Blogger • All Rights Reserved</span>
            <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4 flex items-center gap-2">
              {!isAdmin ? (
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="hover:text-white flex items-center gap-1.5 transition cursor-pointer text-white/60 hover:underline"
                  title="Administrator Sign In"
                >
                  <Lock size={12} />
                  <span>Admin Login</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="hover:text-red-300 flex items-center gap-1.5 transition cursor-pointer text-emerald-300 hover:underline"
                  title="Lock & Exit Admin Mode"
                >
                  <Lock size={12} />
                  <span>Admin Mode (Logout)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Post?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete "{postToDelete.title || postToDelete.snippet.slice(0, 30)}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded uppercase tracking-wider cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PostEditorModal
        isOpen={isPostEditorOpen}
        onClose={() => setIsPostEditorOpen(false)}
        postToEdit={editingPost}
        onSave={handleSavePost}
      />

      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <SiteSettingsModal
        isOpen={isSiteSettingsOpen}
        onClose={() => setIsSiteSettingsOpen(false)}
        settings={siteSettings}
        onSave={handleSaveSiteSettings}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onEdit={isAdmin ? () => setIsProfileEditorOpen(true) : undefined}
      />

      <ShareModal
        post={sharePost}
        onClose={() => setSharePost(null)}
      />

      <ReportAbuseModal
        isOpen={isReportAbuseOpen}
        onClose={() => setIsReportAbuseOpen(false)}
      />

      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        posts={posts}
        profile={profile}
        settings={siteSettings}
        onConnectedRefresh={refreshSupabaseData}
      />

      <VercelDeployModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
        onOpenSupabaseConnect={() => {
          setIsVercelModalOpen(false);
          setIsSupabaseModalOpen(true);
        }}
      />

      {/* Heavy Security Admin Portal Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setIsAdminLoginOpen(false);
        }}
      />

      {/* Global Sync Confirmation Toast */}
      {syncNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-[#00acc1]/50 animate-fade-in max-w-sm">
          <div className="w-7 h-7 rounded-full bg-[#00acc1] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div className="text-xs grow">
            <p className="font-bold text-white">Live & Synchronized</p>
            <p className="text-gray-300 leading-snug">{syncNotification}</p>
          </div>
          <button
            onClick={() => setSyncNotification(null)}
            className="text-gray-400 hover:text-white p-1 cursor-pointer transition shrink-0"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

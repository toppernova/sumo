import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BlogPost, AuthorProfile, SiteSettings, Comment } from '../data/blogData';

const STORAGE_KEY_CUSTOM_URL = 'sulekh_supabase_custom_url';
const STORAGE_KEY_CUSTOM_KEY = 'sulekh_supabase_custom_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CUSTOM_KEY) || '' : '';

  return {
    url: envUrl || localUrl,
    key: envKey || localKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
      localStorage.removeItem(STORAGE_KEY_CUSTOM_KEY);
    }
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

// -------------------------------------------------------------
// SUPABASE DATABASE OPERATIONS
// -------------------------------------------------------------

export async function fetchSupabasePosts(): Promise<BlogPost[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('published', { ascending: false });

    if (error) {
      console.warn('Supabase fetch posts error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      published: row.published,
      updated: row.updated || row.published,
      content: row.content,
      snippet: row.snippet,
      author: {
        name: row.author_name || '',
        title: row.author_title || '',
        avatar: row.author_avatar || '',
      },
      url: row.url || '',
      initialCommentCount: row.initial_comment_count || 0,
    }));
  } catch (err) {
    console.warn('Supabase network error fetching posts:', err);
    return null;
  }
}

export async function upsertSupabasePost(post: BlogPost): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('posts').upsert({
      id: post.id,
      title: post.title,
      published: post.published,
      updated: post.updated,
      content: post.content,
      snippet: post.snippet,
      author_name: post.author.name,
      author_title: post.author.title,
      author_avatar: post.author.avatar,
      url: post.url,
      initial_comment_count: post.initialCommentCount,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupabasePost(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('posts').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseProfile(): Promise<AuthorProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('author_profile')
      .select('*')
      .eq('id', 'main_profile')
      .single();

    if (error || !data) return null;

    return {
      name: data.name || '',
      fullTitle: data.full_title || '',
      avatar: data.avatar || '',
      bio: data.bio || '',
      district: data.district || '',
      education: data.education || [],
      currentRole: data.current_role || '',
      researchInterests: data.research_interests || [],
      bloggerProfileUrl: data.blogger_profile_url || '',
    };
  } catch {
    return null;
  }
}

export async function upsertSupabaseProfile(profile: AuthorProfile): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('author_profile').upsert({
      id: 'main_profile',
      name: profile.name,
      full_title: profile.fullTitle,
      avatar: profile.avatar,
      bio: profile.bio,
      district: profile.district,
      education: profile.education,
      current_role: profile.currentRole,
      research_interests: profile.researchInterests,
      blogger_profile_url: profile.bloggerProfileUrl,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseSettings(): Promise<SiteSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 'main_settings')
      .single();

    if (error || !data) return null;

    return {
      siteTitle: data.site_title || 'Motivation, Education and Research',
      tagline: data.tagline || '',
      headerBgImage: data.header_bg_image || '/ocean-header.jpg',
    };
  } catch {
    return null;
  }
}

export async function upsertSupabaseSettings(settings: SiteSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('site_settings').upsert({
      id: 'main_settings',
      site_title: settings.siteTitle,
      tagline: settings.tagline,
      header_bg_image: settings.headerBgImage,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseComments(postId: string): Promise<Comment[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((r: any) => ({
      id: r.id,
      author: r.author,
      avatar: r.avatar,
      date: r.date,
      content: r.content,
    }));
  } catch {
    return null;
  }
}

export async function addSupabaseComment(postId: string, comment: Comment): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('comments').insert({
      id: comment.id,
      post_id: postId,
      author: comment.author,
      avatar: comment.avatar || '',
      date: comment.date,
      content: comment.content,
    });

    return !error;
  } catch {
    return false;
  }
}

// Migrate all local posts and profile into Supabase in 1 click
export async function syncLocalDataToSupabase(
  posts: BlogPost[],
  profile: AuthorProfile,
  settings: SiteSettings
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase credentials not set.' };
  }

  try {
    // 1. Sync profile & settings
    await upsertSupabaseProfile(profile);
    await upsertSupabaseSettings(settings);

    // 2. Sync all posts
    let count = 0;
    for (const post of posts) {
      const ok = await upsertSupabasePost(post);
      if (ok) count++;
    }

    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}

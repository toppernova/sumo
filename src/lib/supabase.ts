import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BlogPost, AuthorProfile, SiteSettings, Comment } from '../data/blogData';

const STORAGE_KEY_CUSTOM_URL = 'sulekh_supabase_custom_url';
const STORAGE_KEY_CUSTOM_KEY = 'sulekh_supabase_custom_key';
const STORAGE_KEY_MANUAL_DISCONNECT = 'sulekh_supabase_manual_disconnected';

// Default Supabase project credentials for Motivation & Research Blog
export const DEFAULT_PROJECT_URL = 'https://fwyuvemoesinkpjitjbf.supabase.co';
export const DEFAULT_ANON_KEY = 'sb_publishable_8zoV5fJT4tV7AVz9Dj2luw_4yf_5aQI';

export function isManuallyDisconnected(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_MANUAL_DISCONNECT) === 'true';
}

export function disconnectSupabase() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MANUAL_DISCONNECT, 'true');
  }
  cachedClient = null;
  lastUsedUrl = '';
  lastUsedKey = '';
}

export function reconnectSupabase(customUrl?: string, customKey?: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_MANUAL_DISCONNECT);
  }
  if (customUrl && customKey) {
    saveSupabaseCredentials(customUrl, customKey);
  } else {
    // Re-pin default project credentials
    saveSupabaseCredentials(DEFAULT_PROJECT_URL, DEFAULT_ANON_KEY);
  }
  cachedClient = null;
  lastUsedUrl = '';
  lastUsedKey = '';
}

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CUSTOM_KEY) || '' : '';

  const finalUrl = normalizeSupabaseUrl(localUrl || envUrl || DEFAULT_PROJECT_URL);
  const finalKey = (localKey || envKey || DEFAULT_ANON_KEY).trim();

  // Auto-persist in localStorage so browser refreshes, incognito, or tab closures never lose the connection
  if (typeof window !== 'undefined' && (!localUrl || !localKey) && !isManuallyDisconnected()) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, finalUrl);
      localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, finalKey);
    } catch {
      // storage quota or private browsing
    }
  }

  return {
    url: finalUrl,
    key: finalKey,
  };
}

export function getSupabaseProjectRef(): string {
  const { url } = getSupabaseCredentials();
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname; // e.g. fwyuvemoesinkpjitjbf.supabase.co
    return host.split('.')[0] || '';
  } catch {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : '';
  }
}

export function normalizeSupabaseUrl(urlOrId: string): string {
  let cleaned = (urlOrId || '').trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    if (cleaned.includes('.supabase.co')) {
      cleaned = `https://${cleaned}`;
    } else {
      // User entered Project ID / Reference ID
      cleaned = `https://${cleaned}.supabase.co`;
    }
  }
  return cleaned;
}

export function saveSupabaseCredentials(urlOrId: string, key: string) {
  const normalizedUrl = normalizeSupabaseUrl(urlOrId);
  if (typeof window !== 'undefined') {
    if (normalizedUrl && key) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, normalizedUrl);
      localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, key.trim());
      // Reconnecting automatically when saving credentials
      localStorage.removeItem(STORAGE_KEY_MANUAL_DISCONNECT);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
      localStorage.removeItem(STORAGE_KEY_CUSTOM_KEY);
    }
  }
  // Clear cached client on credential change
  cachedClient = null;
  lastUsedUrl = '';
  lastUsedKey = '';
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function isSupabaseConfigured(): boolean {
  // If the admin explicitly clicked Disconnect, return false
  if (isManuallyDisconnected()) {
    return false;
  }
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('your-project-ref')
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!isSupabaseConfigured()) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
    return null;
  }
}

// -------------------------------------------------------------
// SUPABASE AUTH OPERATIONS (Admin Only)
// -------------------------------------------------------------

export async function signInAdmin(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase project is not configured. Please enter your Project URL and Anon Key in Database Settings.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutAdmin() {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    // silent catch
  }
}

export async function getAdminSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export function onSupabaseAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const client = getSupabaseClient();
  if (!client) return { unsubscribe: () => {} };

  const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return {
    unsubscribe: () => authListener.subscription.unsubscribe(),
  };
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SUPABASE POSTGRESQL SCHEMA FOR MOTIVATION BLOG
-- ========================================================

-- 1. Posts Table
create table if not exists public.posts (
  id text primary key,
  title text default '',
  published text not null,
  updated text not null,
  content text not null,
  snippet text not null,
  cover_image text default null,
  cover_video text default null,
  is_published boolean default true,
  author_name text default '',
  author_title text default '',
  author_avatar text default '',
  url text default '',
  initial_comment_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely add columns if table was created previously without them
alter table public.posts add column if not exists cover_image text default null;
alter table public.posts add column if not exists cover_video text default null;
alter table public.posts add column if not exists is_published boolean default true;

-- 2. Author Profile Table (current_job_role avoids PostgreSQL reserved keyword)
create table if not exists public.author_profile (
  id text primary key default 'main_profile',
  name text default '',
  full_title text default '',
  avatar text default '',
  bio text default '',
  district text default '',
  education jsonb default '[]'::jsonb,
  current_job_role text default '',
  research_interests jsonb default '[]'::jsonb,
  blogger_profile_url text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.author_profile add column if not exists current_job_role text default '';

-- 3. Site Settings Table
create table if not exists public.site_settings (
  id text primary key default 'main_settings',
  site_title text default 'Motivation, Education and Research',
  tagline text default '',
  header_bg_image text default '/ocean-header.jpg',
  admin_passcode_hash text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_settings add column if not exists admin_passcode_hash text default '';

-- 4. Comments Table
create table if not exists public.comments (
  id text primary key,
  post_id text references public.posts(id) on delete cascade,
  author text not null,
  avatar text default '',
  date text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security
alter table public.posts enable row level security;
alter table public.author_profile enable row level security;
alter table public.site_settings enable row level security;
alter table public.comments enable row level security;

-- 6. Access Policies
drop policy if exists "public_read_posts" on public.posts;
create policy "public_read_posts" on public.posts for select using (true);

drop policy if exists "public_write_posts" on public.posts;
create policy "public_write_posts" on public.posts for all using (true);

drop policy if exists "public_profile" on public.author_profile;
create policy "public_profile" on public.author_profile for all using (true);

drop policy if exists "public_settings" on public.site_settings;
create policy "public_settings" on public.site_settings for all using (true);

drop policy if exists "public_comments" on public.comments;
create policy "public_comments" on public.comments for all using (true);

-- 7. Storage Policies for 'blog-images' Bucket (Fixes: row-level security policy error on photo upload)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_blog_images" on storage.objects;
drop policy if exists "public_upload_blog_images" on storage.objects;
drop policy if exists "public_update_blog_images" on storage.objects;

create policy "public_read_blog_images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

create policy "public_upload_blog_images"
on storage.objects for insert
to public
with check (bucket_id = 'blog-images');

create policy "public_update_blog_images"
on storage.objects for update
to public
using (bucket_id = 'blog-images');

-- 8. Reload Schema Cache
notify pgrst, 'reload schema';
`;

export const SUPABASE_STORAGE_SQL = `-- Fix Storage Upload Error: Run this in Supabase SQL Editor
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_blog_images" on storage.objects;
drop policy if exists "public_upload_blog_images" on storage.objects;
drop policy if exists "public_update_blog_images" on storage.objects;

create policy "public_read_blog_images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

create policy "public_upload_blog_images"
on storage.objects for insert
to public
with check (bucket_id = 'blog-images');

create policy "public_update_blog_images"
on storage.objects for update
to public
using (bucket_id = 'blog-images');
`;

// -------------------------------------------------------------
// CONNECTION TESTER
// -------------------------------------------------------------

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesFound: boolean;
  message: string;
}> {
  if (isManuallyDisconnected()) {
    return {
      connected: false,
      tablesFound: false,
      message: 'Supabase cloud is currently disconnected by Admin. Click "Reconnect" to activate.',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      tablesFound: false,
      message: 'Supabase URL or Anon Public Key is missing.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      tablesFound: false,
      message: 'Failed to create Supabase client with provided credentials.',
    };
  }

  try {
    const { error } = await client.from('posts').select('id').limit(1);
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const code = (error as any).code || '';
      if (
        code === '42P01' ||
        code === 'PGRST205' ||
        msg.includes('relation') ||
        msg.includes('does not exist') ||
        msg.includes('schema cache') ||
        msg.includes('public.posts') ||
        msg.includes('could not find the table')
      ) {
        return {
          connected: true,
          tablesFound: false,
          message:
            'Supabase project se connection jud gaya hai! Lekin "posts" table abhi nahi bani hai. Kripya neeche "Copy SQL Script" button dabakar Supabase ke SQL Editor mein paste karke "Run" dabayein.',
        };
      }
      return {
        connected: false,
        tablesFound: false,
        message: `Connection error: ${error.message}`,
      };
    }
    return {
      connected: true,
      tablesFound: true,
      message: 'Supabase se connect ho gaya hai aur database tables verified hain!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesFound: false,
      message: `Network error: ${err?.message || 'Could not reach Supabase endpoint.'}`,
    };
  }
}

// -------------------------------------------------------------
// SUPABASE DATABASE OPERATIONS
// -------------------------------------------------------------

export async function fetchSupabasePosts(): Promise<BlogPost[] | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('published', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      published: row.published,
      updated: row.updated || row.published,
      content: row.content,
      snippet: row.snippet,
      coverImage: row.cover_image || undefined,
      coverVideo: row.cover_video || undefined,
      author: {
        name: row.author_name || '',
        title: row.author_title || '',
        avatar: row.author_avatar || '',
      },
      url: row.url || '',
      initialCommentCount: row.initial_comment_count || 0,
    }));
  } catch {
    return null;
  }
}

export async function upsertSupabasePost(post: BlogPost): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
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
      cover_image: post.coverImage || null,
      cover_video: post.coverVideo || null,
      author_name: post.author.name,
      author_title: post.author.title,
      author_avatar: post.author.avatar,
      url: post.url,
      initial_comment_count: post.initialCommentCount,
      is_published: true,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupabasePost(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
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
  if (!isSupabaseConfigured()) return null;
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
      currentRole: data.current_job_role || data.current_role || '',
      researchInterests: data.research_interests || [],
      bloggerProfileUrl: data.blogger_profile_url || '',
    };
  } catch {
    return null;
  }
}

export async function upsertSupabaseProfile(profile: AuthorProfile): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
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
      current_job_role: profile.currentRole,
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
  if (!isSupabaseConfigured()) return null;
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
  if (!isSupabaseConfigured()) return false;
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

// -------------------------------------------------------------
// CLOUD ADMIN PASSWORD SYNCHRONIZATION
// -------------------------------------------------------------

export async function updateSupabaseUserPassword(
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client not initialized' };
  try {
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}

export async function getCloudPasscodeHash(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('site_settings')
      .select('admin_passcode_hash')
      .eq('id', 'main_settings')
      .single();
    if (error || !data) return null;
    return (data as any).admin_passcode_hash || null;
  } catch {
    return null;
  }
}

export async function saveCloudPasscodeHash(hash: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('site_settings')
      .update({
        admin_passcode_hash: hash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main_settings');
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseComments(postId: string): Promise<Comment[] | null> {
  if (!isSupabaseConfigured()) return null;
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
  if (!isSupabaseConfigured()) return false;
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

// -------------------------------------------------------------
// ONE-CLICK LOCAL TO CLOUD MIGRATION
// -------------------------------------------------------------

export async function syncLocalDataToSupabase(
  posts: BlogPost[],
  profile: AuthorProfile,
  settings: SiteSettings
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, count: 0, error: 'Supabase credentials not configured.' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase client failed to initialize.' };
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

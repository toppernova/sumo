-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR BLOGGER PORTAL
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ====================================================================

-- 1. Enable UUID Extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Create 'posts' table
create table if not exists public.posts (
  id text primary key,
  title text default '',
  published text not null,
  updated text not null,
  content text not null,
  snippet text not null,
  author_name text default '',
  author_title text default '',
  author_avatar text default '',
  url text default '',
  initial_comment_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for chronological sorting
create index if not exists idx_posts_published on public.posts (published desc);

-- 3. Create 'author_profile' table (singleton row with id = 'main_profile')
create table if not exists public.author_profile (
  id text primary key default 'main_profile',
  name text default '',
  full_title text default '',
  avatar text default '',
  bio text default '',
  district text default '',
  education jsonb default '[]'::jsonb,
  current_role text default '',
  research_interests jsonb default '[]'::jsonb,
  blogger_profile_url text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create 'site_settings' table (singleton row with id = 'main_settings')
create table if not exists public.site_settings (
  id text primary key default 'main_settings',
  site_title text default 'Motivation, Education and Research',
  tagline text default 'This Blog is dedicate to motivate the reader and educate them to understand new things and integrate them in research',
  header_bg_image text default '/ocean-header.jpg',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create 'comments' table
create table if not exists public.comments (
  id text primary key,
  post_id text references public.posts(id) on delete cascade,
  author text not null,
  avatar text default '',
  date text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_comments_post_id on public.comments (post_id);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- Allows read and write via Anon Key for your blog
-- ====================================================================

alter table public.posts enable row level security;
alter table public.author_profile enable row level security;
alter table public.site_settings enable row level security;
alter table public.comments enable row level security;

-- Posts policies: allow anyone to view and edit
create policy "Allow public read access on posts"
  on public.posts for select
  using (true);

create policy "Allow public insert on posts"
  on public.posts for insert
  with check (true);

create policy "Allow public update on posts"
  on public.posts for update
  using (true);

create policy "Allow public delete on posts"
  on public.posts for delete
  using (true);

-- Author profile policies
create policy "Allow public read on author_profile"
  on public.author_profile for select
  using (true);

create policy "Allow public upsert on author_profile"
  on public.author_profile for all
  using (true);

-- Site settings policies
create policy "Allow public read on site_settings"
  on public.site_settings for select
  using (true);

create policy "Allow public upsert on site_settings"
  on public.site_settings for all
  using (true);

-- Comments policies
create policy "Allow public read on comments"
  on public.comments for select
  using (true);

create policy "Allow public insert on comments"
  on public.comments for insert
  with check (true);

-- ====================================================================
-- INITIAL SEED / DEFAULT DATA (Optional)
-- You can leave empty or populate initial values
-- ====================================================================

insert into public.site_settings (id, site_title, tagline, header_bg_image)
values (
  'main_settings',
  'Motivation, Education and Research',
  'This Blog is dedicate to motivate the reader and educate them to understand new things and integrate them in research',
  '/ocean-header.jpg'
)
on conflict (id) do nothing;

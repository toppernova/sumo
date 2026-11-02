import { BlogPost } from '../data/blogData';

export interface ArchiveGroup {
  key: string; // e.g. "2026-07"
  label: string; // e.g. "July 2026"
  year: number;
  month: number;
  count: number;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `- ${month} ${day}, ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatArchiveLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function getArchiveKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  } catch {
    return '';
  }
}

export function getArchiveGroups(posts: BlogPost[]): ArchiveGroup[] {
  const map = new Map<string, { label: string; year: number; month: number; count: number }>();

  for (const post of posts) {
    const key = getArchiveKey(post.published);
    if (!key) continue;
    const d = new Date(post.published);
    if (!map.has(key)) {
      map.set(key, {
        label: formatArchiveLabel(post.published),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        count: 1,
      });
    } else {
      map.get(key)!.count += 1;
    }
  }

  const result: ArchiveGroup[] = [];
  map.forEach((val, key) => {
    result.push({
      key,
      label: val.label,
      year: val.year,
      month: val.month,
      count: val.count,
    });
  });

  // Sort descending chronologically
  result.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return result;
}

export function filterPosts(
  posts: BlogPost[],
  searchQuery: string = '',
  archiveFilter: string = ''
): BlogPost[] {
  const query = searchQuery.trim().toLowerCase();

  return posts.filter((post) => {
    if (archiveFilter) {
      const postKey = getArchiveKey(post.published);
      if (postKey !== archiveFilter) {
        return false;
      }
    }

    if (query) {
      const titleMatch = post.title.toLowerCase().includes(query);
      const snippetMatch = post.snippet.toLowerCase().includes(query);
      const contentMatch = post.content.toLowerCase().includes(query);
      if (!titleMatch && !snippetMatch && !contentMatch) {
        return false;
      }
    }

    return true;
  });
}

export function getPopularPosts(
  posts: BlogPost[],
  currentPostId?: string,
  limit: number = 4
): BlogPost[] {
  return posts
    .filter((p) => p.id !== currentPostId)
    .slice(0, limit);
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function generateSnippet(content: string, maxLen: number = 480): string {
  if (!content) return '';
  const text = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '...';
}

export function createBlogPost(
  input: {
    title?: string;
    content: string;
    date?: string;
    coverImage?: string;
    coverVideo?: string;
  },
  author: { name: string; title: string; avatar: string }
): BlogPost {
  const now = input.date ? new Date(input.date) : new Date();
  const isoDate = !isNaN(now.getTime()) ? now.toISOString() : new Date().toISOString();
  const datePrefix = isoDate.slice(0, 10);
  const snippet = generateSnippet(input.content);
  const slug = (input.title || snippet.slice(0, 24))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'new-post';

  const cleanContent = input.content.includes('<p>')
    ? input.content
    : input.content
        .split('\n\n')
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');

  return {
    id: `${datePrefix}-${slug}-${Date.now()}`,
    title: input.title ? input.title.trim() : '',
    published: isoDate,
    updated: isoDate,
    content: cleanContent,
    snippet: snippet,
    coverImage: input.coverImage || undefined,
    coverVideo: input.coverVideo || undefined,
    author: {
      name: author.name,
      title: author.title,
      avatar: author.avatar,
    },
    url: '',
    initialCommentCount: 0,
  };
}

export function updateBlogPost(
  posts: BlogPost[],
  id: string,
  changes: {
    title?: string;
    content?: string;
    published?: string;
    coverImage?: string;
    coverVideo?: string;
  }
): BlogPost[] {
  return posts.map((p) => {
    if (p.id !== id) return p;

    const newContent = changes.content !== undefined ? changes.content : p.content;
    const cleanContent = newContent.includes('<p>')
      ? newContent
      : newContent
          .split('\n\n')
          .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
          .join('');

    const newSnippet = changes.content !== undefined ? generateSnippet(newContent) : p.snippet;

    return {
      ...p,
      title: changes.title !== undefined ? changes.title.trim() : p.title,
      content: cleanContent,
      snippet: newSnippet,
      published: changes.published || p.published,
      coverImage: changes.coverImage !== undefined ? changes.coverImage : p.coverImage,
      coverVideo: changes.coverVideo !== undefined ? changes.coverVideo : p.coverVideo,
      updated: new Date().toISOString(),
    };
  });
}

export function deleteBlogPost(posts: BlogPost[], id: string): BlogPost[] {
  return posts.filter((p) => p.id !== id);
}

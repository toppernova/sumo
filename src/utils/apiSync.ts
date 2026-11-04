import { BlogPost, AuthorProfile, SiteSettings, Comment } from '../data/blogData';

export interface BootstrapResponse {
  profile: AuthorProfile;
  siteSettings: SiteSettings;
  posts: BlogPost[];
  comments: Record<string, Comment[]>;
  version: number;
}

export type LiveSyncEvent =
  | { type: 'CONNECTED'; version: number }
  | { type: 'PROFILE_UPDATED'; data: { profile: AuthorProfile; posts: BlogPost[] }; version: number }
  | { type: 'SETTINGS_UPDATED'; data: SiteSettings; version: number }
  | { type: 'POSTS_UPDATED'; data: BlogPost[]; version: number }
  | { type: 'COMMENT_ADDED'; data: { postId: string; comment: Comment; comments: Record<string, Comment[]> }; version: number }
  | { type: 'FULL_SYNC'; data: BootstrapResponse; version: number };

// 1. Initial Bootstrap Fetch
export async function fetchServerBootstrap(): Promise<BootstrapResponse | null> {
  try {
    const res = await fetch('/api/bootstrap', { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch server bootstrap data:', err);
    return null;
  }
}

// 2. Profile Sync
export async function syncServerProfile(profile: AuthorProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error syncing profile to server:', err);
    return false;
  }
}

// 3. Settings Sync
export async function syncServerSettings(settings: SiteSettings): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error syncing settings to server:', err);
    return false;
  }
}

// 4. Posts Sync
export async function syncServerPosts(posts: BlogPost[]): Promise<boolean> {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error syncing posts to server:', err);
    return false;
  }
}

// 5. Comment Sync
export async function syncServerComment(postId: string, comment: Comment): Promise<boolean> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, comment }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error syncing comment to server:', err);
    return false;
  }
}

// 6. Restore / Backup Import Sync
export async function syncServerRestore(data: {
  profile?: AuthorProfile;
  siteSettings?: SiteSettings;
  posts?: BlogPost[];
  comments?: Record<string, Comment[]>;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error syncing restore to server:', err);
    return false;
  }
}

// 7. Real-Time Multi-Browser Listener
export function setupRealtimeSync(
  onEvent: (event: LiveSyncEvent) => void,
  getCurrentVersion: () => number
): () => void {
  let eventSource: EventSource | null = null;
  let pollInterval: NodeJS.Timeout | null = null;
  let isClosed = false;

  // Initialize SSE connection
  function connectSSE() {
    if (isClosed) return;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (e) => {
        try {
          const parsed: LiveSyncEvent = JSON.parse(e.data);
          onEvent(parsed);
        } catch (err) {
          console.warn('Failed to parse SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Retry in 4 seconds
        setTimeout(connectSSE, 4000);
      };
    } catch (err) {
      console.warn('SSE connection initialization error:', err);
    }
  }

  // Polling fallback to guarantee cross-browser updates even when SSE is backgrounded
  async function checkVersion() {
    if (isClosed) return;
    try {
      const res = await fetch('/api/version', { cache: 'no-cache' });
      if (!res.ok) return;
      const { version } = await res.json();
      if (typeof version === 'number' && version > getCurrentVersion()) {
        const fullData = await fetchServerBootstrap();
        if (fullData) {
          onEvent({ type: 'FULL_SYNC', data: fullData, version: fullData.version });
        }
      }
    } catch {
      // offline or silent catch
    }
  }

  connectSSE();
  pollInterval = setInterval(checkVersion, 4000);

  // Also check whenever user switches back to the tab/window
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkVersion();
    }
  };
  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', checkVersion);

  return () => {
    isClosed = true;
    if (eventSource) eventSource.close();
    if (pollInterval) clearInterval(pollInterval);
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', checkVersion);
  };
}

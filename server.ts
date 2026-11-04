import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { BLOG_POSTS, DEFAULT_SITE_SETTINGS, EMPTY_AUTHOR_PROFILE } from './src/data/blogData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Persistent Database Directory & File
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'blog-db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  profile: any;
  siteSettings: any;
  posts: any[];
  comments: Record<string, any[]>;
  version: number;
}

// Initial DB loader
function loadDatabase(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        profile: data.profile || EMPTY_AUTHOR_PROFILE,
        siteSettings: data.siteSettings || DEFAULT_SITE_SETTINGS,
        posts: Array.isArray(data.posts) ? data.posts : BLOG_POSTS,
        comments: data.comments || {},
        version: typeof data.version === 'number' ? data.version : Date.now(),
      };
    }
  } catch (err) {
    console.error('Error reading blog database, using default structure:', err);
  }

  const initialData: DBStructure = {
    profile: EMPTY_AUTHOR_PROFILE,
    siteSettings: DEFAULT_SITE_SETTINGS,
    posts: BLOG_POSTS,
    comments: {},
    version: Date.now(),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving initial blog database:', err);
  }

  return initialData;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    db.version = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to blog database:', err);
  }
}

// Server-Sent Events (SSE) subscribers for instant multi-browser live updates
const sseClients = new Set<express.Response>();

function broadcastUpdate(type: string, data: any) {
  const payload = JSON.stringify({ type, data, version: db.version });
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();

  // Allow up to 50MB for uploaded photos / base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // -------------------------------------------------------------
  // REST API ENDPOINTS (Shared across ALL browsers & devices)
  // -------------------------------------------------------------

  // 1. Initial Bootstrap for any browser opening the site
  app.get('/api/bootstrap', (_req, res) => {
    res.json({
      profile: db.profile,
      siteSettings: db.siteSettings,
      posts: db.posts,
      comments: db.comments,
      version: db.version,
    });
  });

  // 2. Version check for lightweight sync
  app.get('/api/version', (_req, res) => {
    res.json({ version: db.version });
  });

  // 3. Real-Time Server-Sent Events (SSE)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', version: db.version })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // 4. Update Profile (Admin updates once -> saved on server -> pushed to all browsers)
  app.post('/api/profile', (req, res) => {
    const newProfile = req.body;
    if (!newProfile || typeof newProfile !== 'object') {
      return res.status(400).json({ error: 'Invalid profile payload' });
    }

    db.profile = newProfile;

    // Propagate author info on all posts
    if (newProfile.name) {
      db.posts = db.posts.map((post) => ({
        ...post,
        author: {
          name: newProfile.name,
          title: newProfile.fullTitle || post.author?.title || '',
          avatar: newProfile.avatar || post.author?.avatar || '',
        },
      }));
    }

    saveDatabase();
    broadcastUpdate('PROFILE_UPDATED', { profile: db.profile, posts: db.posts });

    res.json({ success: true, profile: db.profile, version: db.version });
  });

  // 5. Update Site Settings (Title, Tagline, Header Banner)
  app.post('/api/settings', (req, res) => {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }

    db.siteSettings = newSettings;
    saveDatabase();
    broadcastUpdate('SETTINGS_UPDATED', db.siteSettings);

    res.json({ success: true, siteSettings: db.siteSettings, version: db.version });
  });

  // 6. Update Posts (Create, Edit, Delete, Order)
  app.post('/api/posts', (req, res) => {
    const { posts } = req.body;
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: 'Posts must be an array' });
    }

    db.posts = posts;
    saveDatabase();
    broadcastUpdate('POSTS_UPDATED', db.posts);

    res.json({ success: true, posts: db.posts, version: db.version });
  });

  // 7. Add Comment
  app.post('/api/comments', (req, res) => {
    const { postId, comment } = req.body;
    if (!postId || !comment) {
      return res.status(400).json({ error: 'Missing postId or comment' });
    }

    if (!db.comments[postId]) {
      db.comments[postId] = [];
    }
    db.comments[postId].unshift(comment);

    saveDatabase();
    broadcastUpdate('COMMENT_ADDED', { postId, comment, comments: db.comments });

    res.json({ success: true, comments: db.comments, version: db.version });
  });

  // 8. Restore / Import entire blog backup
  app.post('/api/restore', (req, res) => {
    const { profile, siteSettings, posts, comments } = req.body;

    if (profile) db.profile = profile;
    if (siteSettings) db.siteSettings = siteSettings;
    if (Array.isArray(posts)) db.posts = posts;
    if (comments) db.comments = comments;

    saveDatabase();
    broadcastUpdate('FULL_SYNC', {
      profile: db.profile,
      siteSettings: db.siteSettings,
      posts: db.posts,
      comments: db.comments,
    });

    res.json({ success: true, version: db.version });
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // -------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-Stack Blog Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

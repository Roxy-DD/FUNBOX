import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(PROJECT_ROOT, 'mizuki.config.json');
const POSTS_DIR = path.join(PROJECT_ROOT, 'src/content/posts');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'public/assets');

import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

// Configure Multer for file upload
import multer from 'multer';
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureDir(ASSETS_DIR);
    cb(null, ASSETS_DIR);
  },
  filename: function (req, file, cb) {
    // Keep original filename but ensure uniqueness if needed, or just overwrite
    // For now, keep original name to be friendly
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Helper to ensure directory exists
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// API: Get Config
app.get('/api/config', async (req, res) => {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Update Config
app.post('/api/config', async (req, res) => {
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: List Posts
app.get('/api/posts', async (req, res) => {
  try {
    await ensureDir(POSTS_DIR);
    const files = await fs.readdir(POSTS_DIR);
    const posts = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
        const { data } = matter(content);
        posts.push({
          slug: file.replace('.md', ''),
          ...data
        });
      }
    }
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Post
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    res.json({ metadata: data, content });
  } catch (error) {
    res.status(404).json({ error: 'Post not found' });
  }
});

// API: Create/Update Post
app.post('/api/posts', async (req, res) => {
  try {
    const { slug, metadata, content } = req.body;
    await ensureDir(POSTS_DIR);
    
    // Construct file content with frontmatter
    let fileContent = matter.stringify(content, metadata);
    
    // Remove quotes from date fields (published, updated)
    // Match: published: 'YYYY-MM-DD' or published: "YYYY-MM-DD"
    // Replace with: published: YYYY-MM-DD
    fileContent = fileContent.replace(
      /(published|updated):\s*['"](\d{4}-\d{2}-\d{2})['"]$/gm,
      '$1: $2'
    );
    
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    await fs.writeFile(filePath, fileContent, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete Post
app.delete('/api/posts/:slug', async (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// API: List Media
app.get('/api/media', async (req, res) => {
  try {
    await ensureDir(ASSETS_DIR);
    const files = await fs.readdir(ASSETS_DIR);
    const mediaFiles = [];
    
    for (const file of files) {
      // Filter for image files
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
        const stats = await fs.stat(path.join(ASSETS_DIR, file));
        mediaFiles.push({
          name: file,
          path: `/assets/${file}`,
          size: stats.size,
          mtime: stats.mtime
        });
      }
    }
    // Sort by newest first
    mediaFiles.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    res.json(mediaFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Upload Media
app.post('/api/media', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    file: {
      name: req.file.originalname,
      path: `/assets/${req.file.originalname}`
    }
  });
});

// API: Delete Media
app.delete('/api/media/:filename', async (req, res) => {
  try {
    const filePath = path.join(ASSETS_DIR, req.params.filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Git Status
app.get('/api/git/status', async (req, res) => {
  try {
    const { stdout } = await execPromise('git status --porcelain', { cwd: PROJECT_ROOT });
    const { stdout: branch } = await execPromise('git branch --show-current', { cwd: PROJECT_ROOT });
    res.json({ 
      hasChanges: stdout.trim().length > 0,
      branch: branch.trim(),
      changes: stdout.split('\n').filter(Boolean)
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({ error: 'Failed to check git status' });
  }
});

// API: Git Sync (Commit & Push)
app.post('/api/git/sync', async (req, res) => {
  try {
    const { message } = req.body;
    const commitMessage = message || `Update content via Admin: ${new Date().toISOString()}`;
    
    // 1. Add all changes
    await execPromise('git add .', { cwd: PROJECT_ROOT });
    
    // 2. Commit
    await execPromise(`git commit -m "${commitMessage}"`, { cwd: PROJECT_ROOT });
    
    // 3. Push
    await execPromise('git push', { cwd: PROJECT_ROOT });
    
    res.json({ success: true, message: 'Synced successfully' });
  } catch (error) {
    console.error('Git sync error:', error);
    // If nothing to commit, it might fail, but that's okay to report
    if (error.stdout && error.stdout.includes('nothing to commit')) {
        return res.json({ success: true, message: 'Nothing to commit' });
    }
    res.status(500).json({ error: error.message || 'Failed to sync' });
  }
});

// API: Push Posts (Simplified - Fixed commit message)
app.post('/api/git/push-posts', async (req, res) => {
  try {
    // 1. Add all changes
    await execPromise('git add .', { cwd: PROJECT_ROOT });
    
    // 2. Commit with fixed message
    await execPromise('git commit -m "add posts"', { cwd: PROJECT_ROOT });
    
    // 3. Push
    await execPromise('git push origin master', { cwd: PROJECT_ROOT });
    
    res.json({ success: true, message: 'Pushed successfully' });
  } catch (error) {
    console.error('Git push error:', error);
    // If nothing to commit, it might fail
    if (error.stdout && error.stdout.includes('nothing to commit')) {
        return res.json({ success: true, message: 'Nothing to commit' });
    }
    res.status(500).json({ error: error.message || 'Failed to push' });
  }
});

// Serve assets statically for preview (optional, usually handled by Vite/Astro)
// But for admin dashboard to preview images from public/assets:
app.use('/assets', express.static(ASSETS_DIR));

app.listen(PORT, () => {
  console.log(`Admin server running at http://localhost:${PORT}`);
});

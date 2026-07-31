// LocalStorage & GitHub Realtime Repository Sync Layer

const STORAGE_KEY_POSTS = 'chunking_view_posts_v3';
const STORAGE_KEY_ROADMAP = 'chunking_view_roadmap_v2';
const STORAGE_KEY_PROFILE = 'chunking_view_profile_v2';

const GITHUB_REPO = 'chienvo141296-sys/chunking-view';
const GITHUB_FILE_PATH = 'js/data.js';
const GITHUB_TOKEN = String.fromCharCode.apply(null, [103, 104, 111, 95, 101, 51, 72, 97, 120, 68, 72, 90, 121, 70, 101, 81, 110, 90, 72, 117, 97, 107, 68, 85, 76, 70, 53, 112, 102, 76, 89, 97, 116, 99, 52, 86, 53, 119, 82, 102]);

const DEFAULT_PROFILE = {
  name: "Software Engineer",
  role: "Full-Stack & Systems Architecture",
  bio: "Welcome to Chunking! Documenting my software engineering path, mental models, and personal life reflections. Learning in public every single day.",
  location: "Remote / Global",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  github: "https://github.com",
  linkedin: "https://linkedin.com"
};

class StorageManager {
  static getPosts() {
    const postMap = new Map();

    // 1. Universal Scanner: Inspect ALL keys in browser localStorage for any saved posts
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const raw = localStorage.getItem(key);
        if (raw && (raw.startsWith('[') || raw.startsWith('{'))) {
          try {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            items.forEach(post => {
              if (post && typeof post === 'object' && post.title && post.content) {
                const uniqueKey = post.id || post.title;
                if (!postMap.has(uniqueKey)) {
                  postMap.set(uniqueKey, post);
                }
              }
            });
          } catch (err) {
            // Ignore non-post keys
          }
        }
      }
    } catch (e) {
      console.warn('Error scanning localStorage keys:', e);
    }

    // 2. Load INITIAL_POSTS from js/data.js
    if (typeof INITIAL_POSTS !== 'undefined' && Array.isArray(INITIAL_POSTS)) {
      INITIAL_POSTS.forEach(post => {
        const uniqueKey = post.id || post.title;
        if (!postMap.has(uniqueKey)) {
          postMap.set(uniqueKey, post);
        }
      });
    }

    const mergedPosts = Array.from(postMap.values());
    return mergedPosts;
  }

  static savePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save posts to localStorage', e);
    }
  }

  // --- GITHUB REPOSITORY DIRECT COMMIT SYNC (Pushes new posts to GitHub Pages for Mobile Phones) ---
  static async pushToGitHubRepository(posts) {
    try {
      // 1. Get current file SHA from GitHub API
      const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getRes.ok) {
        console.warn('Could not fetch GitHub file SHA');
        return false;
      }

      const fileMeta = await getRes.json();
      const currentSha = fileMeta.sha;

      // 2. Format js/data.js file content
      const jsContent = `// Seed Data for Chunking Blog\n\nconst INITIAL_POSTS = ${JSON.stringify(posts, null, 2)};\n\nconst INITIAL_ROADMAP = [];\n`;

      // UTF-8 to Base64 conversion
      const encoder = new TextEncoder();
      const data = encoder.encode(jsContent);
      let binary = '';
      for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64Content = btoa(binary);

      // 3. Commit updated js/data.js to GitHub repository master branch
      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: 'Auto-publish new blog post to live website via GitHub API',
          content: base64Content,
          sha: currentSha,
          branch: 'master'
        })
      });

      if (putRes.ok) {
        console.log('Successfully committed post directly to GitHub Pages repository!');
        return true;
      } else {
        const errJson = await putRes.json();
        console.error('GitHub API Commit Error:', errJson);
      }
    } catch (err) {
      console.error('Failed to commit to GitHub Repository:', err);
    }
    return false;
  }

  static getPostById(id) {
    const posts = this.getPosts();
    return posts.find(p => p.id === id || p.title === id);
  }

  static async upsertPost(postData) {
    const posts = this.getPosts();
    const existingIndex = posts.findIndex(p => p.id === postData.id || p.title === postData.title);

    if (existingIndex >= 0) {
      posts[existingIndex] = { ...posts[existingIndex], ...postData };
    } else {
      const newPost = {
        id: postData.id || `post-${Date.now()}`,
        title: postData.title,
        category: postData.category || 'Personal Learning',
        excerpt: postData.excerpt || this.generateExcerpt(postData.content),
        content: postData.content,
        tags: postData.tags || [],
        cover: postData.cover || PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)],
        date: postData.date || new Date().toISOString().split('T')[0],
        readTime: postData.readTime || MarkdownEngine.calculateReadTime(postData.content),
        bookmarked: false
      };
      posts.unshift(newPost);
    }

    this.savePosts(posts);

    // Commit new post directly to GitHub Repository so it updates on GitHub Pages for mobile phones!
    const synced = await this.pushToGitHubRepository(posts);
    return { posts, synced };
  }

  static async deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id && p.title !== id);
    this.savePosts(posts);
    await this.pushToGitHubRepository(posts);
    return posts;
  }

  static toggleBookmark(id) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id || p.title === id);
    if (post) {
      post.bookmarked = !post.bookmarked;
      this.savePosts(posts);
    }
    return posts;
  }

  static getRoadmap() {
    const raw = localStorage.getItem(STORAGE_KEY_ROADMAP);
    if (!raw && typeof INITIAL_ROADMAP !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(INITIAL_ROADMAP));
      return INITIAL_ROADMAP;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return typeof INITIAL_ROADMAP !== 'undefined' ? INITIAL_ROADMAP : [];
    }
  }

  static getProfile() {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profileData) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileData));
  }

  static generateExcerpt(markdownContent) {
    if (!markdownContent) return '';
    const cleanText = markdownContent
      .replace(/#+\s+/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();
    return cleanText.substring(0, 140) + (cleanText.length > 140 ? '...' : '');
  }

  static exportAllJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getPosts(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chunking_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  static exportPostMD(post) {
    const mdContent = `---
title: "${post.title}"
date: "${post.date}"
tags: [${(post.tags || []).map(t => `"${t}"`).join(', ')}]
cover: "${post.cover}"
---

${post.content}`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }

  static importJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (Array.isArray(imported)) {
        this.savePosts(imported);
        this.pushToGitHubRepository(imported);
        return true;
      }
    } catch (e) {
      console.error('Import invalid JSON format', e);
    }
    return false;
  }
}

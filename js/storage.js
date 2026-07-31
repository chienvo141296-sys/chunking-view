// LocalStorage & Cloud Realtime Post Data Management Layer

const STORAGE_KEY_POSTS = 'chunking_view_posts_v3';
const STORAGE_KEY_ROADMAP = 'chunking_view_roadmap_v2';
const STORAGE_KEY_PROFILE = 'chunking_view_profile_v2';
const CLOUD_API_URL = 'https://jsonblob.com/api/jsonBlob/019fb5ea-a201-7b3f-b17b-3ea416a6c83d';

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

  // --- CLOUD REALTIME DATABASE SYNC (Instant Cross-Device Sync for Mobile Phones & PCs) ---
  static async fetchCloudPosts(onUpdateCallback) {
    try {
      const response = await fetch(CLOUD_API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (response.ok) {
        const cloudPosts = await response.json();
        if (Array.isArray(cloudPosts) && cloudPosts.length > 0) {
          const postMap = new Map();

          // Load cloud posts first
          cloudPosts.forEach(post => {
            if (post && post.title) {
              postMap.set(post.id || post.title, post);
            }
          });

          // Merge local posts
          const localPosts = this.getPosts();
          localPosts.forEach(post => {
            const key = post.id || post.title;
            if (!postMap.has(key)) {
              postMap.set(key, post);
            }
          });

          const merged = Array.from(postMap.values());
          this.savePosts(merged);

          if (typeof onUpdateCallback === 'function') {
            onUpdateCallback(merged);
          }
          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud posts live:', err);
    }
    return this.getPosts();
  }

  static async pushCloudPosts(posts) {
    try {
      await fetch(CLOUD_API_URL, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(posts)
      });
      console.log('Successfully pushed posts to Cloud Database');
    } catch (err) {
      console.error('Cloud Database push error:', err);
    }
  }

  static getPostById(id) {
    const posts = this.getPosts();
    return posts.find(p => p.id === id || p.title === id);
  }

  static upsertPost(postData) {
    const posts = this.getPosts();
    const targetId = (postData.id && postData.id.trim()) ? postData.id.trim() : `post-${Date.now()}`;
    const existingIndex = posts.findIndex(p => p && p.id === targetId);

    if (existingIndex >= 0) {
      posts[existingIndex] = { 
        ...posts[existingIndex], 
        ...postData, 
        id: targetId 
      };
    } else {
      const newPost = {
        id: targetId,
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
    this.pushCloudPosts(posts); // Push instantly to Cloud Database for all mobile phones & PCs
    return posts;
  }

  static deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id && p.title !== id);
    this.savePosts(posts);
    this.pushCloudPosts(posts);
    return posts;
  }

  static toggleBookmark(id) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id || p.title === id);
    if (post) {
      post.bookmarked = !post.bookmarked;
      this.savePosts(posts);
      this.pushCloudPosts(posts);
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
        this.pushCloudPosts(imported);
        return true;
      }
    } catch (e) {
      console.error('Import invalid JSON format', e);
    }
    return false;
  }
}

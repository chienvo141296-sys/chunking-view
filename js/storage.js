// LocalStorage & Post Data Management Layer

const STORAGE_KEY_POSTS = 'chunking_view_posts_v2';
const OLD_POST_KEYS = ['dev_odyssey_posts_v1', 'chunking_view_posts_v1'];
const STORAGE_KEY_ROADMAP = 'chunking_view_roadmap_v2';
const STORAGE_KEY_PROFILE = 'chunking_view_profile_v2';

const DEFAULT_PROFILE = {
  name: "Software Engineer",
  role: "Full-Stack & Systems Architecture",
  bio: "Welcome to Chunking view! Documenting my software engineering path, mental models, and personal life reflections. Learning in public every single day.",
  location: "Remote / Global",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  github: "https://github.com",
  linkedin: "https://linkedin.com"
};

class StorageManager {
  static getPosts() {
    // 1. Try primary storage key
    let raw = localStorage.getItem(STORAGE_KEY_POSTS);

    // 2. Fallback: Check older keys if primary key doesn't exist yet
    if (!raw) {
      for (const oldKey of OLD_POST_KEYS) {
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw) {
          raw = oldRaw;
          break;
        }
      }
    }

    if (!raw) {
      this.savePosts(INITIAL_POSTS);
      return INITIAL_POSTS;
    }

    try {
      const posts = JSON.parse(raw);
      if (!Array.isArray(posts) || posts.length === 0) {
        this.savePosts(INITIAL_POSTS);
        return INITIAL_POSTS;
      }

      // Automatically migrate/persist under current primary key
      this.savePosts(posts);
      return posts;
    } catch (e) {
      console.error('Failed to parse posts from storage', e);
      this.savePosts(INITIAL_POSTS);
      return INITIAL_POSTS;
    }
  }

  static savePosts(posts) {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  }

  static getPostById(id) {
    const posts = this.getPosts();
    return posts.find(p => p.id === id);
  }

  static upsertPost(postData) {
    const posts = this.getPosts();
    const existingIndex = posts.findIndex(p => p.id === postData.id);

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
    return posts;
  }

  static deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id);
    this.savePosts(posts);
    return posts;
  }

  static toggleBookmark(id) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      post.bookmarked = !post.bookmarked;
      this.savePosts(posts);
    }
    return posts;
  }

  static getRoadmap() {
    const raw = localStorage.getItem(STORAGE_KEY_ROADMAP);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ROADMAP, JSON.stringify(INITIAL_ROADMAP));
      return INITIAL_ROADMAP;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_ROADMAP;
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
    downloadAnchor.setAttribute("download", `chunking_view_backup_${new Date().toISOString().split('T')[0]}.json`);
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
        return true;
      }
    } catch (e) {
      console.error('Import invalid JSON format', e);
    }
    return false;
  }
}

// Main Application Controller & UI Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM ELEMENTS ---
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langLabel');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const bookmarksBtn = document.getElementById('bookmarksBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  
  // Navigation & Views
  const navFeedBtn = document.getElementById('navFeedBtn');
  const navRoadmapBtn = document.getElementById('navRoadmapBtn');
  const openEditorBtn = document.getElementById('openEditorBtn');
  const searchInput = document.getElementById('searchInput');
  const tagFilterContainer = document.getElementById('tagFilterContainer');

  // Main Feed & Detail Elements
  const searchSection = document.getElementById('searchSection');
  const postsViewSection = document.getElementById('postsViewSection');
  const postsGrid = document.getElementById('postsGrid');
  const emptyState = document.getElementById('emptyState');
  const articleDetailSection = document.getElementById('articleDetailSection');
  const detailBackBtn = document.getElementById('detailBackBtn');
  const detailTitle = document.getElementById('detailTitle');
  const detailCategory = document.getElementById('detailCategory');
  const detailDate = document.getElementById('detailDate');
  const detailReadTime = document.getElementById('detailReadTime');
  const detailTags = document.getElementById('detailTags');
  const detailCover = document.getElementById('detailCover');
  const detailMarkdownContent = document.getElementById('detailMarkdownContent');
  const detailBookmarkBtn = document.getElementById('detailBookmarkBtn');
  const detailEditBtn = document.getElementById('detailEditBtn');
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  const detailExportMdBtn = document.getElementById('detailExportMdBtn');
  const readingProgressBar = document.getElementById('readingProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Profile Elements
  const profileName = document.getElementById('profileName');
  const profileRole = document.getElementById('profileRole');
  const profileBio = document.getElementById('profileBio');
  const profileAvatar = document.getElementById('profileAvatar');
  const bookmarkCountBadge = document.getElementById('bookmarkCountBadge');

  // Editor Modal & Form Elements
  const editorModal = document.getElementById('editorModal');
  const editorModalTitle = document.getElementById('editorModalTitle');
  const closeEditorBtn = document.getElementById('closeEditorBtn');
  const cancelEditorBtn = document.getElementById('cancelEditorBtn');
  const postForm = document.getElementById('postForm');
  const inputId = document.getElementById('postId');
  const inputTitle = document.getElementById('inputTitle');
  const inputPasscode = document.getElementById('inputPasscode');
  const inputExcerpt = document.getElementById('inputExcerpt');
  const inputTags = document.getElementById('inputTags');
  const inputCover = document.getElementById('inputCover');
  const randomCoverBtn = document.getElementById('randomCoverBtn');
  const inputContent = document.getElementById('inputContent');
  const editorTabWrite = document.getElementById('editorTabWrite');
  const editorTabPreview = document.getElementById('editorTabPreview');
  const writePane = document.getElementById('writePane');
  const previewPane = document.getElementById('previewPane');
  const livePreviewOutput = document.getElementById('livePreviewOutput');
  const savePostBtn = document.getElementById('savePostBtn');
  const downloadMdBtn = document.getElementById('downloadMdBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Admin Security Configuration
  const DEFAULT_PASSCODE = '150125';

  // Application State
  let activeView = 'all'; // 'all', 'bookmarked', 'tag'
  let activeTag = null;
  let activePostId = null;
  let isDarkMode = true;

  // Initialize Application
  function init() {
    updateLanguageUI();
    renderMainFeed();
    setupEventListeners();
    updateBookmarkBadge();
    if (window.lucide) lucide.createIcons();

    // Trigger Cloud Realtime DB Sync across all devices (mobile phones & PCs)
    StorageManager.fetchCloudPosts(() => {
      renderMainFeed();
      updateBookmarkBadge();
    });

    // Live Cloud DB Sync: Automatically receive posts from other authors every 30 seconds
    setInterval(() => {
      StorageManager.fetchCloudPosts(() => {
        renderMainFeed();
        updateBookmarkBadge();
      });
    }, 30000);
  }

  // --- UI & FEED RENDERERS ---
  function renderMainFeed() {
    let posts = StorageManager.getPosts();

    // Filter by Search Query
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (query) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    // Filter by Active View Tag or Bookmarks
    if (activeView === 'bookmarked') {
      posts = posts.filter(p => p.bookmarked);
    } else if (activeView === 'tag' && activeTag) {
      posts = posts.filter(p => p.tags && p.tags.includes(activeTag));
    }

    renderTagFilters();
    renderPostCards(posts);
  }

  function renderTagFilters() {
    const posts = StorageManager.getPosts();
    const tagMap = new Map();
    posts.forEach(p => {
      (p.tags || []).forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    tagFilterContainer.innerHTML = '';

    // 'All Posts' Pill
    const allBtn = document.createElement('button');
    allBtn.className = `px-3 py-1.5 rounded-xl text-xs font-medium transition ${
      activeView === 'all' 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;
    allBtn.setAttribute('data-i18n', 'filterAll');
    allBtn.innerText = i18n.t('filterAll');
    allBtn.addEventListener('click', () => {
      activeView = 'all';
      activeTag = null;
      renderMainFeed();
    });
    tagFilterContainer.appendChild(allBtn);

    // Dynamic Tag Pills
    tagMap.forEach((count, tag) => {
      const btn = document.createElement('button');
      const isSelected = activeView === 'tag' && activeTag === tag;
      btn.className = `px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
        isSelected 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`;
      btn.innerHTML = `#${tag} <span class="opacity-60 text-[10px]">(${count})</span>`;
      btn.addEventListener('click', () => {
        activeView = 'tag';
        activeTag = tag;
        renderMainFeed();
      });
      tagFilterContainer.appendChild(btn);
    });
  }

  function renderPostCards(posts) {
    postsGrid.innerHTML = '';

    if (!posts || posts.length === 0) {
      emptyState.classList.remove('hidden');
      postsGrid.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    postsGrid.classList.remove('hidden');

    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1';
      
      const tagsHtml = (post.tags || []).slice(0, 3).map(t => 
        `<span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-medium">#${t}</span>`
      ).join('');

      card.innerHTML = `
        <div class="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src="${post.cover || PRESET_COVERS[0]}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60"></div>
          
          <button class="bookmark-btn absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition shadow-md" data-id="${post.id}">
            <i data-lucide="bookmark" class="w-4 h-4 ${post.bookmarked ? 'fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400' : ''}"></i>
          </button>

          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
            <span class="px-2.5 py-1 bg-indigo-600/80 backdrop-blur-md font-semibold rounded-lg text-[10px] tracking-wide uppercase">${post.category || 'General'}</span>
            <span>${post.readTime || '3 min read'}</span>
          </div>
        </div>

        <div class="p-6 flex flex-col flex-grow">
          <div class="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">${post.date}</div>
          <h3 class="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mb-2 leading-snug">
            ${post.title}
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed flex-grow">
            ${post.excerpt || StorageManager.generateExcerpt(post.content)}
          </p>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${tagsHtml}
            </div>
            <span class="text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
              Read <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
          e.stopPropagation();
          StorageManager.toggleBookmark(post.id);
          renderMainFeed();
          updateBookmarkBadge();
          showToast(post.bookmarked ? 'Bookmark removed' : 'Saved to bookmarks', 'info');
          return;
        }
        openArticleDetail(post.id);
      });

      postsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  // --- ARTICLE DETAIL VIEW LOGIC ---
  function openArticleDetail(postId) {
    const post = StorageManager.getPostById(postId);
    if (!post) return;

    activePostId = post.id;
    detailTitle.innerText = post.title;
    detailCategory.innerText = post.category || 'Personal Learning';
    detailDate.innerText = post.date;
    detailReadTime.innerText = post.readTime || '3 min read';
    detailCover.src = post.cover || PRESET_COVERS[0];

    // Tags
    detailTags.innerHTML = (post.tags || []).map(t => 
      `<span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-medium">#${t}</span>`
    ).join('');

    // Markdown Render with Wikilinks
    const htmlContent = MarkdownEngine.render(post.content || '');
    detailMarkdownContent.innerHTML = htmlContent;
    MarkdownEngine.enhanceCodeBlocks(detailMarkdownContent);

    // Wikilink Click Listener Injection
    detailMarkdownContent.querySelectorAll('.wikilink').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTitle = link.getAttribute('data-target');
        const targetPost = StorageManager.getPostById(targetTitle);
        if (targetPost) {
          openArticleDetail(targetPost.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          showToast(`Note "${targetTitle}" not found`, 'warning');
        }
      });
    });

    // Update Bookmark State Icon
    const bookmarkIcon = detailBookmarkBtn.querySelector('i');
    if (bookmarkIcon) {
      if (post.bookmarked) {
        bookmarkIcon.classList.add('fill-indigo-600', 'text-indigo-600', 'dark:fill-indigo-400', 'dark:text-indigo-400');
      } else {
        bookmarkIcon.classList.remove('fill-indigo-600', 'text-indigo-600', 'dark:fill-indigo-400', 'dark:text-indigo-400');
      }
    }

    switchViewSection('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  }

  function switchViewSection(view) {
    postsViewSection.classList.add('hidden');
    articleDetailSection.classList.add('hidden');
    if (searchSection) searchSection.classList.add('hidden');

    if (view === 'detail') {
      articleDetailSection.classList.remove('hidden');
    } else {
      if (searchSection) searchSection.classList.remove('hidden');
      postsViewSection.classList.remove('hidden');
      renderMainFeed();
    }
  }

  // --- POST EDITOR STUDIO (DIRECT ACCESSIBLE) ---
  function openEditor(postId = null) {
    if (postId) {
      const post = StorageManager.getPostById(postId);
      if (post) {
        editorModalTitle.innerText = i18n.t('editorTitleEdit');
        inputId.value = post.id;
        inputTitle.value = post.title;
        inputExcerpt.value = post.excerpt || '';
        inputTags.value = (post.tags || []).join(', ');
        inputCover.value = post.cover || '';
        inputContent.value = post.content || '';
      }
    } else {
      editorModalTitle.innerText = i18n.t('editorTitleNew');
      postForm.reset();
      inputId.value = '';
      inputTitle.value = '';
      inputExcerpt.value = '';
      inputTags.value = '';
      inputContent.value = '';
      if (inputPasscode) inputPasscode.value = DEFAULT_PASSCODE;
      inputCover.value = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];
    }

    switchEditorTab('write');
    editorModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      inputTitle.focus();
    }, 100);
  }

  function closeEditor() {
    editorModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function switchEditorTab(tab) {
    if (tab === 'write') {
      editorTabWrite.className = 'px-3 py-1 rounded-lg bg-indigo-600 text-white font-medium';
      editorTabPreview.className = 'px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      writePane.classList.remove('hidden');
      previewPane.classList.add('hidden');
    } else {
      editorTabPreview.className = 'px-3 py-1 rounded-lg bg-indigo-600 text-white font-medium';
      editorTabWrite.className = 'px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      writePane.classList.add('hidden');
      previewPane.classList.remove('hidden');

      // Update Live Preview Output
      const content = inputContent.value;
      livePreviewOutput.innerHTML = MarkdownEngine.render(content);
      MarkdownEngine.enhanceCodeBlocks(livePreviewOutput);
    }
  }

  // --- EVENT LISTENERS SETUP ---
  function setupEventListeners() {
    langToggleBtn.addEventListener('click', () => {
      const current = i18n.getLang();
      const next = current === 'en' ? 'vi' : 'en';
      i18n.setLang(next);
      updateLanguageUI();
      renderMainFeed();
      if (activePostId) openArticleDetail(activePostId);
      showToast(next === 'vi' ? 'Đã chuyển sang Tiếng Việt!' : 'Switched to English!', 'info');
    });

    // Search Listener
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderMainFeed();
      });
    }

    // Detail Section Actions
    detailBackBtn.addEventListener('click', () => {
      activePostId = null;
      switchViewSection('all');
    });

    detailBookmarkBtn.addEventListener('click', () => {
      if (activePostId) {
        StorageManager.toggleBookmark(activePostId);
        openArticleDetail(activePostId);
        updateBookmarkBadge();
      }
    });

    detailExportMdBtn.addEventListener('click', () => {
      if (activePostId) {
        const post = StorageManager.getPostById(activePostId);
        if (post) StorageManager.exportPostMD(post);
      }
    });

    detailEditBtn.addEventListener('click', () => {
      if (activePostId) {
        openEditor(activePostId);
      }
    });

    detailDeleteBtn.addEventListener('click', () => {
      if (activePostId) {
        if (confirm('Are you sure you want to delete this article?')) {
          StorageManager.deletePost(activePostId);
          showToast('Article deleted', 'error');
          switchViewSection('all');
        }
      }
    });

    window.addEventListener('scroll', () => {
      if (!articleDetailSection.classList.contains('hidden')) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        const progress = Math.min(100, Math.max(0, (scrollPos / totalHeight) * 100));
        readingProgressBar.style.width = `${progress}%`;
      }
    });

    // + New Post Buttons
    openEditorBtn.addEventListener('click', () => {
      openEditor();
    });

    const emptyStateBtn = document.getElementById('emptyStateCreateBtn');
    if (emptyStateBtn) {
      emptyStateBtn.addEventListener('click', () => {
        openEditor();
      });
    }

    closeEditorBtn.addEventListener('click', closeEditor);
    cancelEditorBtn.addEventListener('click', closeEditor);

    editorTabWrite.addEventListener('click', () => switchEditorTab('write'));
    editorTabPreview.addEventListener('click', () => switchEditorTab('preview'));

    randomCoverBtn.addEventListener('click', () => {
      inputCover.value = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];
    });

    downloadMdBtn.addEventListener('click', () => {
      const tempPost = {
        title: inputTitle.value || 'Untitled',
        date: new Date().toISOString().split('T')[0],
        tags: inputTags.value.split(',').map(t => t.trim()).filter(Boolean),
        cover: inputCover.value,
        content: inputContent.value
      };
      StorageManager.exportPostMD(tempPost);
    });

    function handleSavePost(e) {
      if (e) e.preventDefault();

      const enteredPasscode = inputPasscode ? inputPasscode.value.trim() : '';
      if (enteredPasscode !== DEFAULT_PASSCODE) {
        showToast(i18n.t('adminWrongPasscode'), 'error');
        if (inputPasscode) {
          inputPasscode.value = '';
          inputPasscode.focus();
        }
        return;
      }

      if (!inputTitle.value.trim()) {
        alert('Please enter a post title');
        return;
      }
      if (!inputContent.value.trim()) {
        alert('Please enter post content');
        return;
      }

      const postData = {
        id: inputId.value || undefined,
        title: inputTitle.value.trim(),
        category: 'Personal Learning',
        excerpt: inputExcerpt.value.trim(),
        tags: inputTags.value.split(',').map(t => t.trim()).filter(Boolean),
        cover: inputCover.value.trim() || PRESET_COVERS[0],
        content: inputContent.value
      };

      StorageManager.upsertPost(postData);
      closeEditor();

      if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      showToast('Bài viết đã xuất bản & đồng bộ thành công!', 'success');

      if (activePostId && activePostId === postData.id) {
        openArticleDetail(postData.id);
      } else {
        switchViewSection('all');
      }
    }

    savePostBtn.addEventListener('click', handleSavePost);
    postForm.addEventListener('submit', handleSavePost);

    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      isDarkMode = document.documentElement.classList.contains('dark');
      renderMainFeed();
    });

    bookmarksBtn.addEventListener('click', () => {
      showToast('Viewing saved posts', 'info');
    });

    exportAllBtn.addEventListener('click', () => {
      StorageManager.exportAllJSON();
    });

    // Navigation Buttons
    navFeedBtn.addEventListener('click', () => {
      activeView = 'all';
      activeTag = null;
      switchViewSection('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- HELPERS ---
  function updateBookmarkBadge() {
    const posts = StorageManager.getPosts();
    const count = posts.filter(p => p.bookmarked).length;
    bookmarkCountBadge.innerText = count;
  }

  function updateLanguageUI() {
    langLabel.innerText = i18n.getLang().toUpperCase();
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = i18n.t(key);
        } else {
          el.innerText = i18n.t(key);
        }
      }
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      info: 'bg-slate-900/90 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700/50 dark:border-slate-200/50',
      success: 'bg-emerald-600 text-white border-emerald-500/50 shadow-emerald-600/30',
      warning: 'bg-amber-600 text-white border-amber-500/50 shadow-amber-600/30',
      error: 'bg-rose-600 text-white border-rose-500/50 shadow-rose-600/30'
    };

    toast.className = `px-5 py-3 rounded-2xl text-xs font-semibold border backdrop-blur-md shadow-xl transition-all duration-300 pointer-events-auto flex items-center gap-2 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerText = message;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Start App
  init();
});

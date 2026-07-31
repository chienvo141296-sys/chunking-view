// Main Application Controller for Chunking Blog

document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeTag = null;
  let searchQuery = '';
  let activePostId = null;
  let pendingAdminAction = null; // callback action after admin unlock
  let isDarkMode = document.documentElement.classList.contains('dark');

  const ADMIN_PASSCODE_KEY = 'chunking_admin_passcode_v1';
  const DEFAULT_PASSCODE = '150125';

  // DOM Elements
  const postsGrid = document.getElementById('postsGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const tagsCloud = document.getElementById('tagsCloud');
  const sectionTitle = document.getElementById('sectionTitle');
  const postCountBadge = document.getElementById('postCountBadge');
  const activeFilterBar = document.getElementById('activeFilterBar');
  const activeFilterTag = document.getElementById('activeFilterTag');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const bookmarkBadge = document.getElementById('bookmarkBadge');

  // View Sections
  const searchSection = document.getElementById('searchSection');
  const postsViewSection = document.getElementById('postsViewSection');
  const articleDetailSection = document.getElementById('articleDetailSection');

  // i18n & Language Switcher
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langCurrentText = document.getElementById('langCurrentText');

  // Admin Auth Modal Elements
  const adminAuthModal = document.getElementById('adminAuthModal');
  const closeAdminAuthBtn = document.getElementById('closeAdminAuthBtn');
  const adminAuthForm = document.getElementById('adminAuthForm');
  const adminPasscodeInput = document.getElementById('adminPasscodeInput');

  // Editor Modal Elements
  const editorModal = document.getElementById('editorModal');
  const openEditorBtn = document.getElementById('openEditorBtn');
  const closeEditorBtn = document.getElementById('closeEditorBtn');
  const cancelEditorBtn = document.getElementById('cancelEditorBtn');
  const savePostBtn = document.getElementById('savePostBtn');
  const postForm = document.getElementById('postForm');
  const editorModalTitle = document.getElementById('editorModalTitle');

  const inputId = document.getElementById('postId');
  const inputTitle = document.getElementById('inputTitle');
  const inputExcerpt = document.getElementById('inputExcerpt');
  const inputTags = document.getElementById('inputTags');
  const inputCover = document.getElementById('inputCover');
  const inputContent = document.getElementById('inputContent');

  const randomCoverBtn = document.getElementById('randomCoverBtn');
  const downloadMdBtn = document.getElementById('downloadMdBtn');
  const editorTabWrite = document.getElementById('editorTabWrite');
  const editorTabPreview = document.getElementById('editorTabPreview');
  const writePane = document.getElementById('writePane');
  const previewPane = document.getElementById('previewPane');
  const livePreviewOutput = document.getElementById('livePreviewOutput');

  // Article Detail Elements
  const backToGridBtn = document.getElementById('backToGridBtn');
  const detailBookmarkBtn = document.getElementById('detailBookmarkBtn');
  const detailExportMdBtn = document.getElementById('detailExportMdBtn');
  const detailEditBtn = document.getElementById('detailEditBtn');
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  const articleCoverImg = document.getElementById('articleCoverImg');
  const articleTitle = document.getElementById('articleTitle');
  const articleDate = document.getElementById('articleDate');
  const articleReadTime = document.getElementById('articleReadTime');
  const articleMarkdownBody = document.getElementById('articleMarkdownBody');
  const articleTagsList = document.getElementById('articleTagsList');
  const tableOfContents = document.getElementById('tableOfContents');
  const readingProgressBar = document.getElementById('readingProgressBar');
  const relatedNotesGrid = document.getElementById('relatedNotesGrid');
  const giscusContainer = document.getElementById('giscusContainer');

  // Global Actions
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const bookmarksBtn = document.getElementById('bookmarksBtn');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const importFile = document.getElementById('importFile');
  const navBrand = document.getElementById('navBrand');

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

  // --- ADMIN AUTHENTICATION GUARD ---
  function requireAdminAuth(onSuccessCallback) {
    const isUnlocked = sessionStorage.getItem('chunking_admin_unlocked') === 'true';
    if (isUnlocked) {
      onSuccessCallback();
      return;
    }

    pendingAdminAction = onSuccessCallback;
    adminPasscodeInput.value = '';
    adminAuthModal.classList.remove('hidden');
    adminPasscodeInput.focus();
    if (window.lucide) lucide.createIcons();
  }

  function closeAdminAuth() {
    adminAuthModal.classList.add('hidden');
    pendingAdminAction = null;
  }

  // --- i18n DYNAMIC UI UPDATER ---
  function updateLanguageUI() {
    const currentLang = i18n.getLang();
    langCurrentText.innerText = currentLang === 'vi' ? 'VI' : 'EN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.innerText = i18n.t(key);
    });

    searchInput.placeholder = i18n.t('searchPlaceholder');
  }

  // --- RENDER MAIN FEED & POST CARDS ---
  function renderMainFeed() {
    let posts = StorageManager.getPosts();

    // 1. Tag Filter
    if (activeTag) {
      posts = posts.filter(p => p.tags && p.tags.map(t => t.toLowerCase()).includes(activeTag.toLowerCase()));
      activeFilterBar.classList.remove('hidden');
      activeFilterTag.innerText = `#${activeTag}`;
    } else {
      activeFilterBar.classList.add('hidden');
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // 3. Sorting
    const sortVal = sortSelect.value;
    if (sortVal === 'newest') {
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortVal === 'oldest') {
      posts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortVal === 'readTime') {
      posts.sort((a, b) => parseInt(b.readTime) - parseInt(a.readTime));
    } else if (sortVal === 'title') {
      posts.sort((a, b) => a.title.localeCompare(b.title));
    }

    postCountBadge.innerText = posts.length;
    renderTagsCloud();

    if (posts.length === 0) {
      postsGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      postsGrid.innerHTML = posts.map(post => createPostCardHTML(post)).join('');
    }

    if (window.lucide) lucide.createIcons();
  }

  // Create Post Card HTML
  function createPostCardHTML(post) {
    const isVi = i18n.getLang() === 'vi';

    const tagsHtml = (post.tags || []).slice(0, 3).map(tag => 
      `<span class="tag-pill px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer" data-tag="${tag}">#${tag}</span>`
    ).join('');

    const isBookmarked = post.bookmarked;

    return `
      <div class="post-card bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col cursor-pointer group shadow-sm hover:shadow-xl dark:shadow-none" data-id="${post.id}">
        <!-- Card Cover Banner -->
        <div class="h-48 w-full relative overflow-hidden bg-slate-900">
          <img src="${post.cover}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-85">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

          <button class="bookmark-btn absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:text-amber-400 backdrop-blur-md transition" data-id="${post.id}">
            <i data-lucide="bookmark" class="w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}"></i>
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex flex-col flex-grow">
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${post.date}</span>
            <span>•</span>
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${post.readTime}</span>
          </div>

          <h3 class="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug mb-2 line-clamp-2">
            ${post.title}
          </h3>

          <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3 flex-grow">
            ${post.excerpt || 'Read details...'}
          </p>

          <!-- Card Tags Footer -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 mt-auto">
            <div class="flex flex-wrap gap-1">
              ${tagsHtml}
            </div>
            <span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition inline-flex items-center gap-1">
              ${isVi ? 'Đọc bài' : 'Read'} <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // Render Tags Cloud
  function renderTagsCloud() {
    const posts = StorageManager.getPosts();
    const tagMap = {};

    posts.forEach(p => {
      (p.tags || []).forEach(t => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });

    const sortedTags = Object.keys(tagMap).sort((a, b) => tagMap[b] - tagMap[a]).slice(0, 8);

    tagsCloud.innerHTML = sortedTags.map(t => `
      <button class="tag-cloud-btn px-2.5 py-1 rounded-lg text-xs font-medium border transition ${activeTag === t ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}" data-tag="${t}">
        #${t} <span class="text-[10px] opacity-70">(${tagMap[t]})</span>
      </button>
    `).join('');
  }

  // --- RENDER ARTICLE DETAIL VIEW ---
  function openArticleDetail(idOrTitle) {
    const posts = StorageManager.getPosts();
    let post = posts.find(p => p.id === idOrTitle);
    
    if (!post) {
      post = posts.find(p => p.title.toLowerCase() === idOrTitle.toLowerCase());
    }

    if (!post) {
      showToast(`Note "${idOrTitle}" not found`, 'error');
      return;
    }

    activePostId = post.id;
    switchViewSection('detail');

    articleCoverImg.src = post.cover;
    articleTitle.innerText = post.title;
    articleDate.innerText = post.date;
    articleReadTime.innerText = post.readTime;

    // Render Markdown Body
    const htmlContent = MarkdownEngine.render(post.content);
    articleMarkdownBody.innerHTML = htmlContent;
    MarkdownEngine.enhanceCodeBlocks(articleMarkdownBody);

    // Tags
    articleTagsList.innerHTML = (post.tags || []).map(t => 
      `<span class="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg">#${t}</span>`
    ).join('');

    // Table of Contents
    const tocList = MarkdownEngine.extractTableOfContents(post.content);
    if (tocList.length > 0) {
      tableOfContents.innerHTML = tocList.map(item => `
        <a href="#${item.id}" class="block hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate pl-${(item.level - 1) * 3}">
          ${item.text}
        </a>
      `).join('');
    } else {
      tableOfContents.innerHTML = '<span class="text-slate-400 dark:text-slate-600 italic">No section headers</span>';
    }

    // Render Connected / Related Notes
    renderRelatedNotes(post);

    // Render Giscus Discussion Widget
    renderGiscusComments(post.title);

    // Bookmark State
    detailBookmarkBtn.innerHTML = `<i data-lucide="bookmark" class="w-4 h-4 ${post.bookmarked ? 'fill-amber-400 text-amber-400' : ''}"></i>`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
  }

  // Render Giscus Comments
  function renderGiscusComments(termTitle) {
    if (!giscusContainer) return;
    giscusContainer.innerHTML = ''; // Reset container

    const giscusScript = document.createElement('script');
    giscusScript.src = 'https://giscus.app/client.js';
    giscusScript.setAttribute('data-repo', 'chunkingview/chunking-view');
    giscusScript.setAttribute('data-repo-id', 'R_kgDOMxxx');
    giscusScript.setAttribute('data-category', 'General');
    giscusScript.setAttribute('data-category-id', 'DIC_kwDOMxxx');
    giscusScript.setAttribute('data-mapping', 'title');
    giscusScript.setAttribute('data-term', termTitle);
    giscusScript.setAttribute('data-strict', '0');
    giscusScript.setAttribute('data-reactions-enabled', '1');
    giscusScript.setAttribute('data-emit-metadata', '0');
    giscusScript.setAttribute('data-input-position', 'top');
    giscusScript.setAttribute('data-theme', isDarkMode ? 'dark_dimmed' : 'light');
    giscusScript.setAttribute('data-lang', i18n.getLang() === 'vi' ? 'vi' : 'en');
    giscusScript.setAttribute('crossorigin', 'anonymous');
    giscusScript.async = true;

    giscusContainer.appendChild(giscusScript);
  }

  // Render Connected / Related Notes
  function renderRelatedNotes(currentPost) {
    const allPosts = StorageManager.getPosts().filter(p => p.id !== currentPost.id);
    const related = allPosts.filter(p => {
      return (p.tags && currentPost.tags && p.tags.some(t => currentPost.tags.includes(t)));
    }).slice(0, 2);

    if (related.length === 0) {
      relatedNotesGrid.innerHTML = `<span class="text-xs text-slate-400 dark:text-slate-500 italic col-span-2">No connected notes yet. Create more articles to build your digital garden graph!</span>`;
      return;
    }

    relatedNotesGrid.innerHTML = related.map(rel => `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer related-card shadow-sm" data-id="${rel.id}">
        <h5 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition">${rel.title}</h5>
      </div>
    `).join('');

    document.querySelectorAll('.related-card').forEach(card => {
      card.addEventListener('click', () => openArticleDetail(card.dataset.id));
    });
  }

  // --- VIEW SWITCHING MANAGER ---
  function switchViewSection(view) {
    if (searchSection) searchSection.classList.add('hidden');
    postsViewSection.classList.add('hidden');
    articleDetailSection.classList.add('hidden');

    if (view === 'detail') {
      articleDetailSection.classList.remove('hidden');
    } else {
      if (searchSection) searchSection.classList.remove('hidden');
      postsViewSection.classList.remove('hidden');
      renderMainFeed();
    }
  }

  // --- POST EDITOR MODAL LOGIC ---
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
      inputCover.value = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];
    }

    switchEditorTab('write');
    editorModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      inputTitle.focus();
    }, 150);
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

    // Admin Security Verification Form Listener
    closeAdminAuthBtn.addEventListener('click', closeAdminAuth);

    adminAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = adminPasscodeInput.value.trim();
      const expected = localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_PASSCODE;

      if (entered === expected) {
        sessionStorage.setItem('chunking_admin_unlocked', 'true');
        showToast(i18n.t('adminUnlocked'), 'success');
        adminAuthModal.classList.add('hidden');
        adminPasscodeInput.blur();

        const action = pendingAdminAction;
        pendingAdminAction = null;

        if (action) {
          setTimeout(() => {
            action();
          }, 100);
        }
      } else {
        showToast(i18n.t('adminWrongPasscode'), 'error');
        adminPasscodeInput.value = '';
        adminPasscodeInput.focus();
      }
    });

    navBrand.addEventListener('click', () => {
      activeTag = null;
      searchQuery = '';
      searchInput.value = '';
      switchViewSection('all');
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery) clearSearchBtn.classList.remove('hidden');
      else clearSearchBtn.classList.add('hidden');
      renderMainFeed();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      renderMainFeed();
    });

    sortSelect.addEventListener('change', () => renderMainFeed());

    document.addEventListener('click', (e) => {
      const tagBtn = e.target.closest('[data-tag]');
      if (tagBtn) {
        e.stopPropagation();
        activeTag = tagBtn.dataset.tag;
        switchViewSection('all');
        return;
      }

      const wikilinkBtn = e.target.closest('[data-wikilink]');
      if (wikilinkBtn) {
        e.preventDefault();
        e.stopPropagation();
        const targetTitle = wikilinkBtn.dataset.wikilink;
        openArticleDetail(targetTitle);
      }
    });

    resetFilterBtn.addEventListener('click', () => {
      activeTag = null;
      renderMainFeed();
    });

    postsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.post-card');
      const bookmarkBtn = e.target.closest('.bookmark-btn');

      if (bookmarkBtn) {
        e.stopPropagation();
        const id = bookmarkBtn.dataset.id;
        StorageManager.toggleBookmark(id);
        renderMainFeed();
        updateBookmarkBadge();
        showToast('Bookmark updated!', 'info');
        return;
      }

      if (card) {
        const id = card.dataset.id;
        openArticleDetail(id);
      }
    });

    backToGridBtn.addEventListener('click', () => switchViewSection('all'));
    
    detailBookmarkBtn.addEventListener('click', () => {
      if (activePostId) {
        StorageManager.toggleBookmark(activePostId);
        openArticleDetail(activePostId);
        updateBookmarkBadge();
        showToast('Bookmark status updated!', 'info');
      }
    });

    detailExportMdBtn.addEventListener('click', () => {
      if (activePostId) {
        const post = StorageManager.getPostById(activePostId);
        if (post) StorageManager.exportPostMD(post);
      }
    });

    // Guard Edit & Delete buttons with Admin Passcode
    detailEditBtn.addEventListener('click', () => {
      if (activePostId) {
        requireAdminAuth(() => openEditor(activePostId));
      }
    });

    detailDeleteBtn.addEventListener('click', () => {
      if (activePostId) {
        requireAdminAuth(() => {
          if (confirm('Are you sure you want to delete this article?')) {
            StorageManager.deletePost(activePostId);
            showToast('Article deleted', 'error');
            switchViewSection('all');
          }
        });
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

    // Guard + New Post Buttons with Admin Passcode
    openEditorBtn.addEventListener('click', () => {
      requireAdminAuth(() => openEditor());
    });

    document.getElementById('emptyStateCreateBtn').addEventListener('click', () => {
      requireAdminAuth(() => openEditor());
    });

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
      showToast('Exported JSON backup', 'info');
    });

    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const success = StorageManager.importJSON(event.target.result);
        if (success) {
          showToast('Imported backup successfully!', 'success');
          renderMainFeed();
        } else {
          showToast('Failed to parse JSON file', 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  function updateBookmarkBadge() {
    const posts = StorageManager.getPosts();
    const count = posts.filter(p => p.bookmarked).length;
    if (count > 0) {
      bookmarkBadge.innerText = count;
      bookmarkBadge.classList.remove('hidden');
    } else {
      bookmarkBadge.classList.add('hidden');
    }
  }

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const bgClass = type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200' :
                    type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' :
                    'bg-indigo-950/90 border-indigo-800 text-indigo-200';

    toast.className = `toast-msg flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgClass} shadow-2xl backdrop-blur-md text-xs font-medium pointer-events-auto`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-4 h-4"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  init();
});

// Internationalization (i18n) Engine for English & Vietnamese

const TRANSLATIONS = {
  en: {
    brandSubtitle: "Personal Learning • Tech • Life",
    navAll: "All Posts",
    navEngineering: "Engineering Path",
    navLearning: "Personal Learning",
    navLife: "View of Life",
    navAbout: "About Me",
    navRoadmap: "Roadmap",
    navStats: "Stats",
    newPost: "New Post",
    
    heroBadge: "Chunking view • Personal Learning Journal",
    heroTitlePrefix: "Chunking Knowledge:",
    heroTitleCode: "Code",
    heroTitleMindset: "Mindset",
    heroTitleLife: "Life",
    heroDescription: "Welcome to my digital blog. Deconstructing complex systems into digestible mental chunks, documenting software architecture, and recording my personal growth journey.",
    
    searchPlaceholder: "Search posts, code snippets, tags or concepts...",
    sortNewest: "Latest First",
    sortOldest: "Oldest First",
    sortReadTime: "Read Time",
    sortTitle: "Title (A-Z)",
    
    heroReadBio: "Read Full Bio",
    
    filteringBy: "Filtering by:",
    clearFilter: "Clear Filter",
    latestArticles: "Latest Articles",
    noArticlesTitle: "No articles found",
    noArticlesDesc: "No matching posts found. Try adjusting your search query or tags, or write a new post to get started!",
    createFirstPost: "Create First Post",
    
    backToArticles: "Back to Articles",
    tableOfContents: "Table of Contents",
    connectedNotes: "Connected & Related Notes",
    communityComments: "Community Discussion & Feedback",
    
    aboutHeaderTitle: "Software Engineer",
    aboutHeaderRole: "Full-Stack & Systems Architecture",
    editProfileBtn: "Edit Intro & Profile",
    
    statArticles: "Total Articles",
    statWords: "Total Words",
    statReadTime: "Est. Total Reading Time",
    statCategories: "Categories Covered",
    statTodayViews: "Today's Page Views",
    statVisitors: "Daily Unique Visitors",
    statAnalyticsStatus: "Live Traffic Tracking",
    statAnalyticsOnline: "Active (GoatCounter)",

    statBreakdown: "Post Breakdown by Stream",
    statTopTopics: "Top Topics & Technologies",
    
    editorTitleNew: "Post Studio — Write New Entry",
    editorTitleEdit: "Post Studio — Edit Article",
    loadTemplate: "Load Template...",
    
    labelTitle: "Article Title *",
    labelStream: "Stream / Category *",
    labelExcerpt: "Short Excerpt / Summary",
    labelTags: "Tags (Comma-separated)",
    labelCover: "Cover Banner Image (URL or Unsplash Preset)",
    presetImageBtn: "Preset Image",
    labelContent: "Content (Markdown + [[Wikilinks]] Supported)",
    
    btnCancel: "Cancel",
    btnPublish: "Publish Post",
    btnExportMd: "Export .md File",
    
    catEngineering: "💻 Engineering Path",
    catLearning: "📚 Personal Learning",
    catLife: "💡 View of Life",

    footerText: "Chunking view — Built for Personal Growth, Digital Gardening & Life Philosophy.",
    footerNote: "All posts stored locally in browser storage with instant Markdown export capability."
  },
  
  vi: {
    brandSubtitle: "Học tập • Công nghệ • Cuộc sống",
    navAll: "Tất cả bài viết",
    navEngineering: "Hành trình Kỹ thuật",
    navLearning: "Học tập Cá nhân",
    navLife: "Quan điểm Sống",
    navAbout: "Về Tôi",
    navRoadmap: "Lộ trình",
    navStats: "Thống kê",
    newPost: "Bài viết Mới",
    
    heroBadge: "Chunking view • Nhật ký Học tập & Lập trình",
    heroTitlePrefix: "Hệ thống Hóa Kiến thức:",
    heroTitleCode: "Lập trình",
    heroTitleMindset: "Tư duy",
    heroTitleLife: "Cuộc sống",
    heroDescription: "Chào mừng bạn đến với trang blog cá nhân của tôi. Chia nhỏ và đúc kết các hệ thống phức tạp, ghi chép kiến trúc phần mềm và hành trình phát triển bản thân.",
    
    searchPlaceholder: "Tìm kiếm bài viết, đoạn mã, thẻ hoặc khái niệm...",
    sortNewest: "Mới nhất",
    sortOldest: "Cũ nhất",
    sortReadTime: "Thời gian đọc",
    sortTitle: "Tiêu đề (A-Z)",
    
    heroReadBio: "Xem Giới thiệu Chi tiết",
    
    filteringBy: "Đang lọc theo:",
    clearFilter: "Xóa bộ lọc",
    latestArticles: "Bài viết Mới nhất",
    noArticlesTitle: "Không tìm thấy bài viết",
    noArticlesDesc: "Không có bài viết nào phù hợp. Hãy thử thay đổi từ khóa tìm kiếm hoặc viết một bài mới!",
    createFirstPost: "Tạo Bài viết Đầu tiên",
    
    backToArticles: "Quay lại danh sách",
    tableOfContents: "Mục lục bài viết",
    connectedNotes: "Bài viết Liên quan",
    communityComments: "Thảo luận & Bình luận",
    
    aboutHeaderTitle: "Kỹ sư Phần mềm",
    aboutHeaderRole: "Kiến trúc Hệ thống & Full-Stack",
    editProfileBtn: "Chỉnh sửa Giới thiệu",
    
    statArticles: "Tổng số Bài viết",
    statWords: "Tổng số Từ",
    statReadTime: "Tổng Thời gian Đọc",
    statCategories: "Chủ đề Đã viết",
    statTodayViews: "Lượt xem trong ngày",
    statVisitors: "Người xem trong ngày",
    statAnalyticsStatus: "Theo dõi Lượt truy cập",
    statAnalyticsOnline: "Đang hoạt động (GoatCounter)",

    statBreakdown: "Phân bố Bài viết theo Chủ đề",
    statTopTopics: "Công nghệ & Chủ đề Nổi bật",
    
    editorTitleNew: "Post Studio — Soạn thảo Bài viết Mới",
    editorTitleEdit: "Post Studio — Chỉnh sửa Bài viết",
    loadTemplate: "Nạp Mẫu bài viết...",
    
    labelTitle: "Tiêu đề Bài viết *",
    labelStream: "Chủ đề / Danh mục *",
    labelExcerpt: "Tóm tắt ngắn",
    labelTags: "Thẻ (Phân cách bằng dấu phẩy)",
    labelCover: "Ảnh bìa Banner (Đường dẫn URL hoặc Mẫu)",
    presetImageBtn: "Chọn Ảnh Mẫu",
    labelContent: "Nội dung (Hỗ trợ Markdown & [[Wikilinks]])",
    
    btnCancel: "Hủy bỏ",
    btnPublish: "Xuất bản Bài viết",
    btnExportMd: "Xuất file .md",
    
    catEngineering: "💻 Hành trình Kỹ thuật",
    catLearning: "📚 Học tập Cá nhân",
    catLife: "💡 Quan điểm Sống",

    footerText: "Chunking view — Được xây dựng cho việc Phát triển Bản thân & Triết lý Sống.",
    footerNote: "Tất cả bài viết được lưu trữ an toàn trong trình duyệt hỗ trợ xuất Markdown nhanh chóng."
  }
};

const STORAGE_KEY_LANG = 'chunking_view_lang_v1';

class i18n {
  static getLang() {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'en';
  }

  static setLang(lang) {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }

  static t(key) {
    const lang = this.getLang();
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
  }
}

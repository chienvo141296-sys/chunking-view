// Markdown Parsing & Syntax Highlighting Engine

class MarkdownEngine {
  static init() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        highlight: function(code, lang) {
          if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (err) {}
          }
          if (typeof hljs !== 'undefined') {
            try {
              return hljs.highlightAuto(code).value;
            } catch (err) {}
          }
          return code;
        }
      });
    }
  }

  static render(markdownText) {
    if (!markdownText) return '';

    // Convert [[Wikilinks]] to HTML links before marked parsing
    const processedText = markdownText.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const cleanTitle = title.trim();
      return `<a href="#" class="wikilink-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 text-xs font-semibold hover:border-indigo-500 hover:text-white transition" data-wikilink="${cleanTitle}"><i data-lucide="link" class="w-3 h-3"></i> ${cleanTitle}</a>`;
    });

    if (typeof marked === 'undefined') return processedText;
    let html = marked.parse(processedText);
    return html;
  }

  static calculateReadTime(text) {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }

  static countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  static extractTableOfContents(markdownText) {
    const lines = (markdownText || '').split('\n');
    const toc = [];

    lines.forEach(line => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\[\[([^\]]+)\]\]/g, '$1');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        toc.push({ level, text, id });
      }
    });

    return toc;
  }

  static enhanceCodeBlocks(container) {
    const preBlocks = container.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.querySelector('.copy-code-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5 inline"></i> Copy';

      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 inline text-emerald-400"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5 inline"></i> Copy';
            if (window.lucide) lucide.createIcons();
          }, 2000);
        });
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons();
  }
}

MarkdownEngine.init();

// RedBot Global JS & i18n (ES / EN)
(function () {
  const STORAGE_KEY = 'redbot_lang';

  const SHARED_I18N = {
    en: {
      skipLink: 'Skip to main content',
      logoAria: 'Go to RedBot home',
      menuToggle: 'Menu',
      nav: {
        '/commands': 'Commands',
        '/privacy': 'Privacy',
        '/tos': 'Terms',
        'https://redbot.me/invite': 'Invite'
      },
      footerDesc: '© 2026 RedBot.',
      footerTitles: {
        'Proyecto': 'Project',
        'Soporte': 'Support',
        'Legal': 'Legal'
      },
      footerLinks: {
        '/commands': 'Commands',
        'https://redbot.me/invite': 'Invite',
        '/staff': 'Team',
        'https://discord.gg/sYdyS8Ez3s': 'Support Server',
        '/privacy': 'Privacy Policy',
        '/tos': 'Terms of Service'
      }
    }
  };

  function normalizeLang(value) {
    if (!value) return null;
    const v = String(value).toLowerCase().trim();
    if (v.startsWith('en')) return 'en';
    if (v.startsWith('es')) return 'es';
    return null;
  }

  function detectInitialLang() {
    try {
      const param = new URLSearchParams(window.location.search).get('lang');
      const fromParam = normalizeLang(param);
      if (fromParam) {
        localStorage.setItem(STORAGE_KEY, fromParam);
        return fromParam;
      }
      const saved = normalizeLang(localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch (e) {}

    const browserLangs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'es'];

    for (const l of browserLangs) {
      const norm = normalizeLang(l);
      if (norm) return norm;
    }
    return 'es';
  }

  function storeOriginal(el, attr, value) {
    if (!el.dataset[attr]) {
      el.dataset[attr] = value;
    }
  }

  function applySharedTranslations(lang) {
    const isEn = lang === 'en';
    const en = SHARED_I18N.en;

    const skip = document.querySelector('.skip-link');
    if (skip) {
      storeOriginal(skip, 'esText', skip.textContent);
      skip.textContent = isEn ? en.skipLink : skip.dataset.esText;
    }

    const logo = document.querySelector('.nav-logo');
    if (logo) {
      storeOriginal(logo, 'esAria', logo.getAttribute('aria-label') || '');
      logo.setAttribute('aria-label', isEn ? en.logoAria : logo.dataset.esAria);
    }

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      storeOriginal(menuToggle, 'esText', menuToggle.textContent);
      menuToggle.textContent = isEn ? en.menuToggle : menuToggle.dataset.esText;
    }

    document.querySelectorAll('#nav-links a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (en.nav[href]) {
        storeOriginal(a, 'esText', a.textContent);
        a.textContent = isEn ? en.nav[href] : a.dataset.esText;
      }
    });

    const footerDesc = document.querySelector('.footer-desc');
    if (footerDesc) {
      storeOriginal(footerDesc, 'esText', footerDesc.textContent);
      footerDesc.textContent = isEn ? en.footerDesc : footerDesc.dataset.esText;
    }

    document.querySelectorAll('.footer-title').forEach(el => {
      storeOriginal(el, 'esText', el.textContent.trim());
      const orig = el.dataset.esText;
      if (en.footerTitles[orig]) {
        el.textContent = isEn ? en.footerTitles[orig] : orig;
      }
    });

    document.querySelectorAll('.footer-section a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (en.footerLinks[href]) {
        storeOriginal(a, 'esText', a.textContent);
        a.textContent = isEn ? en.footerLinks[href] : a.dataset.esText;
      }
    });
  }

  function applyPageTranslations(lang) {
    const isEn = lang === 'en';
    const pageDict = (window.REDBOT_I18N && window.REDBOT_I18N.en) || {};

    if (!window.__redbotTitleEs) {
      window.__redbotTitleEs = document.title;
    }
    if (window.REDBOT_I18N && window.REDBOT_I18N.titleEn) {
      document.title = isEn ? window.REDBOT_I18N.titleEn : window.__redbotTitleEs;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      storeOriginal(el, 'esText', el.textContent);
      if (isEn && pageDict[key] !== undefined) {
        el.textContent = pageDict[key];
      } else {
        el.textContent = el.dataset.esText;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      storeOriginal(el, 'esHtml', el.innerHTML);
      if (isEn && pageDict[key] !== undefined) {
        el.innerHTML = pageDict[key];
      } else {
        el.innerHTML = el.dataset.esHtml;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      storeOriginal(el, 'esPlaceholder', el.getAttribute('placeholder') || '');
      if (isEn && pageDict[key] !== undefined) {
        el.setAttribute('placeholder', pageDict[key]);
      } else {
        el.setAttribute('placeholder', el.dataset.esPlaceholder);
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      storeOriginal(el, 'esAria', el.getAttribute('aria-label') || '');
      if (isEn && pageDict[key] !== undefined) {
        el.setAttribute('aria-label', pageDict[key]);
      } else {
        el.setAttribute('aria-label', el.dataset.esAria);
      }
    });
  }

  function updateToggleButton(lang) {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    const esSpan = btn.querySelector('[data-lang-opt="es"]');
    const enSpan = btn.querySelector('[data-lang-opt="en"]');
    if (esSpan) esSpan.classList.toggle('active', lang === 'es');
    if (enSpan) enSpan.classList.toggle('active', lang === 'en');
    btn.setAttribute('aria-label', lang === 'es' ? 'Switch language to English' : 'Cambiar idioma a Español');
  }

  function setLang(lang, persist = true) {
    const normalized = lang === 'en' ? 'en' : 'es';
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, normalized); } catch (e) {}
    }
    document.documentElement.lang = normalized;
    applySharedTranslations(normalized);
    applyPageTranslations(normalized);
    updateToggleButton(normalized);
    window.__redbotCurrentLang = normalized;
    document.dispatchEvent(new CustomEvent('redbot:langchange', { detail: { lang: normalized } }));
  }

  function injectLangToggle() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks || document.getElementById('lang-toggle')) return;

    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'lang-toggle';
    btn.className = 'lang-toggle';
    btn.innerHTML = '<span data-lang-opt="es">ES</span><span class="lang-sep">/</span><span data-lang-opt="en">EN</span>';
    btn.addEventListener('click', () => {
      const next = window.__redbotCurrentLang === 'en' ? 'es' : 'en';
      setLang(next, true);
    });
    li.appendChild(btn);

    const ctaLink = navLinks.querySelector('.nav-cta');
    const ctaLi = ctaLink ? ctaLink.closest('li') : null;
    if (ctaLi) {
      navLinks.insertBefore(li, ctaLi);
    } else {
      navLinks.appendChild(li);
    }
  }

  function initNavMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
      });

      navLinks.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'A') {
          navLinks.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
          navLinks.classList.remove('is-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  window.RedBotI18n = {
    getLang: () => window.__redbotCurrentLang || 'es',
    setLang: (lang) => setLang(lang, true)
  };

  function boot() {
    injectLangToggle();
    initNavMenu();
    const initial = detectInitialLang();
    setLang(initial, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

// RedBot Global JS, i18n (ES / EN) & Auth Header
(function () {
  const STORAGE_KEY = 'redbot_lang';
  const AUTH_STORAGE_KEY = 'redbot_dash_token';

  const SHARED_I18N = {
    en: {
      skipLink: 'Skip to main content',
      logoAria: 'Go to RedBot home',
      menuToggle: 'Menu',
      nav: {
        '/dashboard': 'Dashboard',
        '/commands': 'Commands',
        '/tos': 'Terms',
        '/privacy': 'Privacy',
        'https://redbot.me/invite': 'Invite'
      },
      auth: {
        login: 'Sign in',
        dashboard: 'Dashboard',
        tickets: 'Tickets Panel',
        logout: 'Log out'
      },
      footerDesc: '© 2026 RedBot.',
      footerTitles: {
        'Proyecto': 'Project',
        'Soporte': 'Support',
        'Legal': 'Legal'
      },
      footerLinks: {
        '/dashboard': 'Dashboard',
        '/commands': 'Commands',
        'https://redbot.me/invite': 'Invite',
        '/staff': 'Team',
        'https://discord.gg/sYdyS8Ez3s': 'Support Server',
        '/privacy': 'Privacy Policy',
        '/tos': 'Terms of Service'
      }
    },
    es: {
      auth: {
        login: 'Iniciar sesión',
        dashboard: 'Dashboard',
        tickets: 'Panel de Tickets',
        logout: 'Cerrar sesión'
      }
    }
  };

  let currentUser = null;
  let navAuthInitialized = false;
  let memoryToken = null;
  let authReqSeq = 0;

  function consumeHashSession() {
    try {
      const hash = window.location.hash || '';
      if (!hash.startsWith('#')) return;
      const hashParams = new URLSearchParams(hash.slice(1));
      const token = hashParams.get('session');
      if (token) {
        memoryToken = token;
        try { localStorage.setItem(AUTH_STORAGE_KEY, token); } catch (e) {}
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (e) {}
  }

  consumeHashSession();

  function getStoredAuthToken() {
    try {
      const fromStorage = localStorage.getItem(AUTH_STORAGE_KEY);
      if (fromStorage) {
        memoryToken = fromStorage;
        return fromStorage;
      }
    } catch (e) {}
    return memoryToken || null;
  }

  function clearStoredAuthToken() {
    currentUser = null;
    memoryToken = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  }

  function decodeTokenPayload(token) {
    if (!token || typeof token !== 'string') return null;
    const dotIdx = token.indexOf('.');
    if (dotIdx <= 0) return null;
    try {
      let b64 = token.slice(0, dotIdx).replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      const payload = JSON.parse(jsonStr);
      if (!payload || !payload.uid || !payload.exp || Number(payload.exp) <= Date.now()) {
        return null;
      }
      return {
        id: String(payload.uid),
        username: String(payload.username || ''),
        globalName: payload.globalName ? String(payload.globalName) : null,
        avatar: payload.avatar ? String(payload.avatar) : null
      };
    } catch (e) {
      return null;
    }
  }

  function getDiscordAvatarUrl(user) {
    if (user && user.avatar && user.id) {
      const ext = String(user.avatar).startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${encodeURIComponent(user.avatar)}.${ext}?size=64`;
    }
    if (user && user.id) {
      try {
        const idx = Number((BigInt(user.id) >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
      } catch (e) {}
    }
    return '/android-chrome-192x192.png';
  }

  function buildAuthLoginHref(returnPath) {
    const returnTo = returnPath
      ? `${window.location.origin}${returnPath}`
      : `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    return `/api/auth/login?return_to=${encodeURIComponent(returnTo)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

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

  window.__redbotCurrentLang = detectInitialLang();

  function storeOriginal(el, attr, value) {
    if (el.dataset[attr] === undefined) {
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

  function closeUserMenu() {
    const menu = document.getElementById('nav-user-menu');
    const btn = document.getElementById('nav-user-btn');
    if (menu) menu.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  async function performLogout() {
    authReqSeq += 1;
    const token = getStoredAuthToken();
    clearStoredAuthToken();
    renderNavAuth();
    document.dispatchEvent(new CustomEvent('redbot:authchange', { detail: { authenticated: false, user: null } }));
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }

  function renderNavAuth() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    let li = document.getElementById('nav-auth-li');
    if (!li) {
      li = document.createElement('li');
      li.id = 'nav-auth-li';
      navLinks.appendChild(li);
    }

    const lang = window.__redbotCurrentLang === 'en' ? 'en' : 'es';
    const labels = SHARED_I18N[lang].auth;
    li.innerHTML = '';

    if (currentUser) {
      const wrap = document.createElement('div');
      wrap.className = 'nav-user-wrap';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'nav-user-btn';
      btn.className = 'nav-user-btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-haspopup', 'menu');

      const img = document.createElement('img');
      img.className = 'nav-user-avatar';
      img.src = getDiscordAvatarUrl(currentUser);
      img.alt = currentUser.globalName || currentUser.username || 'User';
      img.onerror = function () {
        this.onerror = null;
        this.src = '/android-chrome-192x192.png';
      };

      const nameSpan = document.createElement('span');
      nameSpan.className = 'nav-user-name';
      nameSpan.textContent = currentUser.globalName || currentUser.username || 'Discord';

      const caret = document.createElement('span');
      caret.className = 'nav-user-caret';
      caret.setAttribute('aria-hidden', 'true');
      caret.textContent = '▾';

      btn.appendChild(img);
      btn.appendChild(nameSpan);
      btn.appendChild(caret);

      const menu = document.createElement('div');
      menu.id = 'nav-user-menu';
      menu.className = 'nav-user-menu';
      menu.setAttribute('role', 'menu');

      const dashLink = document.createElement('a');
      dashLink.href = '/dashboard';
      dashLink.setAttribute('role', 'menuitem');
      dashLink.textContent = labels.dashboard;

      const ticketsLink = document.createElement('a');
      ticketsLink.href = '/tickets';
      ticketsLink.setAttribute('role', 'menuitem');
      ticketsLink.textContent = labels.tickets;

      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'nav-user-logout';
      logoutBtn.setAttribute('role', 'menuitem');
      logoutBtn.textContent = labels.logout;
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeUserMenu();
        const navLinksEl = document.getElementById('nav-links');
        const menuToggleEl = document.getElementById('menu-toggle');
        if (navLinksEl) navLinksEl.classList.remove('is-open');
        if (menuToggleEl) menuToggleEl.setAttribute('aria-expanded', 'false');
        performLogout();
      });

      menu.appendChild(dashLink);
      menu.appendChild(ticketsLink);
      menu.appendChild(logoutBtn);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = menu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });

      wrap.appendChild(btn);
      wrap.appendChild(menu);
      li.appendChild(wrap);
    } else {
      const loginLink = document.createElement('a');
      loginLink.className = 'nav-login-btn';
      loginLink.href = buildAuthLoginHref();
      loginLink.textContent = labels.login;
      li.appendChild(loginLink);
    }
  }

  async function initNavAuth() {
    if (!navAuthInitialized) {
      navAuthInitialized = true;
      document.addEventListener('click', (e) => {
        const li = document.getElementById('nav-auth-li');
        if (li && !li.contains(e.target)) {
          closeUserMenu();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeUserMenu();
      });
      document.addEventListener('redbot:langchange', () => {
        renderNavAuth();
      });
    }

    const seq = ++authReqSeq;
    const token = getStoredAuthToken();
    const decoded = decodeTokenPayload(token);
    if (!token || !decoded) {
      if (token && !decoded) clearStoredAuthToken();
      currentUser = null;
      renderNavAuth();
      return;
    }

    currentUser = decoded;
    renderNavAuth();

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (seq !== authReqSeq) return;
      if (res.status === 401) {
        clearStoredAuthToken();
        renderNavAuth();
        document.dispatchEvent(new CustomEvent('redbot:authchange', { detail: { authenticated: false, user: null } }));
        return;
      }
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (seq !== authReqSeq) return;
        if (data && data.authenticated && data.user) {
          currentUser = data.user;
          renderNavAuth();
        } else if (data && data.authenticated === false) {
          clearStoredAuthToken();
          renderNavAuth();
          document.dispatchEvent(new CustomEvent('redbot:authchange', { detail: { authenticated: false, user: null } }));
        }
      }
    } catch (e) {}
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
        if (e.target && e.target.closest('a')) {
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

  window.RedBotAuth = {
    getToken: getStoredAuthToken,
    clearToken: clearStoredAuthToken,
    getUser: () => currentUser,
    refreshHeader: initNavAuth,
    logout: performLogout,
    buildLoginHref: buildAuthLoginHref
  };

  function boot() {
    injectLangToggle();
    initNavMenu();
    const initial = detectInitialLang();
    setLang(initial, false);
    initNavAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

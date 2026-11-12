/* ============================================================
   林庆文 — homepage interactions
   Vanilla JS, no dependencies. Reveal + scrollspy are scroll-driven,
   so a missing IntersectionObserver cannot leave the page blank.
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language helpers ---------- */
  var EN = (window.I18N && window.I18N.en) || {};
  var lang = 'zh-CN';

  function pick(zhText, key) {
    return lang === 'en' && EN[key] ? EN[key] : zhText;
  }

  /* ---------- toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function say(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-on');
    }, 1900);
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* ---------- reveal ---------- */
  var revealQueue = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion) {
    revealQueue.forEach(function (el) { el.classList.add('is-in'); });
    revealQueue = [];
  }

  /* ---------- scrollspy ---------- */
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var spySections = spyLinks
    .map(function (link) { return document.getElementById(link.getAttribute('data-spy')); })
    .filter(Boolean);

  var activeId = null;

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    spyLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-spy') === id);
    });
  }

  /* ---------- one scroll pass for everything ---------- */
  var bar = document.getElementById('progressBar');
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight || docEl.clientHeight;

    if (nav) nav.classList.toggle('is-stuck', y > 12);

    if (bar) {
      var max = docEl.scrollHeight - vh;
      var pct = max > 0 ? (y / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    if (revealQueue.length) {
      var still = [];
      for (var i = 0; i < revealQueue.length; i++) {
        var el = revealQueue[i];
        var rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.92 && rect.bottom > 0) {
          el.classList.add('is-in');
        } else {
          still.push(el);
        }
      }
      revealQueue = still;
    }

    var current = null;
    for (var j = 0; j < spySections.length; j++) {
      var top = spySections[j].getBoundingClientRect().top + y;
      if (top - 120 <= y) current = spySections[j].id;
    }
    setActive(current || '');
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();

  /* ---------- paper filters ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var papers = Array.prototype.slice.call(document.querySelectorAll('.paper'));

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-filter');

      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      papers.forEach(function (paper) {
        var match = filter === 'all' || paper.getAttribute('data-thread') === filter;
        paper.classList.toggle('is-hidden', !match);
      });

      if (filter === 'all') say(pick('显示全部论文', 'toast.all'));
      else say((lang === 'en' ? pick('', 'toast.filtered') : '只看：') + chip.textContent.trim());
    });
  });

  /* ---------- bibtex ---------- */
  document.querySelectorAll('[data-bib]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-bib');
      var panel = document.getElementById('bib-' + id);
      if (!panel) return;

      var open = panel.hasAttribute('hidden');
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-copy');
      var code = document.getElementById('code-' + id);
      if (!code) return;

      copyText(code.textContent.trim()).then(function () {
        btn.textContent = pick('已复制', 'bib.copied');
        say(pick('引用已复制', 'toast.copied'));
        setTimeout(function () { btn.textContent = pick('复制', 'bib.copy'); }, 1600);
      }).catch(function () {
        say(pick('复制失败，请手动选择文本', 'toast.failed'));
      });
    });
  });
  /* ---------- language switch ---------- */
  var langBtn = document.getElementById('langToggle');

  function applyLang(next, remember) {
    lang = next === 'en' ? 'en' : 'zh-CN';
    docEl.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (el.dataset.zh === undefined) el.dataset.zh = el.innerHTML;
      el.innerHTML = lang === 'en' && EN[key] ? EN[key] : el.dataset.zh;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (el.dataset.zhAria === undefined) el.dataset.zhAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' && EN[key] ? EN[key] : el.dataset.zhAria);
    });

    document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-content');
      if (el.dataset.zhContent === undefined) el.dataset.zhContent = el.getAttribute('content') || '';
      el.setAttribute('content', lang === 'en' && EN[key] ? EN[key] : el.dataset.zhContent);
    });

    if (langBtn) {
      langBtn.textContent = lang === 'en' ? '中文' : 'EN';
      langBtn.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
    }

    if (remember) {
      try { localStorage.setItem('homepage-lang', lang); } catch (err) {}
    }

    update();
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(lang === 'en' ? 'zh-CN' : 'en', true);
    });
  }

  var storedLang = null;
  try { storedLang = localStorage.getItem('homepage-lang'); } catch (err) {}
  var urlLang = null;
  try { urlLang = new URLSearchParams(window.location.search).get('lang'); } catch (err) {}

  if (urlLang === 'en' || (!urlLang && storedLang === 'en')) applyLang('en', false);
})();

/* ═══════════════════════════════════════════════════════════
   AGDAR — script.js
   - Navbar active-link via Intersection Observer
   - Hamburger menu toggle
   - Reveal-on-scroll for content sections
   - Animated truck (position tied to scroll progress)
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Cached DOM refs ─────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinksEl  = document.getElementById('nav-links');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const reveals     = document.querySelectorAll('.reveal-section');
  const truckWrapper = document.getElementById('truckWrapper');

  /* ─── Truck state ─────────────────────────────────────── */
  let truckX      = 0;   // current rendered position (px)
  let targetX     = 0;   // scroll-driven target position (px)
  let lerpSpeed   = 0.11; // normal follow speed
  let fastUntil   = 0;    // timestamp until which we use fast lerp

  function getTruckTarget() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    const fraction = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const truckW   = truckWrapper.offsetWidth;
    return fraction * (window.innerWidth - truckW);
  }

  function animateTruck() {
    const now   = performance.now();
    const speed = now < fastUntil ? 0.22 : lerpSpeed;

    targetX = getTruckTarget();
    truckX += (targetX - truckX) * speed;

    truckWrapper.style.left = truckX.toFixed(2) + 'px';
    requestAnimationFrame(animateTruck);
  }

  requestAnimationFrame(animateTruck);

  /* ─── Nav: smooth-scroll + fast truck on link click ──── */
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      // Accelerate truck for the duration of the scroll (~700 ms)
      fastUntil = performance.now() + 700;

      target.scrollIntoView({ behavior: 'smooth' });

      // Close mobile menu if open
      if (navLinksEl.classList.contains('open')) {
        navLinksEl.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ─── Hamburger toggle ────────────────────────────────── */
  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      navLinksEl.classList.contains('open') &&
      !navbar.contains(e.target)
    ) {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ─── Active nav link via Intersection Observer ───────── */
  let activeSection = 'start';

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeSection = entry.target.id;
          updateActiveLink(activeSection);
        }
      });
    },
    {
      rootMargin: `-${Math.round(window.innerHeight * 0.4)}px 0px -${Math.round(window.innerHeight * 0.4)}px 0px`,
      threshold: 0,
    }
  );

  sections.forEach(s => sectionObserver.observe(s));

  function updateActiveLink(id) {
    navLinks.forEach(link => {
      const matches = link.getAttribute('data-section') === id;
      link.classList.toggle('active', matches);
    });
  }

  // Set initial active state
  updateActiveLink('start');

  /* ─── Reveal sections on scroll ──────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.08 }
  );

  reveals.forEach(el => revealObserver.observe(el));

  /* ─── Keyboard accessibility: close menu on Escape ────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });

  /* ─── i18n: language switching ───────────────────────── */
  const langSwitcher = document.getElementById('langSwitcher');
  const langOptions  = langSwitcher.querySelectorAll('.lang-option');

  const htmlContainingKeys = [
    'about_title', 'about_motto', 'offer_title', 'history_title',
    'contact_title', 'contact_company',
    'history_1999', 'history_2010', 'history_2013', 'history_2022', 'history_2026'
  ];

  function setLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!t[key]) return;
      if (htmlContainingKeys.indexOf(key) !== -1) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    });

    document.documentElement.lang = lang;
    document.title = t.meta_title;
    var metaDesc = document.getElementById('metaDescription');
    if (metaDesc) metaDesc.setAttribute('content', t.meta_description);

    langOptions.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    localStorage.setItem('agdar-lang', lang);
  }

  langSwitcher.addEventListener('click', function (e) {
    var btn = e.target.closest('.lang-option');
    if (!btn) return;
    setLanguage(btn.getAttribute('data-lang'));
  });

  // Auto-detect language on first visit
  var savedLang = localStorage.getItem('agdar-lang');
  var browserLang = navigator.language.slice(0, 2);
  var initialLang = savedLang || (['de', 'en'].indexOf(browserLang) !== -1 ? browserLang : 'pl');
  if (initialLang !== 'pl') {
    setLanguage(initialLang);
  }

  /* ─── Timeline photo gallery ─────────────────────────── */
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var photos = gallery.querySelectorAll('.tl-photo');
    var dots   = gallery.querySelectorAll('.tl-gallery-dot');
    var idx    = 0;

    function show(i) {
      idx = (i + photos.length) % photos.length;
      photos.forEach(function (p, j) { p.classList.toggle('active', j === idx); });
      dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
    }

    gallery.querySelector('.tl-gallery-nav.prev').addEventListener('click', function () { show(idx - 1); });
    gallery.querySelector('.tl-gallery-nav.next').addEventListener('click', function () { show(idx + 1); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { show(j); }); });

    var startX = 0;
    gallery.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) show(diff > 0 ? idx + 1 : idx - 1);
    });
  });

})();

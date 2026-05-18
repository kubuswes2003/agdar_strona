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

})();

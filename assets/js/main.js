/* ==========================================================================
   Mehedi Hasan — Portfolio
   Modular vanilla JS. No build step required.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Preloader ---------------- */
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('is-hidden'), 300);
    }
  });

  /* ---------------- Theme toggle ---------------- */
  const ThemeModule = (() => {
    const root = document.documentElement;
    const toggleBtn = document.getElementById('themeToggle');
    const STORAGE_KEY = 'mh-portfolio-theme';

    function apply(theme) {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        toggleBtn?.setAttribute('aria-pressed', 'true');
        toggleBtn?.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        root.removeAttribute('data-theme');
        toggleBtn?.setAttribute('aria-pressed', 'false');
        toggleBtn?.setAttribute('aria-label', 'Switch to light mode');
      }
    }

    function init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      apply(saved || (prefersLight ? 'light' : 'dark'));

      toggleBtn?.addEventListener('click', () => {
        const isLight = root.getAttribute('data-theme') === 'light';
        const next = isLight ? 'dark' : 'light';
        apply(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }
    return { init };
  })();

  /* ---------------- Header scroll + active nav ---------------- */
  const HeaderModule = (() => {
    const header = document.getElementById('siteHeader');
    const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      if (window.scrollY > 20) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');

      let currentId = sections[0]?.id;
      const scrollPos = window.scrollY + 140;
      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollPos) currentId = sec.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
      });
    }

    function init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    return { init };
  })();

  /* ---------------- Mobile menu ---------------- */
  const MenuModule = (() => {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    const navLinks = nav ? nav.querySelectorAll('a') : [];

    function close() {
      hamburger?.classList.remove('is-active');
      nav?.classList.remove('is-open');
      hamburger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function toggle() {
      const isOpen = nav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    function init() {
      if (!hamburger || !nav) return;
      hamburger.addEventListener('click', toggle);
      navLinks.forEach((link) => link.addEventListener('click', close));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    }
    return { init };
  })();

  /* ---------------- Cursor glow ---------------- */
  const CursorModule = (() => {
    const glow = document.querySelector('.cursor-glow');
    function init() {
      if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
      window.addEventListener('mousemove', (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      });
    }
    return { init };
  })();

  /* ---------------- Typing animation (hero headline + editor mock) ---------------- */
  const TypingModule = (() => {
    const heroTarget = document.getElementById('heroTyped');
    const editorTarget = document.getElementById('editorTyped');
    const heroWords = ['performs.', 'converts.', 'scales.', 'delights.'];
    const editorLine = 'Adding block: Hero Section…';

    function typeLoop(el, words, { typeSpeed = 90, holdTime = 1400, deleteSpeed = 45 } = {}) {
      if (!el) return;
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function tick() {
        const word = words[wordIndex];
        if (!deleting) {
          charIndex++;
          el.textContent = word.slice(0, charIndex);
          if (charIndex === word.length) {
            deleting = true;
            setTimeout(tick, holdTime);
            return;
          }
        } else {
          charIndex--;
          el.textContent = word.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
        setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
      }
      tick();
    }

    function typeOnce(el, text, speed = 55) {
      if (!el) return;
      let i = 0;
      function tick() {
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) setTimeout(tick, speed);
      }
      tick();
    }

    function init() {
      typeLoop(heroTarget, heroWords);
      typeOnce(editorTarget, editorLine);
    }
    return { init };
  })();

  /* ---------------- Animated stat counters ---------------- */
  const CounterModule = (() => {
    const counters = document.querySelectorAll('[data-count]');

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }

    function init() {
      if (!counters.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => observer.observe(c));
    }
    return { init };
  })();

  /* ---------------- Skill bar fill on scroll ---------------- */
  const SkillBarModule = (() => {
    const bars = document.querySelectorAll('.skill-bar-fill');

    function init() {
      if (!bars.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              el.style.width = `${el.getAttribute('data-width')}%`;
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.4 }
      );
      bars.forEach((b) => observer.observe(b));
    }
    return { init };
  })();

  /* ---------------- Portfolio Swiper ---------------- */
  const SwiperModule = (() => {
    function init() {
      if (typeof Swiper === 'undefined') return;
      // eslint-disable-next-line no-undef
      new Swiper('.portfolioSwiper', {
        slidesPerView: 1.05,
        spaceBetween: 24,
        grabCursor: true,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' },
        keyboard: { enabled: true },
        a11y: { enabled: true },
        breakpoints: {
          640: { slidesPerView: 1.6 },
          900: { slidesPerView: 2.2 },
          1280: { slidesPerView: 3.2 },
          1600: { slidesPerView: 4 },
        },
      });
    }
    return { init };
  })();

  /* ---------------- GSAP hero entrance ---------------- */
  const GsapModule = (() => {
    function init() {
      if (typeof gsap === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.from('.hero-copy > *', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      });

      gsap.from('.editor-window', {
        y: 30,
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
      });

      gsap.utils.toArray('.stat-chip').forEach((chip, i) => {
        gsap.from(chip, { opacity: 0, y: 16, duration: 0.7, delay: 0.9 + i * 0.15, ease: 'power2.out' });
      });
    }
    return { init };
  })();

  /* ---------------- Back to top ---------------- */
  const BackToTopModule = (() => {
    const btn = document.getElementById('backToTop');
    function init() {
      btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    return { init };
  })();

  /* ---------------- Footer year ---------------- */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- AOS init ---------------- */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
    HeaderModule.init();
    MenuModule.init();
    CursorModule.init();
    TypingModule.init();
    CounterModule.init();
    SkillBarModule.init();
    SwiperModule.init();
    GsapModule.init();
    BackToTopModule.init();
    setYear();
    initAOS();
  });
})();

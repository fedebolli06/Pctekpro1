// Theme auto-sync: follow user's system preference
(() => {
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const LIGHT_BG = '#f7eff7';
  const DARK_BG = '#27273e';
  const applyTheme = (isDark) => {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? DARK_BG : LIGHT_BG);
  };
  if (!window.matchMedia) {
    applyTheme(false);
    return;
  }
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (event) => applyTheme(event.matches);
  applyTheme(media.matches);
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handleChange);
  } else if (typeof media.addListener === 'function') {
    media.addListener(handleChange);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Global UI helpers
  // Backdrop overlay for mobile menu + progress bar
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);
  let progressEl = document.getElementById('scrollProgress');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.id = 'scrollProgress';
    document.body.appendChild(progressEl);
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.menu');
  if (navToggle && menu) {
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      overlay.classList.remove('show');
    };
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      menu.classList.toggle('open', !expanded);
      overlay.classList.toggle('show', !expanded);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  }

  // Helper to close menu safely from anywhere
  const closeAnyMenu = () => {
    const navT = document.querySelector('.nav-toggle');
    const menuN = document.querySelector('.menu');
    if (navT && menuN && menuN.classList.contains('open')) {
      navT.setAttribute('aria-expanded', 'false');
      menuN.classList.remove('open');
      overlay.classList.remove('show');
    }
  };
  overlay.addEventListener('click', closeAnyMenu);

  // Click sul logo: porta sempre in cima alla pagina
  document.querySelectorAll('.brand').forEach(brand => {
    const href = brand.getAttribute('href') || '';
    if (href.startsWith('#') || href === '') {
      brand.addEventListener('click', (e) => {
        e.preventDefault();
        closeAnyMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, '', '#top');
      });
    }
  });

  // Dropdown (Servizi) behavior
  const dropdowns = Array.from(document.querySelectorAll('.dropdown'));
  const closeAllDropdowns = (except = null) => {
    dropdowns.forEach(dd => {
      if (dd !== except) {
        dd.classList.remove('is-open');
        const t = dd.querySelector('.dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  };
  dropdowns.forEach(dd => {
    const toggle = dd.querySelector('.dropdown-toggle');
    const menuBox = dd.querySelector('.dropdown-menu');
    if (!toggle || !menuBox) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !dd.classList.contains('is-open');
      closeAllDropdowns(dd);
      dd.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    // Open on hover (desktop)
    let hoverTimer = null;
    dd.addEventListener('mouseenter', () => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      closeAllDropdowns(dd);
      dd.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    });
    dd.addEventListener('mouseleave', () => {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      hoverTimer = setTimeout(() => {
        dd.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }, 120);
    });
    // Close when selecting an item
    menuBox.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      closeAllDropdowns();
      closeAnyMenu();
    }));
  });
  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!dropdowns.length) return;
    if (!dropdowns.some(dd => dd.contains(e.target))) closeAllDropdowns();
  });

  // Smooth scroll for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }
    });
  });

  // Reveal on scroll: add variety and stagger
  const initReveal = () => {
    const prefersReducedReveal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Auto-mark common elements if not explicitly marked
    const autoSelectors = [
      '.section-header',
      '.grid.cards > *',
      '.card',
      '.two-col > *',
      '.biz-card',
      '.price-list .price-item',
      '.footer-inner > *'
    ];
    const autoTargets = document.querySelectorAll(autoSelectors.join(', '));
    autoTargets.forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.hasAttribute('data-reveal')) {
        el.classList.add('reveal');
        // Section titles use a refined rotate reveal; others alternate
        if (el.classList.contains('section-header')) {
          el.classList.add('reveal-rotate');
        } else {
          const mod = i % 4;
          if (mod === 0) el.classList.add('reveal-up');
          else if (mod === 1) el.classList.add('reveal-left');
          else if (mod === 2) el.classList.add('reveal-right');
          else el.classList.add('reveal-zoom');
        }
      }
    });

    // Stagger children inside common containers
    const staggerContainers = document.querySelectorAll('.grid.cards, .two-col, .biz-card, .menu');
    staggerContainers.forEach(container => {
      container.classList.add('stagger');
      [...container.children].forEach((child, idx) => child.style.setProperty('--delay', `${idx * 80}ms`));
    });

    const revealables = document.querySelectorAll('.reveal, [data-reveal]');
    if (prefersReducedReveal) {
      revealables.forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    revealables.forEach(el => obs.observe(el));
  };
  initReveal();

  // Gallery vertical parallax (disabled: reliability issues on some hosts)
  const initGalleryParallax = () => {
    const imgs = Array.from(document.querySelectorAll('.grid.gallery img, .gallery-grid img'));
    if (!imgs.length) return;
    // Do nothing: keep gallery static for consistent rendering across hosts.
  };
  initGalleryParallax();

  // Gallery lightbox (prevent navigation, show overlay)
  const initGalleryLightbox = () => {
    const grid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('gallery-lightbox');
    if (!grid || !lightbox) return;
    const imgEl = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const open = (src, alt = '') => {
      if (!imgEl || !src) return;
      imgEl.src = src;
      imgEl.alt = alt;
      lightbox.classList.add('show');
      document.body.classList.add('lightbox-open');
      if (closeBtn) closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove('show');
      document.body.classList.remove('lightbox-open');
      if (imgEl) imgEl.src = '';
    };

    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const link = item.getAttribute('href') || '';
        const thumb = item.querySelector('img');
        const src = item.getAttribute('data-full') || link || (thumb ? thumb.src : '');
        const alt = thumb ? thumb.alt : '';
        open(src, alt);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('show')) close(); });
  };
  initGalleryLightbox();

  // Reviews widget: ready for backend/Google feed with safe fallback
  const initReviewsWidget = () => {
    const list = document.getElementById('reviews-list') || document.querySelector('[data-reviews-endpoint]');
    if (!list) return;

    const statusEl = document.querySelector('[data-reviews-status]');
    const scoreEl = document.querySelector('[data-reviews-score]');
    const countEl = document.querySelector('[data-reviews-count]');
    const refreshBtn = document.querySelector('[data-reviews-refresh]');
    const endpoint = list.getAttribute('data-reviews-endpoint') || '/api/reviews/google';
    const googleUrl = list.getAttribute('data-reviews-google-url') || 'https://maps.app.goo.gl/Dh97kVH5FcqD4vpLA';

    const escapeHtml = (str = '') => str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const buildStars = (rating = 5) => {
      const full = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
      const solid = Array(full).fill('&#9733;').join('');
      const empty = Array(5 - full).fill('&#9734;').join('');
      return solid + empty;
    };

    const fallbackReviews = [
      { author: 'Giulia R.', rating: 5, text: 'Servizio impeccabile e colore luminosissimo. Consigliatissimo!', relativeTime: '2 settimane fa' },
      { author: 'Luca M.', rating: 5, text: 'Taglio uomo preciso e moderno, ambiente super accogliente.', relativeTime: '1 mese fa' },
      { author: 'Sara V.', rating: 5, text: 'Prodotti ottimi e consulenza personalizzata. Capelli rinati.', relativeTime: '3 settimane fa' }
    ];

    const setStatus = (text) => { if (statusEl) statusEl.textContent = text || ''; };

    const updateMeta = (rating, total) => {
      const num = Number(rating);
      if (scoreEl) scoreEl.textContent = Number.isFinite(num) ? num.toFixed(1) : '--';
      if (countEl) {
        if (Number.isFinite(total)) {
          const n = Math.max(0, Math.round(total));
          countEl.textContent = n === 1 ? 'Basata su 1 recensione' : `Basata su ${n} recensioni`;
        } else {
          countEl.textContent = 'In attesa di collegamento live';
        }
      }
    };

    const renderSkeleton = (count = 3) => {
      list.innerHTML = '';
      for (let i = 0; i < count; i += 1) {
        const card = document.createElement('article');
        card.className = 'card review skeleton';
        card.innerHTML = `
          <p class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
          <div class="placeholder w-90"></div>
          <div class="placeholder w-70"></div>
          <div class="placeholder w-40"></div>
        `;
        list.appendChild(card);
      }
    };

    const renderReviews = (items = []) => {
      list.innerHTML = '';
      if (!items.length) {
        const empty = document.createElement('article');
        empty.className = 'card review empty';
        empty.innerHTML = `
          <p class="muted">Ancora nessuna recensione disponibile.</p>
          <a class="inline-link" href="${googleUrl}" target="_blank" rel="noopener">Apri su Google</a>
        `;
        list.appendChild(empty);
        return;
      }
      items.forEach((r) => {
        const card = document.createElement('article');
        card.className = 'card review';
        const txt = r.text || r.review_text || r.snippet || '';
        const author = r.author || r.author_name || r.profile_name || 'Cliente';
        const when = r.relativeTime || r.relative_time_description || r.time || '';
        card.innerHTML = `
          <p class="stars" aria-label="${(r.rating || 5)} su 5">${buildStars(r.rating || 5)}</p>
          <p>${escapeHtml(txt)}</p>
          <p class="muted">- ${escapeHtml(author)}${when ? ' - ' + escapeHtml(when) : ''}</p>
        `;
        list.appendChild(card);
      });
    };

    const useFallback = () => {
      updateMeta(5, fallbackReviews.length);
      renderReviews(fallbackReviews);
      setStatus('Mostriamo recensioni campione finche il feed Google non e attivo.');
    };

    const fetchReviews = async () => {
      if (window.location.protocol === 'file:') {
        useFallback();
        return;
      }
      renderSkeleton();
      setStatus('Collego le recensioni reali...');
      try {
        const res = await fetch(endpoint, { headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reviews = Array.isArray(data.reviews)
          ? data.reviews
          : (Array.isArray(data) ? data : (data.result && Array.isArray(data.result.reviews) ? data.result.reviews : []));
        if (!reviews.length) throw new Error('Nessuna recensione trovata');
        const rating = data.rating || data.score || (data.result && data.result.rating);
        const total = data.total_reviews || data.user_ratings_total || (data.result && data.result.user_ratings_total) || reviews.length;
        const normalized = reviews.map((r) => ({
          rating: r.rating || r.stars || r.score || 5,
          text: r.text || r.review_text || r.snippet || '',
          author: r.author || r.author_name || r.profile_name || 'Cliente',
          relativeTime: r.relative_time_description || r.relativeTime || r.time || ''
        }));
        updateMeta(rating || 5, total || normalized.length);
        renderReviews(normalized);
        setStatus('Recensioni aggiornate dal feed live.');
      } catch (err) {
        console.error('Impossibile recuperare le recensioni', err);
        useFallback();
      }
    };

    if (refreshBtn) refreshBtn.addEventListener('click', () => fetchReviews());

    fetchReviews();
  };
  initReviewsWidget();

  // Booking form: simple client-side feedback
  const form = document.getElementById('booking-form');
  if (form) {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true; btn.textContent = 'Invio...';
      }

      setTimeout(() => {
        if (status) {
          status.textContent = 'Richiesta inviata! Ti contatteremo a breve.';
        }
        if (btn) { btn.disabled = false; btn.textContent = 'Invia richiesta'; }
        form.reset();
        setTimeout(() => { if (status) status.textContent = ''; }, 4000);
      }, 800);
    });
  }

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    // Back-to-top visibility
    if (backToTop) {
      if (window.scrollY > 400) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    }
    // Scroll progress bar
    const h = document.documentElement;
    const progress = (h.scrollHeight - h.clientHeight) > 0 ? (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100 : 0;
    if (progressEl) progressEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  // If user starts scrolling, ensure any mobile menu overlay doesn't lock the page
  window.addEventListener('scroll', () => closeAnyMenu(), { passive: true });
  onScroll();
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Hero parallax (subtle)
  const heroBg = document.querySelector('.hero-bg');
  let rafParallax = null;
  const updateParallax = () => {
    rafParallax = null;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!heroBg || prefersReduced) return;
    const y = Math.max(0, Math.min(40, window.scrollY * 0.12));
    heroBg.style.setProperty('--hero-parallax', y + 'px');
  };
  window.addEventListener('scroll', () => { if (!rafParallax) rafParallax = requestAnimationFrame(updateParallax); }, { passive: true });
  updateParallax();

  // Navbar dynamics: transparent at top; solid when scrolled; back to transparent when returning to top
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (header) {
    const updateHeader = () => {
      const atTop = window.scrollY <= 0;
      // Transparent overlay style when truly at top. Use on-hero only if a hero exists.
      header.classList.toggle('on-hero', atTop && !!hero);
      header.classList.toggle('is-top', atTop);
      header.classList.toggle('compact', window.scrollY > 10);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', () => { updateHeader(); if (window.innerWidth > 880) closeAnyMenu(); });
    updateHeader();
  }

  // Brands marquee: duplicate content for seamless loop
  const brandsRow = document.querySelector('.brands-row');
  if (brandsRow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const items = Array.from(brandsRow.children);
    if (items.length > 3) {
      const track = document.createElement('div');
      track.className = 'brands-track';
      items.forEach(el => track.appendChild(el));
      // clone once for seamless scroll
      items.forEach(el => track.appendChild(el.cloneNode(true)));
      brandsRow.appendChild(track);
      brandsRow.classList.add('auto-marquee');
    }
  }

  // Card tilt effect (performance-friendly)
  const enableTilt = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = Array.from(document.querySelectorAll('.grid.cards .card'));
    cards.forEach(card => {
      let rafId = null;
      let rect = null;
      const maxDeg = 6;
      const onMove = (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rx = Math.max(-1, Math.min(1, dy)) * maxDeg; // rotateX by Y movement
        const ry = Math.max(-1, Math.min(1, dx)) * -maxDeg; // rotateY by X movement
        if (!rafId) rafId = requestAnimationFrame(() => {
          rafId = null;
          card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
        });
      };
      const onEnter = () => { rect = card.getBoundingClientRect(); card.classList.add('is-tilting'); };
      const onLeave = () => { card.classList.remove('is-tilting'); card.style.transform = ''; rect = null; };
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('touchstart', () => {}, { passive: true });
    });
  };
  enableTilt();

  // Allow closing menu with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAllDropdowns(); closeAnyMenu(); }
  });

  // Scroll spy for header links (only on index with in-page anchors)
  const spyLinks = Array.from(document.querySelectorAll('.menu a[href^="#"]')).filter(a => !a.classList.contains('btn-cta'));
  if (spyLinks.length) {
    const sectionMap = new Map();
    spyLinks.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) sectionMap.set(el, a);
    });
    if (sectionMap.size) {
      const clear = () => spyLinks.forEach(l => l.classList.remove('active'));
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const link = sectionMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) { clear(); link.classList.add('active'); }
        });
      }, { rootMargin: '-30% 0px -60% 0px', threshold: 0.1 });
      sectionMap.forEach((_, sec) => obs.observe(sec));
      window.addEventListener('hashchange', () => {
        clear();
        const hash = location.hash.replace('#', '');
        const link = spyLinks.find(l => l.getAttribute('href').slice(1) === hash);
        if (link) link.classList.add('active');
      });
    }
  }

  // Hero slider (timed fade)
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    const slides = Array.from(heroSlider.querySelectorAll('.slide'));
    if (slides.length > 1) {
      let idx = slides.findIndex(s => s.classList.contains('is-active'));
      if (idx < 0) idx = 0, slides[0].classList.add('is-active');
      const intervalMs = parseInt(heroSlider.getAttribute('data-interval') || '5000', 10);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let timerId = null;
      let watchdogId = null;
      let lastAdvance = Date.now();
      let isHovered = false;
      let isTouching = false;

      const show = (i) => {
        slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      };
      const next = () => {
        idx = (idx + 1) % slides.length;
        show(idx);
        lastAdvance = Date.now();
      };

      const start = () => {
        if (prefersReduced) return; // respect reduced motion
        if (timerId) clearInterval(timerId);
        timerId = setInterval(next, intervalMs);
      };
      const stop = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

      const startWatchdog = () => {
        const CHECK_EVERY = 2000;
        const STALL_THRESHOLD = Math.max(intervalMs + 1500, 4000);
        if (watchdogId) clearInterval(watchdogId);
        watchdogId = setInterval(() => {
          if (prefersReduced) return;
          if (document.hidden || isHovered || isTouching) return;
          const now = Date.now();
          const stale = (now - lastAdvance) > STALL_THRESHOLD;
          if (!timerId || stale) {
            start();
            if (stale && (now - lastAdvance) > STALL_THRESHOLD * 1.5) {
              // If it's been stale for quite a while, advance once immediately
              next();
            }
          }
        }, CHECK_EVERY);
      };

      // Pause when tab hidden; resume when visible
      document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
      // Hover pause: enable after a short delay to avoid pausing immediately on page load
      let hoverPauseEnabled = false;
      setTimeout(() => { hoverPauseEnabled = true; }, 800);
      heroSlider.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'touch' && hoverPauseEnabled) {
          isHovered = true; stop();
        }
      });
      heroSlider.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'touch') {
          isHovered = false; start();
        }
      });
      heroSlider.addEventListener('touchstart', () => { isTouching = true; stop(); }, { passive: true });
      heroSlider.addEventListener('touchend', () => { isTouching = false; start(); }, { passive: true });
      heroSlider.addEventListener('touchcancel', () => { isTouching = false; start(); }, { passive: true });
      window.addEventListener('blur', stop);
      window.addEventListener('focus', start);

      start();
      startWatchdog();
    }
  }

  // Service carousels (auto + arrows)
  const carousels = Array.from(document.querySelectorAll('.service-carousel'));
  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.service-track');
    const slides = track ? Array.from(track.children) : [];
    if (!track || slides.length <= 1) return;

    let idx = 0;
    let timer = null;
    const intervalMs = parseInt(carousel.getAttribute('data-interval') || '3500', 10);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const goTo = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
    };
    const next = () => goTo(idx + 1);
    const prev = () => goTo(idx - 1);

    const start = () => {
      if (prefersReduced) return;
      stop();
      timer = setInterval(next, intervalMs);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

    carousel.querySelectorAll('.carousel-arrow').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.classList.contains('next') ? next() : prev();
        start();
      });
    });

    carousel.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'touch') stop();
    });
    carousel.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch') start();
    });
    carousel.addEventListener('touchstart', () => stop(), { passive: true });
    carousel.addEventListener('touchend', () => start(), { passive: true });
    carousel.addEventListener('touchcancel', () => start(), { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    window.addEventListener('blur', stop);
    window.addEventListener('focus', start);

    goTo(0);
    start();
  });
});

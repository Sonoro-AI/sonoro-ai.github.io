/* ============================================================ */
/*  SONORO — page.js                                             */
/*  Shared interactivity for all pages (cursor, reveal, nav)    */
/* ============================================================ */
(function () {

  // ────────────────────────────────────────────────────────────
  //  CUSTOM CURSOR
  // ────────────────────────────────────────────────────────────
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (cursor && cursorDot) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cxp = mx, cyp = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top  = my + 'px';
    });
    function followCursor() {
      cxp += (mx - cxp) * 0.14;
      cyp += (my - cyp) * 0.14;
      cursor.style.left = cxp + 'px';
      cursor.style.top  = cyp + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });
  }

  // ────────────────────────────────────────────────────────────
  //  HOVER BINDINGS — for interactive elements
  // ────────────────────────────────────────────────────────────
  function bindHovers() {
    document.querySelectorAll(
      'button, a, .chatbar, .am-pill, .menu-row .action, .arch-node, .rev, .engine, .loop-step'
    ).forEach(el => {
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = '1';
      if (cursor) {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
      }
    });
  }
  bindHovers();

  // ────────────────────────────────────────────────────────────
  //  REVEAL ON SCROLL
  // ────────────────────────────────────────────────────────────
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => revealIO.observe(el));

  // ────────────────────────────────────────────────────────────
  //  FORMULA BAR ANIMATION — Happiness Algorithm page
  // ────────────────────────────────────────────────────────────
  const formula = document.querySelector('.algo-formula');
  if (formula) {
    const fIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.bar').forEach((bar, i) => {
            const w = bar.style.getPropertyValue('--w');
            bar.style.setProperty('--w', '0%');
            setTimeout(() => {
              bar.style.transition = 'all 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
              bar.style.setProperty('--w', w);
            }, 100 + i * 80);
          });
          fIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    fIO.observe(formula);
  }

  // ────────────────────────────────────────────────────────────
  //  ACTIVE NAV LINK — highlight current page
  // ────────────────────────────────────────────────────────────
  const rawPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('nav.top .menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (href === rawPath) a.classList.add('active');
  });

})();

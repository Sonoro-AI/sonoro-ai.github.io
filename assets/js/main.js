/* ============================================================ */
/*  SONORO — main.js                                             */
/*  Teaser-specific interactivity (homepage only)               */
/* ============================================================ */
(function () {

  // ────────────────────────────────────────────────────────────
  //  WORDMARK — character cascade
  // ────────────────────────────────────────────────────────────
  const word = 'Sonoro';
  const wm = document.getElementById('wordmark');
  word.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch;
    span.style.animationDelay = (0.0 + i * 0.10) + 's';
    wm.appendChild(span);
  });

  // Optical alignment — measure rendered SONORO and shift to true viewport centre
  function alignWordmarkToCentre() {
    const chars = wm.querySelectorAll('.ch');
    if (chars.length === 0) return;
    const first = chars[0].getBoundingClientRect();
    const last  = chars[chars.length - 1].getBoundingClientRect();
    if (first.width === 0 || last.width === 0) return;
    const wordCentre     = (first.left + last.right) / 2;
    const viewportCentre = window.innerWidth / 2;
    const shift = viewportCentre - wordCentre;
    document.documentElement.style.setProperty('--word-x-offset', shift.toFixed(2) + 'px');
  }
  requestAnimationFrame(alignWordmarkToCentre);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignWordmarkToCentre);
  window.addEventListener('resize', alignWordmarkToCentre);

  // ────────────────────────────────────────────────────────────
  //  RESONANCE RINGS CANVAS — with audio-reactive breath
  // ────────────────────────────────────────────────────────────
  const canvas = document.getElementById('ringCanvas');
  const ctx    = canvas.getContext('2d');
  const dpr    = Math.min(window.devicePixelRatio || 1, 2);
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  const rings = [
    { r: 0.040, fill: true,  op: 0.95, w: 0   },
    { r: 0.085, fill: false, op: 0.55, w: 0.7, rot:  0.00018, dash: null },
    { r: 0.140, fill: false, op: 0.35, w: 0.6, rot: -0.00012, dash: [2, 8] },
    { r: 0.205, fill: false, op: 0.30, w: 0.6, rot:  0.00015, dash: null },
    { r: 0.275, fill: false, op: 0.22, w: 0.5, rot: -0.00010, dash: [1, 12] },
    { r: 0.350, fill: false, op: 0.18, w: 0.5, rot:  0.00009, dash: null },
    { r: 0.430, fill: false, op: 0.13, w: 0.5, rot: -0.00007, dash: [1, 16] },
    { r: 0.515, fill: false, op: 0.09, w: 0.4, rot:  0.00005, dash: null },
    { r: 0.605, fill: false, op: 0.06, w: 0.4, rot: -0.00004, dash: [1, 20] },
  ];
  let audioLevel = 0, targetAudioLevel = 0;
  let teaserVisible = true;

  function draw(t) {
    if (!teaserVisible) { requestAnimationFrame(draw); return; }
    const w = canvas.width / dpr, h = canvas.height / dpr;
    const cx = w / 2, cy = h / 2;
    const baseR = Math.min(w, h) * 0.5;
    ctx.clearRect(0, 0, w, h);
    audioLevel += (targetAudioLevel - audioLevel) * 0.12;
    const breath = 1 + Math.sin(t * 0.0006) * 0.018 + audioLevel * 0.10;
    const glowR = baseR * 0.18 * breath;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 4);
    grad.addColorStop(0,    `rgba(212, 178, 118, ${0.28 + audioLevel * 0.20})`);
    grad.addColorStop(0.35, `rgba(201, 162, 95, ${0.10 + audioLevel * 0.06})`);
    grad.addColorStop(1,    'rgba(201, 162, 95, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    rings.forEach(ring => {
      const r = baseR * ring.r * breath;
      const rotation = (ring.rot || 0) * t;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      if (ring.fill) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 240, 235, ${ring.op})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 250, 240, 0.95)';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(242, 240, 235, ${ring.op + audioLevel * 0.15})`;
        ctx.lineWidth = ring.w;
        ctx.setLineDash(ring.dash || []);
        ctx.stroke();
      }
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  requestAnimationFrame(draw);

  // ────────────────────────────────────────────────────────────
  //  STARFIELD — scoped to teaser
  // ────────────────────────────────────────────────────────────
  const stars = document.getElementById('starsCanvas');
  const sctx  = stars.getContext('2d');
  let starList = [];
  function sizeStars() {
    const rect = stars.getBoundingClientRect();
    stars.width  = rect.width  * dpr;
    stars.height = rect.height * dpr;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.scale(dpr, dpr);
    starList = [];
    const count = Math.floor(rect.width * rect.height / 7500);
    for (let i = 0; i < count; i++) {
      starList.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 0.7 + 0.1,
        op: Math.random() * 0.32 + 0.05,
        tw: Math.random() * 0.0035 + 0.0015,
        ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.18,
      });
    }
  }
  function drawStars(t) {
    if (!teaserVisible) { requestAnimationFrame(drawStars); return; }
    const rect = stars.getBoundingClientRect();
    sctx.clearRect(0, 0, rect.width, rect.height);
    starList.forEach(s => {
      const op = s.op * (0.45 + 0.55 * Math.sin(t * s.tw + s.ph));
      sctx.fillStyle = s.warm
        ? `rgba(212, 178, 118, ${op * 0.9})`
        : `rgba(242, 240, 235, ${op})`;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  sizeStars();
  window.addEventListener('resize', sizeStars);
  requestAnimationFrame(drawStars);

  // Pause heavy teaser rendering when teaser is offscreen
  const teaserSection = document.getElementById('teaser');
  if (teaserSection && 'IntersectionObserver' in window) {
    const tIO = new IntersectionObserver((entries) => {
      entries.forEach(e => { teaserVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    tIO.observe(teaserSection);
  }

  // ────────────────────────────────────────────────────────────
  //  ENTRY GATE
  // ────────────────────────────────────────────────────────────
  const entry = document.getElementById('entry');
  if (!entry) return;

  setTimeout(() => entry.classList.add('show'), 4500);

  function enterExperience() {
    entry.classList.add('dismiss');
    entry.classList.remove('show');
    document.body.classList.add('entered');
    setTimeout(() => {
      document.body.classList.remove('state-initial');
    }, 800);
    setTimeout(() => entry.remove(), 1800);
  }

  entry.addEventListener('click', e => { e.stopPropagation(); enterExperience(); });

  // ────────────────────────────────────────────────────────────
  //  KEYBOARD — Enter/Space triggers entry
  // ────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('state-initial') &&
        entry.classList.contains('show') &&
        (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      enterExperience();
    }
  });

})();

// ─────────────────────────────────────────────
  //  WORDMARK — characters for cascade
  // ─────────────────────────────────────────────
  const word = 'Sonoro';
  const wm = document.getElementById('wordmark');
  word.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch;
    span.style.animationDelay = (0.0 + i * 0.10) + 's';
    wm.appendChild(span);
  });

  // Optical alignment — measure the rendered visible centre of SONORO
  // and shift the wordmark itself so its visual centre sits exactly
  // at viewport centre. Rings stay anchored at viewport centre, so
  // both align with the Enter button and Listen pill.
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
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignWordmarkToCentre);
  }
  window.addEventListener('resize', alignWordmarkToCentre);

  // ─────────────────────────────────────────────
  //  RESONANCE RINGS CANVAS
  // ─────────────────────────────────────────────
  const canvas = document.getElementById('ringCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
  function draw(t) {
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

  // ─────────────────────────────────────────────
  //  STARFIELD
  // ─────────────────────────────────────────────
  const stars = document.getElementById('starsCanvas');
  const sctx = stars.getContext('2d');
  let starList = [];
  function sizeStars() {
    stars.width  = window.innerWidth  * dpr;
    stars.height = window.innerHeight * dpr;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.scale(dpr, dpr);
    starList = [];
    const count = Math.floor(window.innerWidth * window.innerHeight / 7500);
    for (let i = 0; i < count; i++) {
      starList.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 0.7 + 0.1,
        op: Math.random() * 0.32 + 0.05,
        tw: Math.random() * 0.0035 + 0.0015,
        ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.18,
      });
    }
  }
  function drawStars(t) {
    sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
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

  // ─────────────────────────────────────────────
  //  CURSOR
  // ─────────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
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
    cursor.style.opacity = '0'; cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1'; cursorDot.style.opacity = '1';
  });
  function bindHovers() {
    document.querySelectorAll('button, a, .chatbar').forEach(el => {
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = '1';
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ─────────────────────────────────────────────
  //  CYCLE WORD MACHINERY
  // ─────────────────────────────────────────────
  function measureWidest(words, fontSize) {
    const ruler = document.createElement('span');
    ruler.style.cssText = [
      'position:absolute', 'visibility:hidden',
      'font-family:"Cormorant Garamond",serif',
      'font-style:italic', 'font-weight:300',
      `font-size:${fontSize}`,
      'white-space:nowrap', 'letter-spacing:0.04em',
    ].join(';');
    document.body.appendChild(ruler);
    let max = 0;
    words.forEach(w => { ruler.textContent = w; max = Math.max(max, ruler.offsetWidth); });
    document.body.removeChild(ruler);
    return max;
  }

  function measureEach(words, fontSize) {
    const ruler = document.createElement('span');
    ruler.style.cssText = [
      'position:absolute', 'visibility:hidden',
      'font-family:"Cormorant Garamond",serif',
      'font-style:italic', 'font-weight:300',
      `font-size:${fontSize}`,
      'white-space:nowrap', 'letter-spacing:0.04em',
    ].join(';');
    document.body.appendChild(ruler);
    const widths = words.map(w => { ruler.textContent = w; return ruler.offsetWidth; });
    document.body.removeChild(ruler);
    return widths;
  }

  // Strapline: Resonate [cycling collection] — eight modules
  const words = ['Healthcare', 'Education', 'Mentors', 'Artificial Intelligence', 'Publishing', 'Learning', 'Innovation', 'Recruitment'];
  const cWrap = document.getElementById('cycleWrap');
  let wordWidths = measureEach(words, 'clamp(20px,2.6vw,34px)');
  function setCycleWidth() {
    wordWidths = measureEach(words, 'clamp(20px,2.6vw,34px)');
    cWrap.style.width = (wordWidths[0] + 4) + 'px';
  }
  setCycleWidth();
  window.addEventListener('resize', setCycleWidth);
  const wEls = words.map((w, i) => {
    const el = document.createElement('span');
    el.className = 'cycle-word';
    el.textContent = w;
    el.dataset.num = `№ ${String(i + 1).padStart(2, '0')}`;
    cWrap.appendChild(el);
    return el;
  });
  let wIdx = 0;
  const showW = i => {
    cWrap.style.width = (wordWidths[i] + 4) + 'px';
    wEls[i].classList.remove('exit');
    wEls[i].classList.add('enter');
  };
  const hideW = i => { wEls[i].classList.remove('enter'); wEls[i].classList.add('exit'); };

  const CYCLE_INTERVAL = 2500;  // 2.5s per word — eight modules

  function runCycleOnce() {
    wEls.forEach(el => el.classList.remove('enter', 'exit'));
    wIdx = 0;
    showW(0);
    const interval = setInterval(() => {
      const next = (wIdx + 1) % words.length;
      hideW(wIdx);
      setTimeout(() => showW(next), 250);
      wIdx = next;
    }, CYCLE_INTERVAL);
    setTimeout(() => clearInterval(interval), CYCLE_INTERVAL * (words.length - 1) + 100);
  }

  // Chatbar: Ask Sonoro / Marco Pierre White / Lino Carbosiero / Alayne Hilton-Gold
  const askWords = ['Sonoro', 'Marco Pierre White', 'Lino Carbosiero', 'Alayne Hilton-Gold'];
  const askWrap = document.getElementById('askCycleWrap');
  function setAskWidth() {
    askWrap.style.width = (measureWidest(askWords, 'clamp(18px,2.2vw,26px)') + 4) + 'px';
  }
  setAskWidth();
  window.addEventListener('resize', setAskWidth);
  const askEls = askWords.map(w => {
    const el = document.createElement('span');
    el.className = 'ask-cycle-word';
    el.textContent = w;
    askWrap.appendChild(el);
    return el;
  });
  let askIdx = 0;
  const showA = i => { askEls[i].classList.remove('exit'); askEls[i].classList.add('enter'); };
  const hideA = i => { askEls[i].classList.remove('enter'); askEls[i].classList.add('exit'); };

  function runAskCycleOnce() {
    askEls.forEach(el => el.classList.remove('enter', 'exit'));
    askIdx = 0;
    showA(0);
    const interval = setInterval(() => {
      const next = (askIdx + 1) % askWords.length;
      hideA(askIdx);
      setTimeout(() => showA(next), 250);
      askIdx = next;
    }, ASK_CYCLE_INTERVAL);
    setTimeout(() => clearInterval(interval), ASK_CYCLE_INTERVAL * (askWords.length - 1) + 100);
  }
  const ASK_CYCLE_INTERVAL = 3000;  // 3s per name — slower for longer chef names

  // ─────────────────────────────────────────────
  //  AMBIENT AUDIO
  // ─────────────────────────────────────────────
  const listenBtn = document.getElementById('listen');
  let audioCtx = null, audioOn = false, masterGain = null, analyser = null, audioData = null;
  function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // iOS requires an explicit resume() inside the user-gesture call stack
    // before any nodes are started, otherwise oscillators stay silent.
    audioCtx.resume();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;

    // ── Convolution reverb with a procedurally-generated cathedral impulse ──
    function makeReverbImpulse(ctx, duration, decay) {
      const sampleRate = ctx.sampleRate;
      const length = Math.floor(sampleRate * duration);
      const impulse = ctx.createBuffer(2, length, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        // Tiny pre-delay (early reflections silence) for a sense of room size
        const preDelay = Math.floor(sampleRate * 0.025);
        for (let i = 0; i < length; i++) {
          if (i < preDelay) { data[i] = 0; continue; }
          const t = (i - preDelay) / (length - preDelay);
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
        }
      }
      return impulse;
    }
    const reverb = audioCtx.createConvolver();
    reverb.buffer = makeReverbImpulse(audioCtx, 6.5, 3.2);

    // Wet / dry mix bus
    const wetGain = audioCtx.createGain();   wetGain.gain.value = 0.38;
    const dryGain = audioCtx.createGain();   dryGain.gain.value = 0.62;
    const mixBus  = audioCtx.createGain();   mixBus.gain.value  = 0.55;
    reverb.connect(wetGain); wetGain.connect(mixBus);
    dryGain.connect(mixBus);
    mixBus.connect(masterGain);

    // Analyser for the rings' breath
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    audioData = new Uint8Array(analyser.frequencyBinCount);
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // ── Drone voices: each fundamental builds an additive harmonic stack,
    //    each harmonic is a 3-oscillator chorus detuned by a few cents ──
    const voices = [
      { f0: 55,   harms: [{n:1, g:0.20, type:'sine'},     {n:2, g:0.12, type:'sine'},     {n:3, g:0.06, type:'triangle'}], detune: 4, lfoFreq: 0.05, lfoDepth: 0.05 },
      { f0: 82.4, harms: [{n:1, g:0.14, type:'sine'},     {n:2, g:0.09, type:'triangle'}, {n:3, g:0.04, type:'sine'}],     detune: 3, lfoFreq: 0.07, lfoDepth: 0.04 },
      { f0: 220,  harms: [{n:1, g:0.07, type:'triangle'}, {n:2, g:0.04, type:'sine'}],                                     detune: 6, lfoFreq: 0.09, lfoDepth: 0.03 },
    ];
    voices.forEach(v => {
      const voiceGain = audioCtx.createGain(); voiceGain.gain.value = 1;
      voiceGain.connect(dryGain); voiceGain.connect(reverb);

      const lfo     = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = v.lfoFreq;
      lfoGain.gain.value  = v.lfoDepth;
      lfo.connect(lfoGain); lfoGain.connect(voiceGain.gain);
      lfo.start();

      v.harms.forEach(h => {
        const harmGain = audioCtx.createGain();
        harmGain.gain.value = h.g;
        harmGain.connect(voiceGain);
        [-v.detune, 0, v.detune].forEach(cents => {
          const osc = audioCtx.createOscillator();
          osc.type = h.type;
          osc.frequency.value = v.f0 * h.n;
          osc.detune.value = cents;
          osc.connect(harmGain);
          osc.start();
        });
      });
    });

    // ── FM bell layer: occasional celesta-like top notes via inharmonic FM ──
    const bellBus = audioCtx.createGain(); bellBus.gain.value = 0.7;
    const bellFilter = audioCtx.createBiquadFilter();
    bellFilter.type = 'lowpass';
    bellFilter.frequency.value = 4800;
    bellFilter.Q.value = 0.4;
    bellFilter.connect(bellBus);
    bellBus.connect(dryGain); bellBus.connect(reverb);

    function ringBell(freq, vel) {
      const t = audioCtx.currentTime;
      const carrier   = audioCtx.createOscillator();
      const modulator = audioCtx.createOscillator();
      const modGain   = audioCtx.createGain();
      const env       = audioCtx.createGain();

      carrier.type = 'sine';
      carrier.frequency.value = freq;
      modulator.type = 'sine';
      modulator.frequency.value = freq * 3.41;   // inharmonic FM ratio for bell
      modGain.gain.value = freq * 1.8;           // FM index — controls metallic edge

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(vel, t + 0.035);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);

      carrier.connect(env);
      env.connect(bellFilter);

      carrier.start(t);  modulator.start(t);
      carrier.stop(t + 5.4); modulator.stop(t + 5.4);
    }

    // A-pentatonic-ish cluster sitting consonantly above the drone
    const bellNotes = [880, 1318.51, 1760, 1975.53, 2637.02];   // A5, E6, A6, B6, E7
    function scheduleBells() {
      if (!audioOn) { setTimeout(scheduleBells, 4000); return; }
      const note = bellNotes[Math.floor(Math.random() * bellNotes.length)];
      const vel  = 0.022 + Math.random() * 0.022;
      ringBell(note, vel);
      const nextDelay = 7000 + Math.random() * 13000;
      setTimeout(scheduleBells, nextDelay);
    }
    setTimeout(scheduleBells, 4500);

    function readAudio() {
      if (analyser) {
        analyser.getByteFrequencyData(audioData);
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) sum += audioData[i];
        targetAudioLevel = (sum / audioData.length) / 255;
      }
      requestAnimationFrame(readAudio);
    }
    readAudio();
  }
  function startAudio() {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioOn = true;
    listenBtn.classList.add('active');
    listenBtn.querySelector('.listen-label').textContent = 'Listening';
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.42, audioCtx.currentTime + 3.0);
  }
  function stopAudio() {
    if (!audioCtx) return;
    audioOn = false;
    listenBtn.classList.remove('active');
    listenBtn.querySelector('.listen-label').textContent = 'Listen';
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.6);
    setTimeout(() => { targetAudioLevel = 0; }, 1600);
  }
  listenBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!audioCtx) { startAudio(); return; }
    if (audioOn) stopAudio(); else startAudio();
  });

  // ─────────────────────────────────────────────
  //  INITIAL STATE → ENTER → INFINITE LOOP
  //  Pacing matched to audio LFO breath (~10-14s)
  // ─────────────────────────────────────────────
  const entry = document.getElementById('entry');

  // Show Enter button after the rings + SONORO have settled
  setTimeout(() => entry.classList.add('show'), 4500);

  const FADE_DURATION   = 1600;   // 1.6s — matches CSS --fade-dur
  const TRANSITION_GAP  = 350;    // tighter breath of just rings between phases

  // Rings visibility — fade out when chat bar takes the screen
  function setRingsVisible(visible) {
    canvas.style.transition = `opacity ${FADE_DURATION}ms cubic-bezier(.22, .96, .24, 1)`;
    canvas.style.opacity = visible ? '1' : '0';
  }

  // Each phase: fade-in (FADE_DURATION) → visibleTime → fade-out (FADE_DURATION) → gap
  const sequence = [
    { class: 'show-tagline', visibleTime: 3500,  onEnter: null,                                                 onExit: null },
    { class: 'show-chatbar', visibleTime: 12000, onEnter: () => { runAskCycleOnce(); setRingsVisible(false); }, onExit: () => setRingsVisible(true) },
    { class: 'show-tagline', visibleTime: 3500,  onEnter: null,                                                 onExit: null },
    { class: 'show-cycling', visibleTime: 20000, onEnter: () => runCycleOnce(),                                 onExit: null },
    { class: 'show-sonoro',  visibleTime: 3500,  onEnter: null,                                                 onExit: null },
  ];
  let stateIdx = 0;

  function runState() {
    const state = sequence[stateIdx];
    document.body.classList.add(state.class);
    if (state.onEnter) state.onEnter();
    setTimeout(() => {
      document.body.classList.remove(state.class);
      if (state.onExit) state.onExit();
      setTimeout(() => {
        stateIdx = (stateIdx + 1) % sequence.length;
        runState();
      }, FADE_DURATION + TRANSITION_GAP);
    }, FADE_DURATION + state.visibleTime);
  }

  function enterExperience() {
    entry.classList.add('dismiss');
    entry.classList.remove('show');
    startAudio();
    document.body.classList.add('entered');
    bindHovers();

    // Let SONORO fade out gracefully before the loop's first phase begins
    setTimeout(() => {
      document.body.classList.remove('state-initial');
      setTimeout(runState, FADE_DURATION + TRANSITION_GAP);
    }, 800);

    setTimeout(() => entry.remove(), 1800);
  }

  entry.addEventListener('click', e => {
    e.stopPropagation();
    enterExperience();
  });

  bindHovers();
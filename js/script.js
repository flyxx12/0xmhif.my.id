/* PELAGIC: vanilla, dependency-free. One photograph, two framings. */
(() => {
  'use strict';
  const root = document.documentElement;
  const scene = document.querySelector('.scene');
  const viewport = document.querySelector('.scene-viewport');
  const photo = document.querySelector('.ocean-photo');
  const hero = document.querySelector('.hero');
  const product = document.querySelector('.product');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const outCubic = t => 1 - (1 - t) ** 3;
  const outQuart = t => 1 - (1 - t) ** 4;
  const inOut = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
  const track = (p, a, b, ease = t => t) => ease(clamp((p - a) / (b - a)));
  const set = (key, value) => root.style.setProperty(key, value);
  let geometry = { travel: 1, top: 0, x0: 0, x1: 0, y0: 0, y1: 0 };
  let current = 0, target = 0, frame = 0, lastTime = 0, focusProduct = false;
  let productVisible = false, heroHidden = false;
  const chapters = [...document.querySelectorAll('.chapter')];
  const cue = document.querySelector('.scroll-cue');
  const cueText = document.getElementById('scroll-cue-text');
  const depth = document.getElementById('depth-value');
  let lastDepth = -1, lastChapter = -1;

  function measure() {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    const imageWidth = photo.offsetWidth, imageHeight = photo.offsetHeight;
    const mobile = w <= 900;
    geometry = {
      travel: Math.max(1, scene.offsetHeight - h), top: scene.offsetTop,
      x0: (w - imageWidth) * (mobile ? .57 : .16),
      x1: (w - imageWidth) * (mobile ? .71 : .58),
      y0: (h - imageHeight) * .025, y1: h - imageHeight
    };
    target = progress();
  }
  function progress() { return clamp((window.scrollY - geometry.top) / geometry.travel); }
  function finishIntro() { root.classList.add('is-open'); }

  function paint(p) {
    if (p > .05) finishIntro();
    const q = clamp(p / .86);
    const cameraProgress = inOut(q);
    set('--cam-x', `${lerp(geometry.x0, geometry.x1, cameraProgress).toFixed(3)}px`);
    set('--cam-y', `${lerp(geometry.y0, geometry.y1, cameraProgress).toFixed(3)}px`);
    set('--cam-z', reducedMotion.matches ? '1' : (1 + .11 * Math.sin(Math.PI * q)).toFixed(5));
    set('--glow-o', 1 - track(p, .55, .95, inOut));
    set('--deep-o', track(p, .3, .9, inOut) * .85);
    const exit = track(p, .297, .508);
    const opacity = (1 - clamp((exit - .38) / .62)) ** 1.25;
    set('--hero-rise', `${(exit ** 1.75 * 163).toFixed(2)}px`);
    set('--hero-o', opacity.toFixed(4));
    set('--hero-filter', exit > 0 && exit < 1 && !reducedMotion.matches ? `blur(${(exit ** .9 * 18).toFixed(2)}px)` : 'none');
    set('--hero-vis', exit >= 1 ? 'hidden' : 'visible');
    set('--product-o', track(p, .557, .665, outCubic).toFixed(4));
    set('--product-vis', p > .54 ? 'visible' : 'hidden');
    set('--copy-y', `${((1 - track(p, .563, .967, outQuart)) * 360).toFixed(2)}px`);
    set('--panel-y', `${((1 - track(p, .557, .984, outCubic)) * 520).toFixed(2)}px`);
    set('--depth-p', p.toFixed(5));
    set('--transition-o', (track(p, .4, .46) * (1 - track(p, .51, .59))).toFixed(4));
    root.classList.toggle('is-moving', p > .001 && p < .999);
    if (productVisible !== (p > .62)) {
      productVisible = p > .62;
      product.inert = !productVisible;
      product.setAttribute('aria-hidden', String(!productVisible));
      if (!productVisible) stopAudio();
    }
    if (heroHidden !== (exit >= 1)) {
      heroHidden = exit >= 1;
      hero.inert = heroHidden;
      hero.setAttribute('aria-hidden', String(heroHidden));
    }
    const depthValue = Math.round(p * 240);
    if (lastDepth !== depthValue) { depth.textContent = String(depthValue).padStart(3, '0'); lastDepth = depthValue; }
    const chapter = p >= .6 ? 1 : 0;
    if (lastChapter !== chapter) {
      chapters.forEach((button, i) => {
        button.classList.toggle('active', i === chapter);
        if (i === chapter) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      });
      cue.dataset.progress = chapter === 1 ? '0' : '1';
      cue.href = chapter === 1 ? '#surface' : '#observatory';
      cue.classList.toggle('is-return', chapter === 1);
      cueText.textContent = chapter === 1 ? 'BACK TO THE SURFACE' : 'SCROLL TO DESCEND';
      lastChapter = chapter;
    }
    if (focusProduct && p > .98) {
      document.getElementById('product-title').focus({ preventScroll: true });
      focusProduct = false;
    }
  }
  function tick(time) {
    const dt = Math.min(.05, Math.max(.001, (time - lastTime) / 1000));
    lastTime = time;
    if (reducedMotion.matches) current = target;
    else {
      const step = (target - current) * (1 - Math.exp(-9 * dt));
      current += clamp(step, -.40 * dt, .40 * dt);
      if (Math.abs(target - current) < .0004) current = target;
    }
    paint(current);
    if (current !== target) frame = requestAnimationFrame(tick); else frame = 0;
  }
  function requestTick() {
    if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
  }
  function goTo(p, shouldFocus = false) {
    focusProduct = shouldFocus;
    // Jump the scroll position; the rate-capped camera supplies the smooth journey.
    window.scrollTo({ top: geometry.top + p * geometry.travel, behavior: 'instant' });
    target = progress();
    requestTick();
  }
  window.addEventListener('scroll', () => { target = progress(); requestTick(); }, { passive: true });
  window.addEventListener('resize', () => { measure(); paint(current); requestTick(); if (innerWidth > 900) closeMenu(); }, { passive: true });
  window.addEventListener('pageshow', () => { measure(); target = progress(); requestTick(); });
  reducedMotion.addEventListener('change', () => { finishIntro(); measure(); requestTick(); });
  photo.addEventListener('load', () => { measure(); paint(current); });
  photo.addEventListener('error', () => { showToast('The background image could not load. Please check your connection.'); });

  // Mobile navigation: explicit focus restoration and complete close behavior.
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu(true);
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    menu.querySelector('button, a').focus();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', event => {
    const progressLink = event.target.closest('[data-progress]');
    if (progressLink) {
      event.preventDefault();
      goTo(Number(progressLink.dataset.progress), progressLink.hasAttribute('data-focus-product'));
      closeMenu();
    }
    if (!menu.hidden && !menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  // Meaningful supporting content, kept inside this single-page experience.
  const dialog = document.getElementById('info-dialog');
  const dialogContent = {
    mission: {
      eyebrow: 'ABOUT THE RESEARCHER', title: 'Security through responsible research.',
      html: '<p>I am <strong>M. Hardian Imam Fadila</strong>, an independent cybersecurity researcher focused on web application security and vulnerability assessment.</p><p>My approach combines reconnaissance, careful validation, impact analysis, and clear reporting. I follow responsible disclosure practices and aim to help organizations understand and remediate security weaknesses.</p><p class="fine-print">The interactive console on this page is illustrative only. It does not scan live systems or represent verified vulnerability findings.</p>'
    },
    notes: {
      eyebrow: 'RESEARCH NOTES / VOLUME 01', title: 'A disciplined research workflow.',
      html: '<h3>01 / Reconnaissance</h3><p>Map the authorized scope, identify exposed technologies, and understand the application attack surface.</p><h3>02 / Validation and impact</h3><p>Test potential weaknesses carefully, retain reproducible evidence, and assess realistic security impact without accessing or altering unnecessary data.</p><h3>03 / Responsible disclosure</h3><p>Prepare a clear report with affected assets, steps to reproduce, impact, and remediation guidance. Only test systems where you have permission.</p><p class="fine-print">The interactive data and audio on this page are synthetic interface elements, not results from a real security assessment.</p>'
    }
  };
  let dialogTrigger = null;
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    dialogTrigger = button.closest('.mobile-menu') ? menuToggle : button;
    const content = dialogContent[button.dataset.dialog];
    document.getElementById('dialog-eyebrow').textContent = content.eyebrow;
    document.getElementById('dialog-title').innerHTML = content.title;
    document.getElementById('dialog-content').innerHTML = content.html;
    closeMenu();
    stopAudio();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  function closeDialog() { dialog.close(); }
  document.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; if (dialogTrigger) dialogTrigger.focus({ preventScroll: true }); });
  document.getElementById('dialog-action').addEventListener('click', () => { closeDialog(); goTo(1, true); });

  // Demonstration dataset: deliberately synthetic, no API or live-data claims.
  const species = {
    humpback: { name: 'Reconnaissance', frequency: 1, depth: 1, type: 'Mapping the authorized attack surface', clarity: 'Structured', id: 'RS—0001', pattern: 'RECON PATTERN', seed: 2.1, dx: 0, dy: 0, tones: [124, 180, 98, 155, 110, 82] },
    blue: { name: 'Vulnerability analysis', frequency: 2, depth: 2, type: 'Validating potential security weaknesses', clarity: 'Evidence-based', id: 'VA—0002', pattern: 'VALIDATION PATTERN', seed: 4.7, dx: -71, dy: 50, tones: [63, 52, 68, 48, 57, 44] },
    fin: { name: 'Responsible disclosure', frequency: 3, depth: 3, type: 'Reporting findings with remediation guidance', clarity: 'Documented', id: 'RD—0003', pattern: 'DISCLOSURE PATTERN', seed: 7.3, dx: 20, dy: 73, tones: [80, 62, 80, 62, 80, 62] }
  };
  let selected = 'humpback';
  const tabs = [...document.querySelectorAll('[data-species]')];
  const waveform = document.getElementById('waveform');
  const play = document.getElementById('play-sample');
  const mobilePlay = document.getElementById('mobile-play');
  const mobileSpecies = document.getElementById('mobile-species');
  const sampleTime = document.getElementById('sample-time');
  const sampleLength = 12;
  let amplitudes = [], waveBars = [];
  let audioContext = null, audioMaster = null, audioNodes = [], audioFrame = 0, audioStart = 0, playing = false;

  function makeWaveform(seed) {
    amplitudes = Array.from({ length: 104 }, (_, i) => {
      const envelope = .13 + .87 * Math.sin(i * .092 + seed) ** 4;
      return Math.max(2, Math.round((5 + 29 * Math.abs(Math.sin(i * 1.71 + seed) * Math.cos(i * .32))) * envelope));
    });
    waveform.innerHTML = amplitudes.map((a, i) => `<line x1="${i * 5 + 2}" x2="${i * 5 + 2}" y1="${21 - a / 2}" y2="${21 + a / 2}"/>`).join('');
    waveBars = [...waveform.children];
  }
  function chooseSpecies(key) {
    stopAudio();
    selected = key;
    mobileSpecies.value = key;
    const data = species[key];
    tabs.forEach(tab => { const active = tab.dataset.species === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    document.getElementById('signal-panel').setAttribute('aria-labelledby', `tab-${key}`);
    document.getElementById('frequency').textContent = data.frequency;
    document.getElementById('species-depth').textContent = data.depth;
    document.getElementById('signal-type').textContent = data.type;
    document.getElementById('clarity').textContent = data.clarity;
    document.getElementById('signal-id').textContent = data.id;
    document.getElementById('sample-title').textContent = `${data.name.toUpperCase()} / ${data.pattern}`;
    document.getElementById('sonar-target').setAttribute('transform', `translate(${data.dx} ${data.dy})`);
    play.setAttribute('aria-label', `Play synthesized ${data.name.toLowerCase()}-inspired sample`);
    makeWaveform(data.seed);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseSpecies(tab.dataset.species));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[next].focus(); chooseSpecies(tabs[next].dataset.species);
    });
  });
  function stopAudio(reset = true) {
    if (audioFrame) cancelAnimationFrame(audioFrame);
    audioFrame = 0;
    if (audioMaster && audioContext) {
      audioMaster.gain.cancelScheduledValues(audioContext.currentTime);
      audioMaster.gain.setTargetAtTime(0, audioContext.currentTime, .02);
    }
    audioNodes.forEach(node => { try { node.stop(); } catch (_) { /* already ended */ } });
    audioNodes = [];
    playing = false;
    play.setAttribute('aria-pressed', 'false');
    play.setAttribute('aria-label', `Play synthesized ${species[selected].name.toLowerCase()} sample`);
    play.querySelector('use').setAttribute('href', '#i-play');
    mobilePlay.setAttribute('aria-pressed', 'false');
    mobilePlay.setAttribute('aria-label', 'Play synthetic demo audio');
    mobilePlay.querySelector('use').setAttribute('href', '#i-play');
    mobilePlay.querySelector('span').textContent = 'Play sample';
    if (reset) {
      sampleTime.textContent = '00:00 / 00:12';
      waveBars.forEach(bar => bar.classList.remove('played'));
    }
  }
  function audioTick() {
    if (!playing) return;
    const elapsed = Math.min(sampleLength, audioContext.currentTime - audioStart);
    sampleTime.textContent = `00:${String(Math.floor(elapsed)).padStart(2, '0')} / 00:12`;
    waveBars.forEach((bar, i) => bar.classList.toggle('played', i / waveBars.length <= elapsed / sampleLength));
    if (elapsed >= sampleLength) { stopAudio(false); return; }
    audioFrame = requestAnimationFrame(audioTick);
  }
  async function playAudio() {
    if (playing) { stopAudio(); return; }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { showToast('Audio is not supported in this browser. Try a current browser.'); return; }
    play.disabled = true;
    mobilePlay.disabled = true;
    try {
      if (!audioContext) audioContext = new AudioCtx();
      await audioContext.resume();
      if (!productVisible || document.hidden) return;
      audioMaster = audioContext.createGain();
      audioMaster.gain.value = .22;
      audioMaster.connect(audioContext.destination);
      audioStart = audioContext.currentTime + .04;
      species[selected].tones.forEach((frequency, index) => {
        const start = audioStart + index * 2;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, start);
        osc.frequency.exponentialRampToValueAtTime(frequency * .65, start + 1.7);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.34, start + .35);
        gain.gain.exponentialRampToValueAtTime(.001, start + 1.9);
        osc.connect(gain); gain.connect(audioMaster);
        osc.start(start); osc.stop(start + 1.95);
        audioNodes.push(osc);
      });
      playing = true;
      play.setAttribute('aria-pressed', 'true');
      play.setAttribute('aria-label', 'Stop synthetic demo audio');
      play.querySelector('use').setAttribute('href', '#i-pause');
      mobilePlay.setAttribute('aria-pressed', 'true');
      mobilePlay.setAttribute('aria-label', 'Stop synthetic demo audio');
      mobilePlay.querySelector('use').setAttribute('href', '#i-pause');
      mobilePlay.querySelector('span').textContent = 'Stop sample';
      audioTick();
    } catch (_) { showToast('Audio could not start. Please try again.'); stopAudio(); }
    finally { play.disabled = false; mobilePlay.disabled = false; }
  }
  play.addEventListener('click', playAudio);
  mobilePlay.addEventListener('click', playAudio);
  mobileSpecies.addEventListener('change', () => chooseSpecies(mobileSpecies.value));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', () => { stopAudio(); if (audioContext) audioContext.suspend(); });

  document.getElementById('download-data').addEventListener('click', () => {
    const data = species[selected];
    const rows = ['# MHIF illustrative interface data — not assessment results', 'research_area,illustrative_stage,illustrative_metric,time_seconds,relative_amplitude', ...amplitudes.map((a, i) => `${data.name},${data.frequency},${data.depth},${(i * sampleLength / amplitudes.length).toFixed(3)},${(a / 34).toFixed(4)}`)];
    const url = URL.createObjectURL(new Blob([rows.join('\n') + '\n'], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `mhif-${selected}-illustrative-data.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Illustrative signal data downloaded.');
  });
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message; toast.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
  }
  document.getElementById('headphone-hint').addEventListener('click', () => showToast('This audio is synthetic interface behavior, not a security scan or research result.'));


  // Certificate and appreciation-letter carousel.
  const awards = [
    { file: 'drexel-letter.jpg', alt: 'Drexel University letter of appreciation for bug bounty contributions', kicker: 'INTERNATIONAL UNIVERSITY', title: 'Drexel University', description: 'Letter of appreciation · Bug Bounty Program · August 2026' },
    { file: 'esdm-appreciation.jpg', alt: 'Ministry of Energy and Mineral Resources appreciation certificate', kicker: 'INDONESIAN GOVERNMENT', title: 'Ministry of Energy and Mineral Resources', description: 'ESDM-CSIRT · High-severity vulnerability contribution · May 2026' },
    { file: 'ums-appreciation.jpg', alt: 'DRPPS Universitas Muhammadiyah Surakarta appreciation certificate', kicker: 'INDONESIAN UNIVERSITY', title: 'DRPPS UMS', description: 'Appreciation certificate · Web journal vulnerability report · April 2026' },
    { file: 'purbalingga-csirt.jpg', alt: 'PurbalinggaKab-CSIRT certificate of appreciation', kicker: 'GOVERNMENT CSIRT', title: 'PurbalinggaKab-CSIRT', description: 'Certificate of appreciation · Information security vulnerability report · 2026' },
    { file: 'bali-provincial-government.jpg', alt: 'Bali Provincial Government certificate of appreciation', kicker: 'PROVINCIAL GOVERNMENT', title: 'Bali Provincial Government', description: 'Certificate of appreciation · Electronic system security contribution · June 2026' },
    { file: 'university-san-diego-letter.jpg', alt: 'University of San Diego letter from Information Technology Services', kicker: 'INTERNATIONAL UNIVERSITY', title: 'University of San Diego', description: 'Letter from Information Technology Services · July 2026' }
  ];
  const awardImage = document.getElementById('award-image');
  if (awardImage) {
  let awardIndex = 0;
  const awardOpen = document.getElementById('award-open');
  const awardDots = document.getElementById('award-dots');
  function showAward(index) {
    awardIndex = (index + awards.length) % awards.length;
    const award = awards[awardIndex];
    const src = `assets/${award.file}`;
    awardImage.src = src;
    awardImage.alt = award.alt;
    awardOpen.href = src;
    document.getElementById('award-kicker').textContent = award.kicker;
    document.getElementById('award-title').textContent = award.title;
    document.getElementById('award-description').textContent = award.description;
    document.getElementById('award-counter').textContent = `${String(awardIndex + 1).padStart(2, '0')} / ${String(awards.length).padStart(2, '0')}`;
    [...awardDots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === awardIndex)));
  }
  awards.forEach((award, index) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.setAttribute('aria-label', `Show ${award.title}`);
    dot.addEventListener('click', () => showAward(index));
    awardDots.appendChild(dot);
  });
  document.getElementById('award-prev').addEventListener('click', () => showAward(awardIndex - 1));
  document.getElementById('award-next').addEventListener('click', () => showAward(awardIndex + 1));
  // Swipe left/right on the document preview, including touchscreens and trackpads.
  const awardFrame = document.querySelector('.award-image-frame');
  let awardTouchStartX = null;
  awardFrame.addEventListener('touchstart', event => {
    awardTouchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  awardFrame.addEventListener('touchend', event => {
    if (awardTouchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - awardTouchStartX;
    if (Math.abs(deltaX) > 45) showAward(awardIndex + (deltaX < 0 ? 1 : -1));
    awardTouchStartX = null;
  }, { passive: true });
  // Arrow keys work when the gallery or its controls are focused.
  document.querySelector('.award-gallery').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showAward(awardIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showAward(awardIndex + 1); }
  });
  showAward(0);
  }

  makeWaveform(species[selected].seed);
  measure(); current = target = progress(); paint(current);
  const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontReady, new Promise(resolve => setTimeout(resolve, 1200))]).then(() => {
    if (reducedMotion.matches || progress() > .02) finishIntro();
    else { root.classList.add('is-ready'); setTimeout(finishIntro, 1800); }
  });
  document.querySelector('.hero-bottom').addEventListener('animationend', finishIntro, { once: true });
})();

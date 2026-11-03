/* Our Story: the journey map follows the chapters as you scroll (route draws pin to pin,
   a traveller dot moves along it, pins light up), plus gentle reveals and count-ups.
   With reduced motion the map still follows the scroll; only the decorative motion stops. */
(() => {
  const root = document.querySelector('.story-page');
  if (!root) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add(still ? 'story-still' : 'story-motion');
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* reveal elements as they come into view */
  let pending = $$('[data-reveal]', root);
  if (still) { pending.forEach(el => el.classList.add('is-in')); pending = []; }
  const reveal = () => {
    const line = innerHeight * .88;
    pending = pending.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < line && r.bottom > 0) { el.classList.add('is-in'); return false; }
      return true;
    });
  };

  /* numbers count up the first time they are seen */
  const countUp = el => {
    const end = Number(el.dataset.count);
    if (still) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const k = clamp((t - t0) / dur);   // frame time can precede t0, so never go below 0
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick); else el.textContent = end;
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };
  let counting = $$('[data-count]', root);
  const count = () => {
    counting = counting.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * .85 && r.bottom > 0) { countUp(el); return false; }
      return true;
    });
  };

  /* produce from each collective, linked to its product page (produce named in the chapter first) */
  const PRODUCTS = window.BEWILD_PRODUCTS || [];
  const baseName = p => p.name.startsWith('Canephora') ? 'Specialty coffee' : p.name.replace(/\s+\d+\s?kg$/i, '').replace(/\s*\(.*\)$/, '');
  $$('.jm-produce', root).forEach(ul => {
    const keys = (ul.dataset.keys || '').split(' ');
    const rank = p => { const i = keys.findIndex(k => p.name.toLowerCase().includes(k)); return i < 0 ? keys.length : i; };
    const seen = new Set();
    const items = PRODUCTS.filter(p => p.origin === ul.dataset.origin && p.available).sort((a, b) => rank(a) - rank(b))
      .filter(p => !seen.has(baseName(p)) && seen.add(baseName(p))).slice(0, 4);
    ul.innerHTML = items.map(p => `<li><a href="${(window.BEWILD_PDP_URL || (x => 'product.html?p=' + encodeURIComponent(x.handle)))(p)}"><img src="${p.image}" alt="" loading="lazy"><span>${baseName(p)}</span></a></li>`).join('');
  });

  /* the journey map */
  const jm = root.querySelector('.journey-map');
  const chapters = jm ? $$('.jm-ch', jm) : [];
  const legs = jm ? $$('.leg', jm) : [], pins = jm ? $$('.pin[data-pin]', jm) : [], legend = jm ? $$('[data-legend]', jm) : [];
  const traveller = jm && jm.querySelector('.traveller');
  const twins = jm ? $$('.pin[data-twin]', jm).map(p => [p, chapters.findIndex(c => c.dataset.twin === p.dataset.twin)]) : [];
  const lens = legs.map(l => { const L = l.getTotalLength(); l.style.strokeDasharray = `${L} ${L}`; l.style.strokeDashoffset = L; return L; });
  const lastStop = pins.length - 1;
  let shown = false;
  const journey = () => {
    if (!jm) return;
    // a chapter wakes up when its heading rises past ~60% of the screen, so the label and heading are read in full colour
    const mid = innerHeight * .6;
    const anchors = chapters.map(c => c.getBoundingClientRect().top + 40);
    let J, k = -1;
    if (anchors[0] > mid) J = 0;
    else {
      k = 0;
      while (k < anchors.length - 1 && anchors[k + 1] <= mid) k++;
      const a = Number(chapters[k].dataset.stop), b = k < chapters.length - 1 ? Number(chapters[k + 1].dataset.stop) : a;
      const t = k < anchors.length - 1 ? clamp((mid - anchors[k]) / Math.max(1, anchors[k + 1] - anchors[k])) : 0;
      J = a + (b - a) * t;
      chapters.forEach((c, i) => c.classList.toggle('is-active', i === k));
    }
    const mapBox = jm.querySelector('.jm-map').getBoundingClientRect();
    if (!shown && mapBox.top < innerHeight * .75) { shown = true; jm.classList.add('is-live'); }
    legs.forEach((l, i) => { l.style.strokeDashoffset = lens[i] * (1 - clamp(J - i)); });
    const active = Math.min(lastStop, Math.floor(J + 1e-4));
    const allLit = J >= lastStop + .5;
    const inTwin = k >= 0 && 'twin' in chapters[k].dataset;
    pins.forEach((p, i) => { p.classList.toggle('is-reached', i <= J + 1e-4); p.classList.toggle('is-on', !allLit && !inTwin && i === active); });
    legend.forEach((li, i) => {
      li.classList.toggle('is-on', !allLit && i === active); li.classList.toggle('is-reached', i <= J + 1e-4);
      li.style.setProperty('--f', i ? clamp(J - (i - 1)).toFixed(3) : 1);   // the line into this stop fills as you read towards it
    });
    jm.classList.toggle('is-complete', allLit);
    /* Coorg's other collectives (Poomaale 2.0, Hammiyala) sit beside Poomaale 1.0: each pin drops in at its own chapter and stays */
    twins.forEach(([p, c]) => { p.classList.toggle('is-reached', c >= 0 && k >= c); p.classList.toggle('is-on', !allLit && k === c); });
    if (traveller && legs.length) {
      const i = Math.min(legs.length - 1, Math.floor(J)), f = J >= legs.length ? 1 : clamp(J - i);
      const pt = legs[i].getPointAtLength(lens[i] * f);
      traveller.setAttribute('cx', pt.x.toFixed(1)); traveller.setAttribute('cy', pt.y.toFixed(1));
      traveller.classList.toggle('is-moving', f > .02 && f < .98);
    }
  };

  /* the four returns: one panel open at a time; it steps through on its own while in view until someone chooses */
  const r4 = root.querySelector('[data-r4]');
  let r4View = () => {};
  if (r4) {
    const strips = $$('.r4-strip', r4), heads = strips.map(st => st.querySelector('.r4-head'));
    let cur = 0, auto = !still, t0 = 0, inView = false, paused = false, p = 0;
    const DUR = 7000;
    const show = i => {
      cur = (i + strips.length) % strips.length; p = 0; t0 = performance.now();
      strips.forEach((st, k) => { st.classList.toggle('is-on', k === cur); st.style.setProperty('--p', auto ? 0 : 1); heads[k].setAttribute('aria-expanded', k === cur); });
    };
    const choose = i => { auto = false; show(i); };
    strips.forEach((st, k) => st.addEventListener('click', () => { if (k !== cur || auto) choose(k); }));
    heads.forEach((h, k) => h.addEventListener('keydown', e => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); choose(cur + d); heads[cur].focus(); }
    }));
    r4.addEventListener('pointerenter', () => { paused = true; });
    r4.addEventListener('pointerleave', () => { paused = false; t0 = performance.now() - DUR * p; });
    const tick = now => {
      if (!auto) { strips.forEach(st => st.style.setProperty('--p', 1)); return; }
      if (inView && !paused) {
        p = clamp((now - t0) / DUR);
        strips[cur].style.setProperty('--p', p.toFixed(3));
        if (p >= 1) show(cur + 1);
      } else t0 = now - DUR * p;
      requestAnimationFrame(tick);
    };
    r4View = () => { const b = r4.getBoundingClientRect(); inView = b.top < innerHeight * .7 && b.bottom > innerHeight * .25; };
    show(0);
    if (auto) requestAnimationFrame(tick);
  }

  const onScroll = () => { reveal(); count(); journey(); r4View(); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();

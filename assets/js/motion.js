/* Text motion at story moments only (never prices, buttons, forms or the basket).
   Hero lines rise on load; section headings arrive kicker → heading → light words → lead as they scroll in;
   "Food carries the memory…" writes itself word by word; quotes and the promise list arrive one line at a time;
   plain-number facts count up. Content is visible by default: the hidden starting state only applies
   once this script has added .tx-motion, and never with reduced motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('tx-motion');
  const owned = el => el.closest('[data-reveal]');            // Our Story already animates these itself
  const mark = (el, delay) => { if (!el || owned(el)) return null; el.classList.add('tx'); el.style.setProperty('--tx-d', `${delay}s`); return el; };

  /* hero: each line rises, then the intro line and the buttons */
  const hero = document.querySelector('.hero');
  if (hero) {
    $$('h1 > span', hero).forEach((s, i) => mark(s, .15 + i * .14));
    mark(hero.querySelector('.lead'), .48);
    mark(hero.querySelector('.hero-actions'), .62);
    setTimeout(() => $$('.tx', hero).forEach(el => el.classList.add('is-in')), 60);
  }

  /* one signature line written word by word */
  const sig = $$('h2').find(h => /Food carries the memory/.test(h.textContent));
  if (sig && !owned(sig)) {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'tx-w'; w.textContent = part; w.style.setProperty('--tx-d', `${i++ * .07}s`);
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(sig);
    sig.classList.add('tx-words');
  }

  /* section heads: kicker → heading (light words a beat later) → lead */
  $$('.chapter-head, .rcp-head, .blog-head, .contact-head, .track-head, .journey-head, .post-head').forEach(head => {
    if (head.closest('.hero')) return;
    let d = 0;
    $$('.kicker', head).forEach(k => { if (mark(k, d)) d += .08; });
    $$('h1, h2', head).forEach(h => {
      if (h.classList.contains('tx-words')) { d += .1; return; }
      if (mark(h, d)) { $$('em', h).forEach(em => { em.classList.add('tx-em'); em.style.setProperty('--tx-d', `${d + .22}s`); }); d += .14; }
    });
    $$('.lead', head).forEach(l => { if (mark(l, d + .1)) d += .08; });
  });

  /* quotes: pull line, text, then who said it */
  $$('.voice').forEach(v => {
    $$('blockquote p, figcaption', v).forEach((el, i) => mark(el, i * .12));
  });

  /* our promise: one promise at a time */
  $$('.promise-list li').forEach((li, i) => { li.classList.add('tx'); li.style.setProperty('--tx-d', `${.15 + i * .16}s`); });

  /* reveal on scroll */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  let pending = $$('.tx, .tx-words').filter(el => !el.closest('.hero'));
  pending.forEach(el => io.observe(el));

  /* safety net: a plain position check too, so text can never stay hidden if the observer is late */
  const check = () => {
    const edge = innerHeight * .92;
    pending = pending.filter(el => {
      if (el.classList.contains('is-in')) return false;
      if (el.getBoundingClientRect().top < edge) { el.classList.add('is-in'); io.unobserve(el); return false; }
      return true;
    });
    if (!pending.length) { removeEventListener('scroll', onScroll); clearInterval(poll); }
  };
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; setTimeout(() => { ticking = false; check(); }, 120); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  const poll = setInterval(check, 700);                     // cheap: ~30 rect reads, stops once all are in
  setTimeout(check, 400);

  /* plain-number facts count up the first time they are seen (e.g. 132 acres · 88 families) */
  const counters = $$('.jm-facts b, .rd-facts b').filter(b => /^\s*\d{2,4}\s*$/.test(b.textContent) && !b.querySelector('[data-count]'));
  const cio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = Number(el.textContent.trim()), t0 = performance.now(), dur = 1200;
    const tick = t => { const k = Math.min(1, Math.max(0, (t - t0) / dur)); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); else el.textContent = end; };
    el.textContent = '0'; requestAnimationFrame(tick);
  }), { rootMargin: '0px 0px -10% 0px' });
  counters.forEach(c => cio.observe(c));
})();

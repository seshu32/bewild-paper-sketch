/* Coffee detail page (coffee.html) only. Coffee-specific behaviour goes here,
   so the non-coffee (product.html) and combo (combo.html) pages are never affected. */
(() => {
  if (!document.body.classList.contains('pdp-coffee')) return;
  const pdp = window.BEWILD_PDP;
  if (!pdp) return;
  const { p } = pdp;
  const { esc } = window.BEWILD;
  const details = document.getElementById('pdp-details');
  if (!details) return;

  /* ---- the coffee's facts, straight from the product data ---- */
  const fact = k => (p.insights.find(([l]) => l.toLowerCase() === k) || [])[1] || '';
  const title = s => String(s).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const roast = fact('roast level').toLowerCase();
  const roastAt = roast.includes('dark') ? 2 : roast.includes('light') ? 0 : 1;
  const process = title(fact('process'));
  const isDrip = /drip/i.test(p.name);

  const [method, ratio, time, temp] = p.brew[0] || [];
  const methodName = !method || /^none$/i.test(method) ? (isDrip ? 'Drip bag' : 'Your way') : method;
  const rp = String(ratio || '').match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  const parts = rp ? parseFloat(rp[2]) / parseFloat(rp[1]) : 0;            // water per gram of coffee
  // brew time in seconds: "4:00" → 240, "3:00 mins" → 180, "26-30 secs" → 30
  const seconds = (() => {
    const s = String(time || '');
    if (/sec/i.test(s)) { const n = s.match(/\d+/g); return n ? Number(n[n.length - 1]) : 0; }
    const m = s.match(/(\d+)(?::(\d+))?/); return m ? Number(m[1]) * 60 + Number(m[2] || 0) : 0;
  })();
  const clock = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

  const passport = [
    ['Origin', fact('origin')], ['Grown at', fact('farm').replace(/\s+by beforest$/i, '')], ['Variety', fact('bean variety')], ['Pack', window.BEWILD.packSize(fact('quantity') || p.weight)],
  ].filter(([, v]) => v);

  const ICON = {
    temp: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 9v7"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>', pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/>',
  };
  const icon = (k, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${ICON[k]}</svg>`;
  const R = 52, C = 2 * Math.PI * R;

  /* brew guide: how much makes a cup, the cup's outline, and the steps for this method.
     The steps are general how-to guidance for each method; the ratio, time and temperature are the coffee's own. */
  const isEspresso = /espresso/i.test(methodName);
  const unit = isEspresso ? 'shot' : 'cup', perCup = isEspresso ? 18 : 15;
  const CUP = 'M40 46H180L168 186Q166 200 150 200H70Q54 200 52 186Z';
  const SERVE = 'M234 158H304L299 192Q298 200 290 200H248Q240 200 239 192Z';   // the small cup it is poured into
  const STEPS = {
    'french press': ['Add the coffee to the press', 'Pour in the hot water', 'Let it steep', 'Press down slowly and pour'],
    'pour over': ['Rinse the filter and add the coffee', 'Pour slowly, in circles', 'Let it drain through', 'Swirl and serve'],
    'south indian filter coffee': ['Add the coffee to the upper chamber', 'Pour the hot water over it', 'Let the decoction drip', 'Mix with hot milk and serve'],
    'cold brew': ['Combine the coffee and water', 'Stir it through', 'Let it steep', 'Strain and serve over ice'],
    'espresso': ['Dose and tamp the coffee', 'Lock in the portafilter', 'Pull the shot', 'Serve straight away'],
    'drip bag': ['Open the bag and hang it on your cup', 'Pour the water slowly', 'Let it drip through', 'Lift the bag and enjoy'],
  };
  const steps = STEPS[methodName.toLowerCase()] || ['Measure the coffee', 'Add the hot water', 'Let it brew', 'Pour and enjoy'];
  const TIMED = 2;                                                       // the step the timer runs for

  // coffee keeps one facts block, "Know your coffee"; the flavour notes stay under the name only
  const row = document.getElementById('pdp-facts'); if (row) row.hidden = true;
  details.classList.add('coffee-know');
  details.innerHTML = `
    <div class="chapter-head"><div><span class="kicker">From cherry to cup</span><h2>Know your <em>coffee</em></h2></div></div>

    <div class="ck-top">
      <dl class="ck-facts">
        ${roast ? `<div><dt>Roast</dt><dd><span class="ck-meter" data-at="${roastAt}"><i></i><i></i><i></i></span>${['Light', 'Medium', 'Dark'][roastAt]}</dd></div>` : ''}
        ${process ? `<div><dt>Process</dt><dd>${esc(process)}</dd></div>` : ''}
        ${passport.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    </div>


    ${p.brew.length ? `<section class="ck-brew" aria-label="Brew it at home">
      <header class="ck-brew-head">
        <div><span class="kicker">Brew it at home</span><h3>${esc(methodName)}</h3></div>
      </header>

      <div class="ck-studio">
        <!-- the cup: water level follows the dose, the colour deepens as it brews -->
        <figure class="ck-cupviz" aria-hidden="true">
          <svg viewBox="0 0 ${isDrip ? 220 : 330} 230">
            <defs>
              <clipPath id="ck-cup-clip"><path d="${CUP}"/></clipPath>
              ${isDrip ? '' : `<clipPath id="ck-serve-clip"><path d="${SERVE}"/></clipPath>`}
            </defs>
            <g class="ck-brewer">
              <g class="ck-steam"><path d="M86 34c-8-10 8-16 0-26"/><path d="M110 30c-8-10 8-16 0-26"/><path d="M134 34c-8-10 8-16 0-26"/></g>
              <g clip-path="url(#ck-cup-clip)">
                <rect class="ck-liquid" x="-60" y="230" width="340" height="300"/>
                <rect class="ck-grounds" x="-60" y="230" width="340" height="0"/>
              </g>
              <line class="ck-target" x1="56" x2="164" y1="120" y2="120"/>
              <path class="ck-inflow" d="M112 -24V120"/>
              <path class="ck-cup" d="${CUP}"/>
              <path class="ck-handle" d="${isDrip ? 'M172 82c26 0 30 54 0 62' : 'M48 82c-26 0-30 54 0 62'}"/>
            </g>
            ${isDrip ? '' : `<!-- after brewing: the brewer tilts and pours into this cup -->
            <path class="ck-stream" d="M189 50C214 50 262 92 268 160" pathLength="1"/>
            <g class="ck-serve">
              <g class="ck-serve-steam"><path d="M258 140c-6-8 6-12 0-20"/><path d="M276 136c-6-8 6-12 0-20"/></g>
              <g clip-path="url(#ck-serve-clip)"><rect class="ck-serve-liquid" x="230" y="206" width="80" height="60"/></g>
              <path class="ck-cup" d="${SERVE}"/>
              <path class="ck-handle" d="M301 164c15 0 16 26 0 28"/>
            </g>`}
            <path class="ck-saucer" d="${isDrip ? 'M30 206h160' : 'M24 206h296'}"/>
          </svg>
          <figcaption>${isDrip ? `Water${temp ? ` at <b>${esc(temp)}</b>` : ''}` : `<b data-ml>0</b> ml water${temp ? ` at <b>${esc(temp)}</b>` : ''}`}</figcaption>
        </figure>

        <div class="ck-dose">
          <span class="ck-label">Your dose</span>
          ${isDrip ? `<p class="ck-pour">One bag makes <b>one cup</b>.</p>
            <small>Hang the bag on your cup and pour slowly.</small>`
          : `<div class="ck-presets" role="group" aria-label="How many">
              ${[1, 2, 3].map(n => `<button type="button" data-cups="${n}" aria-pressed="${n === 1}">${n} ${unit}${n > 1 ? 's' : ''}</button>`).join('')}
            </div>
            <div class="ck-stepper">
              <button type="button" data-dose="-1" aria-label="Less coffee">−</button>
              <output aria-live="polite"><b data-g>${perCup}</b> g coffee</output>
              <button type="button" data-dose="1" aria-label="More coffee">+</button>
            </div>
            ${ratio ? `<small class="ck-ratio-note">Ratio <b>${esc(ratio)}</b>, coffee to water</small>` : ''}`}
        </div>

        <div class="ck-timer"${seconds ? ` data-total="${seconds}"` : ''}>
          <span class="ck-label">Brew along</span>
          ${seconds ? `<div class="ck-dial">
            <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ck-track" cx="60" cy="60" r="${R}"/><circle class="ck-run" cx="60" cy="60" r="${R}" style="stroke-dasharray:${C};stroke-dashoffset:${C}"/></svg>
            <span class="ck-time" aria-live="polite">${clock(seconds)}</span>
          </div>
          <div class="ck-controls">
            <button type="button" class="ck-go" data-timer="go">${icon('play', true)}<span>Watch it brew</span></button>
            <button type="button" class="ck-reset" data-timer="reset" aria-label="Reset timer">${icon('reset')}</button>
          </div>
          <div class="ck-real-wrap">
            <button type="button" class="ck-real" data-timer="real">Brew for real · ${seconds >= 60 ? clock(seconds) : seconds + 's'}</button>
          </div>` : ''}
          <ol class="ck-steps">${steps.map((t, i) => `<li data-step="${i}"><i>${i + 1}</i><span>${esc(t)}</span></li>`).join('')}</ol>
        </div>
      </div>
    </section>` : ''}`;

  /* ---- the cup, the dose and the brew, kept in step ---- */
  const cupviz = details.querySelector('.ck-cupviz');
  const liquid = details.querySelector('.ck-liquid'), grounds = details.querySelector('.ck-grounds');
  const CAP = (isDrip ? 1 : 3.4) * (isDrip ? 200 : perCup * parts);       // what a full cup holds, in ml
  let grams = perCup, progress = 0, drain = 0;
  // what is in the brewer: grounds (step 1) and water (step 2). It starts empty when there is a brew to follow.
  let fillG = details.querySelector('.ck-timer[data-total]') ? 0 : 1, fillW = fillG;
  const target = details.querySelector('.ck-target'), inflow = details.querySelector('.ck-inflow');
  const mlNow = () => (isDrip ? 180 : Math.round(grams * parts));
  const mix = t => {                                                          // water → coffee as it brews
    const a = [244, 226, 205], b = [58, 26, 14], c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c.join(',')})`;
  };
  const paint = () => {
    if (!liquid) return;
    const full = Math.min(.86, Math.max(.12, mlNow() / CAP));            // share of the cup the dose fills
    const level = full * fillW * (1 - drain * .93);                       // grows as water is poured in, drains as it is served
    const top = 196 - level * 150;                                        // cup inside runs from y=196 up to y=46
    const mark = 196 - full * 150;
    liquid.setAttribute('y', top.toFixed(1));
    liquid.style.fill = mix(Math.min(1, .18 + progress * .82));
    const g = (isDrip ? 0 : Math.min(18, 4 + grams * .25)) * fillG;
    grounds.setAttribute('y', (196 - g).toFixed(1)); grounds.setAttribute('height', g.toFixed(1));
    if (target) { target.setAttribute('y1', mark.toFixed(1)); target.setAttribute('y2', mark.toFixed(1)); target.classList.toggle('is-shown', fillW < 1); }
    if (inflow) inflow.setAttribute('d', `M112 -24V${(top - 2).toFixed(1)}`);
    details.querySelectorAll('[data-ml]').forEach(el => { el.textContent = mlNow(); });
    const gEl = details.querySelector('[data-g]'); if (gEl) gEl.textContent = grams;
    details.querySelectorAll('[data-cups]').forEach(b => b.setAttribute('aria-pressed', String(grams === perCup * Number(b.dataset.cups))));
  };
  details.addEventListener('click', e => {
    const d = e.target.closest('[data-dose]'), c = e.target.closest('[data-cups]');
    if (d) grams = Math.max(5, Math.min(perCup * 3 + 15, grams + Number(d.dataset.dose)));
    if (c) grams = perCup * Number(c.dataset.cups);
    if (d || c) paint();
  });

  /* brew steps: before you start, while it brews, and when it is ready */
  const stepEls = [...details.querySelectorAll('.ck-steps li')];
  const stage = (phase, at = 0) => {          // phase: 'idle' | 'prep' (a step before the timer) | 'brewing' | 'done'
    const on = phase === 'idle' ? -1 : phase === 'prep' ? at : phase === 'brewing' ? TIMED : steps.length - 1;
    stepEls.forEach((li, i) => {
      li.classList.toggle('is-on', i === on);
      li.classList.toggle('is-done', phase !== 'idle' && i < on);
    });
    // the drawing follows the steps: empty → grounds in (step 1) → water in (step 2) → brewing
    if (phase === 'idle') { fillG = 0; fillW = 0; }
    else if (phase === 'prep') { fillG = 1; fillW = at >= 1 ? 1 : 0; }
    else { fillG = 1; fillW = 1; }
    cupviz?.classList.toggle('is-adding', phase === 'prep' && at === 0);
    cupviz?.classList.toggle('is-filling', phase === 'prep' && at === 1);
    paint();
    cupviz?.classList.toggle('is-brewing', phase === 'brewing');
    cupviz?.classList.toggle('is-ready', phase === 'done');
  };

  /* serve: once it is ready, the brewer tilts and pours into a cup, then the cup steams */
  const brewer = details.querySelector('.ck-brewer'), stream = details.querySelector('.ck-stream'), serveLiquid = details.querySelector('.ck-serve-liquid');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let pouring = null;
  const setPour = (angle, fill, s0, s1) => {             // s0/s1: the visible stretch of the stream (0–1)
    brewer?.setAttribute('transform', `rotate(${angle.toFixed(2)} 180 60)`);
    if (serveLiquid) { serveLiquid.setAttribute('y', (200 - fill * 38).toFixed(1)); serveLiquid.style.fill = mix(1); }
    if (stream) { stream.style.strokeDasharray = `${Math.max(0, s1 - s0)} 2`; stream.style.strokeDashoffset = -s0; stream.style.opacity = s1 > s0 ? 1 : 0; }
  };
  const resetPour = () => {
    cancelAnimationFrame(pouring); pouring = null; drain = 0;
    cupviz?.classList.remove('is-pouring', 'is-served'); setPour(0, 0, 0, 0);
  };
  const pour = () => {
    if (!brewer || !stream) { stepEls.forEach(li => { li.classList.remove('is-on'); li.classList.add('is-done'); }); return; }
    cupviz.classList.add('is-pouring');
    const finish = () => {
      drain = 1; paint(); setPour(0, 1, 0, 0); pouring = null;
      cupviz.classList.remove('is-pouring'); cupviz.classList.add('is-served');
      stepEls.forEach(li => { li.classList.remove('is-on'); li.classList.add('is-done'); });
    };
    if (still) { finish(); return; }
    const t0 = performance.now(), TILT = 38;
    const step = now => {
      const t = (now - t0) / 1000;                                           // seconds into the pour
      const angle = t < .9 ? ease(clamp((t - .2) / .7)) * TILT : t > 3 ? (1 - ease(clamp((t - 3) / .7))) * TILT : TILT;
      const flow = clamp((t - .9) / 1.9);                                     // how much has been poured
      const head = clamp((t - .75) / .35), tail = clamp((t - 2.75) / .35);  // the stream draws in, then runs off
      drain = flow; paint();
      setPour(angle, ease(flow), tail, head);
      if (t < 3.8) pouring = requestAnimationFrame(step); else finish();
    };
    pouring = requestAnimationFrame(step);
  };

  /* brew timer: counts down the recommended time; the ring and the cup fill as it goes */
  const timer = details.querySelector('.ck-timer[data-total]');
  if (timer) {
    const total = Number(timer.dataset.total), run = timer.querySelector('.ck-run'), out = timer.querySelector('.ck-time');
    const go = timer.querySelector('.ck-go');
    const real = timer.querySelector('.ck-real');
    const PREVIEW = 10;                                   // the whole brew, shown in about 10 seconds
    let left = total, ticking = null, last = 0, speed = 1, prepping = null;
    const draw = () => {
      out.textContent = left > 0 ? clock(Math.ceil(left)) : 'Ready';
      run.style.strokeDashoffset = C * (left / total);
      timer.classList.toggle('is-done', left <= 0);
      progress = 1 - left / total; paint();
    };
    const label = () => (left <= 0 ? 'Watch again' : left < total ? 'Resume' : 'Watch it brew');
    const setGo = running => { go.innerHTML = `${icon(running ? 'pause' : 'play', true)}<span>${running ? 'Pause' : label()}</span>`; };
    const stop = () => { cancelAnimationFrame(ticking); ticking = null; timer.classList.remove('is-running'); setGo(false); };
    const setMode = m => { // '' | 'preview' | 'real'
      timer.dataset.mode = m;
      real.hidden = m !== '';   // hidden while a brew is under way (reset or finishing brings it back)
    };
    const frame = now => {
      left = Math.max(0, Math.min(total, left - Math.max(0, now - last) / 1000 * speed)); last = Math.max(last, now); draw();
      if (left <= 0) { stop(); stage('done'); pour(); setMode(''); return; }
      ticking = requestAnimationFrame(frame);
    };
    timer.addEventListener('click', e => {
      const b = e.target.closest('[data-timer]');
      if (!b) return;
      const cancelPrep = () => { clearTimeout(prepping); prepping = null; };
      if (b.dataset.timer === 'reset') { cancelPrep(); stop(); resetPour(); left = total; draw(); setGo(false); stage('idle'); setMode(''); return; }
      if (prepping) { cancelPrep(); timer.classList.remove('is-running'); setGo(false); stage('idle'); setMode(''); return; }   // stopped before the timer began
      if (ticking) { stop(); return; }                                     // pause either mode
      if (left <= 0 || (b.dataset.timer === 'real' && left < total)) { left = total; resetPour(); }
      const fresh = left === total;
      if (fresh) speed = b.dataset.timer === 'real' ? 1 : Math.max(1, total / PREVIEW);
      timer.classList.add('is-running'); setGo(true); setMode(speed > 1 ? 'preview' : 'real');
      const startClock = () => { prepping = null; last = performance.now(); stage('brewing'); ticking = requestAnimationFrame(frame); };
      if (!fresh) { startClock(); return; }
      // the steps before the timer light up one after another, then the clock starts
      const gap = speed > 1 ? 900 : 700;
      let k = 0;
      const next = () => { if (k < TIMED) { stage('prep', k++); prepping = setTimeout(next, gap); } else startClock(); };
      next();
    });
    draw(); setMode('');
  }
  stage('idle');
  paint();
})();

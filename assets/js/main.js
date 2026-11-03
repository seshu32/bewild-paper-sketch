/* Bewild — shared site behaviour: product cards, cart drawer, nav, carousels */
(() => {
  const PRODUCTS = window.BEWILD_PRODUCTS || [];
  const STORE = 'https://bewild.life';
  // from bewild.life/policies/shipping-policy: free above ₹1,000 within India, otherwise ₹80–500 by weight; delivered in 7–10 days
  const FREE_SHIP = 1000;
  // 5kg packs are delivered only within Hyderabad (pincodes starting 500)
  const HYD_PIN = /^500\d{3}$/;
  const localOnly = p => grams(p.weight) >= 5000;
  const savedPin = () => { try { return localStorage.getItem('bewild-pin') || ''; } catch (e) { return ''; } };
  const seenProducts = (skip = []) => {
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem('bewild-seen') || '[]'); } catch (e) {}
    return families(seen.map(h => PRODUCTS.find(x => x.handle === h)).filter(x => x && !skip.includes(x.handle) && optionsOf(x).some(o => o.available)));
  };
  const pickRow = (pick, lead) => {
    const pv = pick.variants.find(x => x.available) || pick.variants[0];
    return `<div class="basket-pick-row">
      <a href="${pdpUrl(pick)}"><img src="${pick.image}" alt=""></a>
      <div><a href="${pdpUrl(pick)}">${esc(displayName(pick))}${pick.weight ? ` · ${esc(pick.weight)}` : ''}</a><span class="price">${money(pv.price)}</span></div>
      <button class="add-btn" data-add="${pv.id}">${icon.plus}Add</button>
    </div>`;
  };
  // monthly subscription (coffee and 5kg rice): set SUB_SAVE to the % saving once it is decided, e.g. 10
  const SUB_SAVE = null;
  const WA_NUMBER = '919154137599';
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const LEAF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/></svg>';
  const PAY_LINE = 'UPI, cards, netbanking and wallets';
  // what goes well with what (product pages' "Better together" and the basket's suggestions)
  const PAIRS = {
    coffee: ['rosella-herbal-tea', 'green-elaichi'],
    grains: ['pigeon-pea-toor-dal', 'turmeric-powder'],
    spices: ['navara-red-rice-1kg', 'kachampuli'],
    condiments: ['navara-red-rice-1kg', 'black-pepper'],
    combos: ['coffee-blossom-honey', 'green-elaichi'],
  };
  // the basket's row: recently viewed (up to 2), the new honey, then pairings for what is in the basket, then other bestsellers; in stock, not already in, no Hyderabad-only packs
  const basketRecs = items => {
    const inB = new Set(items.map(i => byVariant.get(i.id).p));
    const inFam = new Set([...inB].flatMap(p => siblings(p)));
    const want = [BASKET_PICK, ...[...inB].flatMap(p => PAIRS[p.category] || [])];
    const ok = x => x && optionsOf(x).some(o => o.available) && !inFam.has(x) && !localOnly(x);
    const out = [];
    // returning visitors: up to 2 things they looked at but have not added come first (first-time visitors skip this)
    seenProducts().filter(ok).slice(0, 2).forEach(x => out.push(x));
    want.forEach(h => { const x = PRODUCTS.find(y => y.handle.startsWith(h)); const head = x && families([x]).length ? x : x && PRODUCTS.find(y => isFamilyHead(y) && siblings(y).includes(x)); if (ok(head) && !out.includes(head)) out.push(head); });
    for (const x of families(PRODUCTS)) { if (out.length >= 4) break; if (ok(x) && !out.includes(x) && x.category !== 'combos' && x.category !== 'gifting') out.push(x); }
    return out.slice(0, 4);
  };
  // first-order welcome offer: the code is only shown to people who have signed up (in this browser)
  const WELCOME_CODE = 'WELCOME10';
  const welcomed = () => store.get('bewild-welcome', {}).joined === true;
  const WELCOME_OFF = .10;
  const welcomeOff = total => welcomed() ? Math.round(total * WELCOME_OFF) : 0;   // shown in the basket; Shopify applies the real discount at checkout
  // checks the email / WhatsApp / consent of a sign-up form; returns an error message, or saves the sign-up
  function joinWelcome(form) {
    const email = form.email.value.trim(), phone = form.phone.value.replace(/\D/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return [form.email, 'Please check the email address, it looks incomplete.'];
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return [form.phone, 'Please enter a 10-digit Indian mobile number, or leave it empty.'];
    if (!form.consent.checked) return [form.consent, 'Please tick the box to get your 10% off.'];
    // the same Shopify customer list as the footer signup, tagged so the welcome email can go out
    const fd = new FormData();
    fd.append('form_type', 'customer'); fd.append('utf8', '✓');
    fd.append('contact[email]', email); fd.append('contact[tags]', `newsletter,welcome10${phone ? ',whatsapp' : ''}`);
    if (phone) fd.append('contact[note]', `WhatsApp: +91${phone}`);
    fetch(`${STORE}/contact`, { method: 'POST', body: fd, mode: 'no-cors' }).catch(() => {});
    store.set('bewild-welcome', { joined: true, email, at: Date.now() });
    return null;
  }
  // the offer in the basket: sign up right there, and the 10% is applied — nothing to copy
  let offerOpen = false;
  const offerLine = () => (offerSeq++, welcomed())
    ? `<p class="offer-line is-in">${icon.check}<span><b>10% off applied</b> with your first-order code ${WELCOME_CODE}.</span></p>`
    : `<div class="offer${offerOpen ? ' is-open' : ''}">
        <button type="button" class="offer-line" data-offer-open aria-expanded="${offerOpen}">${LEAF}<span>10% off your first order. <u>Get it now</u></span>${icon.arrow}</button>
        <form class="offer-form" novalidate ${offerOpen ? '' : 'hidden'}>
          <label class="sr-only" for="${'of-e' + offerSeq}">Email address</label>
          <input id="${'of-e' + offerSeq}" name="email" type="email" autocomplete="email" placeholder="Email address" required>
          <div class="welcome-wa"><span>+91</span><label class="sr-only" for="${'of-p' + offerSeq}">WhatsApp number (optional)</label><input id="${'of-p' + offerSeq}" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="WhatsApp (optional)"></div>
          <label class="welcome-consent"><input type="checkbox" name="consent"> <span>I agree to receive occasional updates from Bewild by email and, if given, WhatsApp. I can unsubscribe at any time.</span></label>
          <small class="welcome-msg" aria-live="polite"></small>
          <button class="btn" type="submit">Apply 10% off</button>
        </form>
      </div>`;
  let offerSeq = 0;
  const SHIP_LINE = `Free shipping above ₹1,000 · Delivered in 7–10 days`;
  // back-in-stock requests: set this to the form/email service URL that will store them (POST, JSON { email, product, variant })
  const NOTIFY_ENDPOINT = '';
  const byVariant = new Map();
  PRODUCTS.forEach(p => p.variants.forEach(v => byVariant.set(v.id, { p, v })));

  const CATEGORIES = {
    // the same names as the Shop menu and the collections on bewild.life
    coffee: 'Single Origin Specialty Coffee',
    grains: 'Native Grains, Cereals and Pulses',
    spices: 'Whole(some) Spices',
    condiments: 'Artisan Condiments',
    combos: 'Curated Combos',
    gifting: 'Festive Gift Boxes',
  };
  const ORIGINS = {
    'western-ghats': 'Western Ghats',
    'deccan-plateau': 'Deccan Plateau',
    'central-highlands': 'Central Highlands',
  };

  const icon = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    basket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18l-1.6 9.2a2 2 0 0 1-2 1.8H6.6a2 2 0 0 1-2-1.8L3 9z"/><path d="M8 9l4-6 4 6M9.5 13v3.5M14.5 13v3.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  /* three product detail pages: coffee.html (coffee), combo.html (curated combos), product.html (everything else) */
  const pdpPage = p => p.category === 'coffee' ? 'coffee.html' : (p.category === 'combos' || p.category === 'gifting') ? 'combo.html' : 'product.html';
  const pdpUrl = p => pdpPage(p) + '?p=' + encodeURIComponent(p.handle);
  window.BEWILD_PDP_URL = pdpUrl;
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  // pack sizes the way they are printed on the pack: under 1 kg in grams (0.05 kg → 50g), from 1 kg in kilos (1.0 kg → 1kg)
  const packSize = t => {
    const m = String(t || '').match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
    if (!m) return t;
    const g = parseFloat(m[1]) * (m[2].toLowerCase() === 'kg' ? 1000 : 1);
    return g < 1000 ? `${Math.round(g)}g` : `${+(g / 1000).toFixed(2)}kg`;
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const img = (src, w = 600) => !src ? '' : src.startsWith('http') ? src + (src.includes('?') ? '&' : '?') + 'width=' + w : src;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- storage (best effort) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  /* ---------- product card ---------- */
  // original price (struck through) sits above the selling price
  const priceHTML = (price, compare) =>
    (compare && compare > price ? `<s><span class="sr-only">Was </span>${money(compare)}</s>` : '') +
    (compare && compare > price ? '<span class="sr-only">now </span>' : '') + money(price);
  // what's inside each combo (shown instead of its long description)
  const COMBO_CONTENTS = {
    'red-rice-white-rice': ['Navara Red Rice', 'Indrayani Rice'],
    'millet-mithai': ['Ragi Laddu', 'Bajra Laddu'],
    'the-flour-family': ['Bajra Flour', 'Whole Wheat Flour', 'Sprouted Ragi Mix'],
    'ammas-spice-box': ['Black Pepper', 'Green Cardamom', 'Turmeric Powder'],
    'sweet-spicy-nutty': ['Raw Honey', 'Peanut Butter', 'Tomato Pickle'],
  };
  // gift boxes (gift-boxes.js) carry their own list
  PRODUCTS.forEach(p => { if (p.inside) COMBO_CONTENTS[p.handle] = p.inside; });
  const SHORT_NAMES = { 'Pigeon Pea (Arhar Dal/Toor Dal)': 'Toor Dal (Pigeon Pea)', 'Connected Coffee Drip Bags': 'Connected Drip Bags' };
  function displayName(p) {
    // coffees share one name; the process is what tells them apart
    if (p.process && p.name.startsWith('Canephora')) return p.process;
    const n = p.name.replace(/\s+\d+\s?kg$/i, '');
    return SHORT_NAMES[n] || n;
  }
  function subline(p) {
    if (p.notes) return `${p.name.startsWith('Canephora') ? 'Canephora Robusta · ' : ''}<b>Notes</b> ${esc(p.notes)}`;
    if (COMBO_CONTENTS[p.handle]) return `<b>Inside</b> ${esc(COMBO_CONTENTS[p.handle].join(' + '))}`;
    return esc(p.tagline || p.desc.split('. ')[0]);
  }
  /* sizes: some products are sold as separate Shopify products per size (e.g. Navara 1kg / 5kg).
     Group them by name so each shows as one product with a size choice. */
  const grams = w => { const m = /([\d.]+)\s*(kg|g|ml)/i.exec(w || ''); return m ? parseFloat(m[1]) * (/kg/i.test(m[2]) ? 1000 : 1) : 0; };
  const SIZE_GROUPS = new Map();
  PRODUCTS.forEach(p => {
    if (p.category === 'coffee' || p.category === 'combos' || p.category === 'gifting') return;
    const key = p.category + '|' + displayName(p);
    SIZE_GROUPS.set(key, [...(SIZE_GROUPS.get(key) || []), p]);
  });
  SIZE_GROUPS.forEach(g => g.sort((a, b) => grams(a.weight) - grams(b.weight)));
  const siblings = p => (p.category === 'coffee' || p.category === 'combos' || p.category === 'gifting') ? [p] : SIZE_GROUPS.get(p.category + '|' + displayName(p)) || [p];
  // every buyable option for this product: { id, label, price, available, owner }
  const optionsOf = p => {
    const sib = siblings(p);
    if (sib.length > 1) return sib.flatMap(x => x.variants.map(v => ({ id: v.id, price: v.price, available: v.available, owner: x,
      label: v.title !== 'Default Title' ? v.title : (x.weight || displayName(x)) })));
    return p.variants.map(v => ({ id: v.id, price: v.price, available: v.available, owner: p, label: v.title }));
  };
  // lists show one card per product family (the smallest size)
  const isFamilyHead = p => siblings(p)[0] === p;
  const families = list => list.filter(isFamilyHead);

  let cardSeq = 0;
  function cardHTML(p, i = 0) {
    const opts = optionsOf(p), multi = opts.length > 1;
    const v0 = opts.find(o => o.owner === p && o.available) || opts.find(o => o.available) || opts[0];
    const isRobusta = p.name.startsWith('Canephora');
    const badge = !p.available
      ? '<span class="badge badge--out">Sold out</span>'
      : isRobusta ? `<span class="badge">${esc(p.roast)}</span>`
      : p.process ? `<span class="badge">${esc(p.process)}</span>` : '';
    const save = p.compare && p.compare > p.price
      ? `<span class="stamp"><small>Save</small>${money(p.compare - p.price)}</span>` : '';
    const label = p.process ? 'grind' : 'size';
    const sid = `v-${p.handle}-${++cardSeq}`;   // the same product can sit in two grids on one page
    const select = multi ? `<label class="sr-only" for="${sid}">Choose ${label}</label>
      <select id="${sid}" data-variant-select>${opts.map(o =>
        `<option value="${o.id}" ${o.id === v0.id ? 'selected' : ''} ${o.available ? '' : 'disabled'}>${esc(o.label)}${opts.some(x => x.price !== o.price) ? ' — ' + money(o.price) : ''}${o.available ? '' : ' (sold out)'}</option>`).join('')}</select>`
      // single-option products get a matching pack label, so every card keeps the same rows
      : `<span class="option-chip">${COMBO_CONTENTS[p.handle] ? `${p.category === 'gifting' ? 'Gift box' : 'Combo'} of ${COMBO_CONTENTS[p.handle].length}` : esc(p.weight ? p.weight + ' pack' : 'One size')}</span>`;
    // region only: the pack size already sits in the size box below
    const meta = ORIGINS[p.origin] ? `<span class="o">${ORIGINS[p.origin]}</span>` : `<span class="o">${CATEGORIES[p.category]}</span>`;
    return `<article class="card" style="animation-delay:${Math.min(i, 8) * 45}ms" data-handle="${esc(p.handle)}">
      <a class="card-media" href="${pdpUrl(p)}" aria-label="${esc(displayName(p))}">
        ${badge}${save}
        ${p.art ? `<img class="art" src="${p.art}" alt="" loading="lazy">` : ''}
        <img class="pack" src="${p.image}" alt="" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-meta">${meta}</div>
        <h3 title="${esc(displayName(p))}"><a href="${pdpUrl(p)}">${esc(displayName(p))}</a></h3>
        <p class="card-sub">${subline(p)}</p>
        <div class="card-option">${select}</div>
        <div class="card-foot">
          <span class="price" data-price>${priceHTML(v0.price, p.compare)}</span>
          <button class="add-btn" data-add="${v0.id}" ${p.available ? '' : 'disabled'}>${p.available ? icon.plus + 'Add' : 'Sold out'}</button>
          ${p.available ? `<div class="card-qty" hidden><button type="button" data-cq="-1" aria-label="One less">−</button><span aria-live="polite">0</span><button type="button" data-cq="1" aria-label="One more">+</button></div>` : ''}
        </div>
      </div>
    </article>`;
  }
  function renderGrid(el, list) {
    list = families(list);
    el.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="empty-note">Nothing growing here this season — try another filter.</p>';
    return list.length;
  }

  // variant select + add-to-basket (delegated)
  document.addEventListener('change', e => {
    const sel = e.target.closest('[data-variant-select]');
    if (!sel) return;
    const card = sel.closest('.card');
    const hit = byVariant.get(Number(sel.value));
    const btn = $('[data-add]', card);
    btn.dataset.add = sel.value;
    const pr = $('[data-price]', card);
    if (hit) pr.innerHTML = priceHTML(hit.v.price, hit.p.compare);
    syncCards();
  });
  // product cards: once a product is in the basket its Add button becomes − n +, always matching the basket
  function syncCards() {
    $$('.card').forEach(card => {
      const btn = $('.card-foot [data-add]', card), box = $('.card-qty', card);
      if (!btn || !box) return;
      const line = cart.items.find(i => i.id === Number(btn.dataset.add));
      btn.hidden = !!line; box.hidden = !line;
      if (line) $('span', box).textContent = line.qty;
    });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cq]');
    if (!b) return;
    const id = Number($('[data-add]', b.closest('.card')).dataset.add);
    const line = cart.items.find(i => i.id === id);
    cart.set(id, (line ? line.qty : 0) + Number(b.dataset.cq));
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn || btn.disabled) return;
    cart.add(Number(btn.dataset.add), 1);
    if (btn.closest('.card .card-foot')) return;          // cards switch to − n + instead
    btn.classList.add('is-added');
    btn.innerHTML = icon.check + 'Added';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = icon.plus + 'Add'; }, 1600);
  });

  /* ---------- cart ---------- */
  // the one product suggested in the basket (a new launch); change this handle to feature another
  const BASKET_PICK = 'coffee-blossom-honey';
  const cart = {
    note: store.get('bewild-note', ''),
    items: store.get('bewild-cart', []).filter(i => byVariant.has(i.id)),
    save() { store.set('bewild-cart', this.items); this.render(); },
    add(id, qty) {
      const hit0 = byVariant.get(id);
      // a Hyderabad-only pack needs a checked pincode first: send them to the product page to enter it
      if (hit0 && localOnly(hit0.p) && !HYD_PIN.test(savedPin())) {
        if (!document.getElementById('pdp-pin')) location.href = pdpUrl(hit0.p) + '#pdp-pin';
        return;
      }
      const line = this.items.find(i => i.id === id);
      line ? line.qty += qty : this.items.push({ id, qty });
      this.save();
      const hit = byVariant.get(id);
      toast(`${displayName(hit.p)} added to your basket`);
    },
    set(id, qty) {
      this.items = qty > 0 ? this.items.map(i => i.id === id ? { id, qty } : i) : this.items.filter(i => i.id !== id);
      this.save();
    },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + byVariant.get(i.id).v.price * i.qty, 0); },
    // the shelf price before the saving (only where the store lists one for this exact pack)
    was(p, v) { return p.compare && p.compare > v.price && v.price === p.price ? p.compare : 0; },
    saved() { return this.items.reduce((s, i) => { const { p, v } = byVariant.get(i.id), w = this.was(p, v); return s + (w ? (w - v.price) * i.qty : 0); }, 0); },
    // Shopify cart permalink; a note rides along as ?note= and shows in the order's Notes
    // stand-in: Shopify's cart link. On the live theme, Checkout must start Razorpay Magic Checkout (its script, from Razorpay's Shopify app)
    checkoutUrl() {
      const note = this.note.trim(), q = [];
      if (welcomed()) q.push(`discount=${WELCOME_CODE}`);            // Shopify applies it at checkout
      if (note) q.push(`note=${encodeURIComponent(note)}`);
      return `${STORE}/cart/${this.items.map(i => `${i.id}:${i.qty}`).join(',')}${q.length ? '?' + q.join('&') : ''}`;
    },
    render() {
      $$('.cart-count').forEach(el => { el.textContent = this.count(); });
      document.dispatchEvent(new CustomEvent('bewild:cart'));
      syncCards();
      const body = $('#drawer-body');
      if (!body) return;
      if (!this.items.length) {
        // empty: what they were looking at, and the newest harvest
        const honey = PRODUCTS.find(x => x.handle.startsWith(BASKET_PICK) && x.available);
        const seen = seenProducts(honey ? [honey.handle] : []).slice(0, 3);
        body.innerHTML = `<div class="drawer-items drawer-empty-list">
          <div class="drawer-empty">
            <img src="assets/img/bird.png" alt="">
            <p>Your basket is empty —<br>the forest is waiting.</p>
            <a class="btn btn--sm" href="shop.html">Shop the harvest ${icon.arrow}</a></div>
          ${seen.length ? `<div class="basket-pick"><span class="basket-pick-lead">Recently viewed</span>${seen.map(x => pickRow(x)).join('')}</div>` : ''}
          ${honey ? `<div class="basket-pick"><span class="basket-pick-lead">New this season</span>${pickRow(honey)}</div>` : ''}
        </div>`;
        return;
      }
      body.innerHTML = `<div class="drawer-items">${offerLine()}${this.items.map(({ id, qty }) => {
        const { p, v } = byVariant.get(id);
        return `<div class="line">
          <img src="${p.image}" alt="">
          <div><h4>${esc(displayName(p))}</h4>
            <small>${esc([p.weight, v.title !== 'Default Title' ? v.title : ''].filter(Boolean).join(' · '))}</small>
            <div class="qty"><button data-qty="${id}" data-d="-1" aria-label="Decrease">−</button><span>${qty}</span><button data-qty="${id}" data-d="1" aria-label="Increase">+</button></div></div>
          <div><span class="price">${this.was(p, v) ? `<s><span class="sr-only">Was </span>${money(this.was(p, v) * qty)}</s>` : ''}${money(v.price * qty)}</span><button class="rm" data-rm="${id}">Remove</button></div>
        </div>`;
      }).join('')}
      ${(() => {   // a combo and one of its own products both in the basket: say so, gently, once
        const inBasket = this.items.map(i => byVariant.get(i.id).p);
        const dup = inBasket.filter(x => COMBO_CONTENTS[x.handle]).map(c => ({ c, parts: inBasket.filter(x => x.category !== 'combos' && COMBO_CONTENTS[c.handle].some(n => displayName(x).includes(n))) })).find(d => d.parts.length);
        if (!dup) return '';
        const names = dup.parts.map(displayName), list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
        return `<p class="basket-dup">${esc(displayName(dup.c))} already includes ${esc(list)}. Keep ${names.length > 1 ? 'them' : 'it'} if you want extra.</p>`;
      })()}
      ${this.saved() ? `<div class="basket-saved"><span>You save</span><span>${money(this.saved())}</span></div>` : ''}
      ${(() => { const left = FREE_SHIP - this.total(); return `<div class="ship-meter${left <= 0 ? ' is-free' : ''}">
        <span>${left > 0 ? `Add <b>${money(left)}</b> more for free shipping` : 'Your order ships free'}</span>
        <i style="--p:${Math.min(1, this.total() / FREE_SHIP)}"></i></div>`; })()}
      ${(() => {   // goes well with what is in the basket: one swipeable row, seen before checkout
        const recs = basketRecs(this.items);
        if (!recs.length) return '';
        return `<div class="basket-recs"><span class="basket-pick-lead">Goes well with your basket</span>
          <ul class="basket-recs-row">${recs.map(x => { const o = optionsOf(x).find(o => o.available); return `<li>
            <a href="${pdpUrl(x)}"><img src="${x.image}" alt="" loading="lazy"><b>${esc(displayName(x))}</b></a>
            <span class="price">${money(o.price)}</span>
            <button class="add-btn" data-add="${o.id}" aria-label="Add ${esc(displayName(x))}">${icon.plus}Add</button></li>`; }).join('')}</ul></div>`;
      })()}
        <div class="basket-note${this.note ? ' is-open' : ''}">
          <button type="button" class="basket-note-toggle" data-note-toggle aria-expanded="${this.note ? 'true' : 'false'}">${this.note ? 'Note for us' : '+ Add a note for us'} <small>(gift message, delivery instructions)</small></button>
          <label class="sr-only" for="basket-note">Note for us</label>
          <textarea id="basket-note" maxlength="500" rows="2" placeholder="E.g. a gift message, or “please leave with security”" data-note>${esc(this.note)}</textarea>
          <small class="basket-note-count" aria-live="polite">${this.note.length} / 500</small>
        </div>
      <div class="drawer-foot">
        ${welcomeOff(this.total()) ? `<div class="basket-saved"><span>First-order discount (${WELCOME_CODE})</span><span>− ${money(welcomeOff(this.total()))}</span></div>` : ''}
        <div class="subtotal"><span>${welcomed() ? 'Total' : 'Subtotal'}</span><span class="price">${money(this.total() - welcomeOff(this.total()))}</span></div>
        <a class="btn" data-checkout href="${this.checkoutUrl()}">Checkout ${icon.arrow}</a>
        <small>${LOCK}Secured by Razorpay · ${PAY_LINE}</small>
        <a class="drawer-faq" href="faq.html#general">Shipping, cancellations &amp; refunds</a>
      </div></div>`;   // subtotal and checkout come last, after the suggestions and the note
    },
  };

  /* ---------- welcome offer: 10% off the first order for an email (lead generation) ----------
     Opens once on the home page (after ~5s or a little scrolling), and from any "Get your code" link. */
  function welcome() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="welcome" id="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title" hidden>
        <div class="welcome-card">
          <button type="button" class="welcome-x" data-welcome-close aria-label="Close">${icon.close}</button>
          <img class="welcome-bird" src="assets/img/leaf.png" alt="" aria-hidden="true">
          <div class="welcome-body">
            <span class="kicker">A welcome note from Bewild</span>
            <h2 id="welcome-title">10% off your first <em>Bewild order.</em></h2>
            <p class="welcome-lead">Tell us where to send your first-order coupon.</p>
            <p class="welcome-row"><span>First order coupon</span><b>10% off</b></p>
            <form class="welcome-form" novalidate>
              <label for="welcome-email">Email address <small>Required</small></label>
              <input id="welcome-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
              <label for="welcome-wa">WhatsApp number <small>Optional</small></label>
              <div class="welcome-wa"><span>+91</span><input id="welcome-wa" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="10-digit mobile number"></div>
              <label class="welcome-consent"><input type="checkbox" name="consent"> <span>I agree to receive my coupon and occasional updates from Bewild by email and, if provided, WhatsApp. I can unsubscribe at any time.</span></label>
              <small class="welcome-msg" aria-live="polite"></small>
              <button class="btn" type="submit">Send my 10% off coupon ${icon.arrow}</button>
              <button type="button" class="welcome-later" data-welcome-close>Maybe later</button>
            </form>
          </div>
          <div class="welcome-done" hidden>
            <span class="kicker">You are in</span>
            <h2>Your 10% off is <em>ready.</em></h2>
            <p class="welcome-applied">${icon.check}<span>It is already added to your basket and applied at checkout. <b>Nothing to copy or enter.</b></span></p>
            <p class="welcome-lead">We have also sent your code (${WELCOME_CODE}) to <b class="welcome-to"></b>, in case you shop from another device.</p>
            <button type="button" class="btn" data-welcome-close>Start shopping ${icon.arrow}</button>
          </div>
        </div>
      </div>`);
    const box = $('#welcome'), form = $('.welcome-form', box), msg = $('.welcome-msg', box);
    let opener = null;
    const busy = () => !!$('#drawer.is-open') || !!$('#search:not([hidden])') || !!$('#viewer:not([hidden])');
    const showDone = () => {
      $('.welcome-body', box).hidden = true; $('.welcome-done', box).hidden = false;
      $('.welcome-to', box).textContent = store.get('bewild-welcome', {}).email || 'your inbox';
    };
    const open = force => {
      if (!box.hidden) return;
      if (!force && (welcomed() || busy())) return;
      opener = document.activeElement;
      if (welcomed()) showDone();
      box.hidden = false; document.documentElement.classList.add('welcome-open');
      setTimeout(() => $(welcomed() ? '.welcome-done .btn' : '#welcome-email', box)?.focus(), 60);
    };
    const close = () => {
      box.hidden = true; document.documentElement.classList.remove('welcome-open');
      if (!welcomed()) store.set('bewild-welcome', { ...store.get('bewild-welcome', {}), later: Date.now() });   // rests for 7 days
      if (opener && opener !== document.body && opener.isConnected) opener.focus();
    };
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('[data-welcome-close]')) close(); });
    document.addEventListener('click', e => { if (e.target.closest('[data-welcome]')) { e.preventDefault(); openCart(false); open(true); } });
    document.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {      // keep Tab inside the card
        const f = $$('input, button, a[href]', box).filter(x => x.offsetParent !== null), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const err = joinWelcome(form);
      if (err) { msg.textContent = err[1]; form.classList.add('is-error'); err[0].focus(); return; }
      form.classList.remove('is-error'); msg.textContent = '';
      showDone(); $('.welcome-done .btn', box).focus();
      cart.render();                       // the basket now shows the code and carries it to checkout
    });
    // home page: once per visitor, after ~5 seconds or a little scrolling, never over the basket, search or photo viewer
    const page = location.pathname.split('/').pop() || 'index.html';
    const st = store.get('bewild-welcome', {});
    if (page !== 'index.html' || st.joined || (st.later && Date.now() - st.later < 7 * 864e5)) return;
    let fired = false;
    const onScroll = () => { if (scrollY > innerHeight * .5) fire(); };
    function fire() {
      if (fired) return;
      if (busy()) { setTimeout(fire, 4000); return; }
      fired = true; removeEventListener('scroll', onScroll); open(false);
    }
    setTimeout(fire, 5000);
    addEventListener('scroll', onScroll, { passive: true });
  }

  document.addEventListener('click', e => {
    const o = e.target.closest('[data-offer-open]'); if (!o) return;
    offerOpen = !offerOpen;
    const box = o.closest('.offer'), f = box.querySelector('.offer-form');
    box.classList.toggle('is-open', offerOpen); o.setAttribute('aria-expanded', String(offerOpen)); f.hidden = !offerOpen;
    if (offerOpen) f.email.focus();
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest('.offer-form'); if (!f) return;
    e.preventDefault();
    const err = joinWelcome(f), msg = f.querySelector('.welcome-msg');
    if (err) { msg.textContent = err[1]; f.classList.add('is-error'); err[0].focus(); return; }
    offerOpen = false;
    cart.render();
    toast('10% off applied to your basket');
  });

  function buildChrome() {
    document.body.insertAdjacentHTML('beforeend', `
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true" inert>
        <div class="paper">
          <div class="drawer-head"><h2 id="drawer-title">Your basket</h2>
            <button class="round-btn" data-close-cart aria-label="Close basket">${icon.close}</button></div>
          <div id="drawer-body" style="display:flex;flex-direction:column;flex:1;min-height:0"></div>
        </div>
      </aside>
      <div class="drawer-backdrop" data-close-cart></div>
      <a class="wa" href="https://wa.me/919154137599" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>
      </a>
      <div class="toast" role="status" aria-live="polite"></div>`);
  }

  // the basket is a dialog: focus moves in, Tab stays inside, Esc closes, focus returns to where it was
  let cartOpener = null;
  function openCart(open) {
    const d = $('#drawer');
    if (open === d.classList.contains('is-open')) return;
    d.classList.toggle('is-open', open);
    d.setAttribute('aria-hidden', String(!open));
    d.inert = !open;
    $('.drawer-backdrop').classList.toggle('is-open', open);
    if (open) { cartOpener = document.activeElement; $('[data-close-cart]', d).focus(); }
    else if (cartOpener && cartOpener.isConnected) { cartOpener.focus(); cartOpener = null; }
  }
  document.addEventListener('keydown', e => {
    const d = $('#drawer');
    if (e.key !== 'Tab' || !d || !d.classList.contains('is-open')) return;
    const f = $$('a[href], button:not([disabled]), textarea, input, select', d).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !d.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !d.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(true); }
    else if (e.target.closest('[data-close-cart]')) openCart(false);
    const q = e.target.closest('[data-qty]');
    if (q) { const id = Number(q.dataset.qty); const l = cart.items.find(i => i.id === id); cart.set(id, l.qty + Number(q.dataset.d)); }
    const nt = e.target.closest('[data-note-toggle]');
    if (nt) { const box = nt.parentElement; const open = box.classList.toggle('is-open'); nt.setAttribute('aria-expanded', String(open)); if (open) { const ta = box.querySelector('textarea'); ta.focus({ preventScroll: true }); const list = box.closest('.drawer-items'); if (list) list.scrollTop = list.scrollHeight; } }
    const rm = e.target.closest('[data-rm]');
    if (rm) cart.set(Number(rm.dataset.rm), 0);
    const mb = e.target.closest('.menu-btn');
    if (mb) { const nav = $('.nav'); const open = nav.classList.toggle('is-open'); mb.setAttribute('aria-expanded', String(open)); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });
  // the basket note is kept as they type and carried into the checkout link
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-note]')) return;
    cart.note = e.target.value; store.set('bewild-note', cart.note);
    const n = e.target.parentElement.querySelector('.basket-note-count'); if (n) { n.textContent = `${cart.note.length} / 500`; n.classList.toggle('is-near', cart.note.length > 450); }
    $$('[data-checkout]').forEach(co => { co.href = cart.checkoutUrl(); });
  });

  // back in stock: keep the request and send it on when NOTIFY_ENDPOINT is set
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-notify]'); if (!f) return;
    e.preventDefault();
    const input = f.querySelector('input[type=email]'), msg = f.querySelector('.notify-msg'), email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Please check the email address, it looks incomplete.'; f.classList.add('is-error'); input.focus(); return; }
    const hit = byVariant.get(Number(f.dataset.notify)), req = { email, product: hit ? displayName(hit.p) : '', variant: Number(f.dataset.notify), at: new Date().toISOString() };
    store.set('bewild-notify', [...store.get('bewild-notify', []), req]);
    if (NOTIFY_ENDPOINT) fetch(NOTIFY_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) }).catch(() => {});
    f.classList.remove('is-error'); f.classList.add('is-done');
    msg.textContent = `Thank you. We will email ${email} as soon as it is back.`;
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('.pdp-readmore'); if (!b) return;
    const more = b.previousElementSibling, open = more.hidden;
    more.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Read less' : 'Read more';
  });

  let toastT;
  function toast(msg) {
    const t = $('.toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  /* ---------- search: a box under the header that finds products as you type ---------- */
  const fold = t => String(t || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]+/g, ' ');   // plain lower-case words
  const searchIndex = () => families(PRODUCTS).map(p => ({ p, fields: [
    [5, displayName(p) + ' ' + p.name],
    [3, (CATEGORIES[p.category] || '') + ' ' + (ORIGINS[p.origin] || '') + ' ' + (COMBO_CONTENTS[p.handle] || []).join(' ')],
    [2, [p.tagline, p.process, p.roast, ...(p.flavours || [])].join(' ')],
    [1, (p.insights || []).map(([, v]) => v).join(' ')],
  ].map(([w, t]) => [w, fold(t)]) }));
  let index;
  function findProducts(q) {
    const words = fold(q).split(/[^a-z0-9]+/).filter(w => w.length > 1);
    if (!words.length) return [];
    index = index || searchIndex();
    return index.map(({ p, fields }) => {
      let score = 0;
      for (const w of words) {
        const hit = fields.reduce((best, [wt, t]) => Math.max(best, (' ' + t).includes(' ' + w) ? wt : 0), 0);   // matches the start of a word
        if (!hit) return null;                       // every word has to match somewhere
        score += hit + ((' ' + fold(CATEGORIES[p.category])).includes(' ' + w) ? 1 : 0);   // "coffee" puts the coffees first
      }
      return { p, score: score + (optionsOf(p).some(o => o.available) ? .5 : 0) };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 6).map(r => r.p);
  }
  function buildSearch() {
    const nav = $('.nav'), cartBtn = $('.nav .cart-btn');
    if (!nav || !cartBtn) return;
    cartBtn.insertAdjacentHTML('beforebegin', `<button class="search-btn" type="button" data-open-search aria-label="Search products" aria-expanded="false" aria-controls="search">${icon.search}</button>`);
    document.body.insertAdjacentHTML('beforeend', `
      <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search products" hidden>
        <div class="search-panel">
          <div class="search-field">${icon.search}
            <label class="sr-only" for="search-q">Search products</label>
            <input id="search-q" type="search" autocomplete="off" placeholder="Search coffee, rice, honey, spices…" aria-controls="search-results">
            <button class="search-close" type="button" data-close-search aria-label="Close search">${icon.close}</button>
          </div>
          <div class="search-results" id="search-results" aria-live="polite"></div>
        </div>
        <div class="search-backdrop" data-close-search></div>
      </div>`);
    const box = $('#search'), input = $('#search-q'), out = $('#search-results'), btn = $('[data-open-search]');
    const SUGGEST = ['Coffee', 'Rice', 'Honey', 'Millet', 'Pepper', 'Combos'];
    const draw = () => {
      const q = input.value.trim();
      if (!q) {
        out.innerHTML = `<p class="search-hint">Try</p><div class="search-try">${SUGGEST.map(t => `<button type="button" data-try="${t}">${t}</button>`).join('')}</div>`;
        return;
      }
      const found = findProducts(q);
      out.innerHTML = found.length ? `<ul>${found.map(p => {
        const opts = optionsOf(p), v = opts.find(o => o.available) || opts[0], many = new Set(opts.map(o => o.price)).size > 1;
        return `<li><a href="${pdpUrl(p)}"><img src="${p.image}" alt="" loading="lazy">
            <span><b>${esc(displayName(p))}</b><small>${esc([p.category === 'coffee' && p.roast ? p.roast : CATEGORIES[p.category], ORIGINS[p.origin]].filter(Boolean).join(' · '))}</small></span>
            <span class="price">${many ? '<small>from</small> ' : ''}${money(Math.min(...opts.map(o => o.price)))}</span></a>
          ${v.available ? `<button class="add-btn" data-add="${v.id}" aria-label="Add ${esc(displayName(p))} to basket">${icon.plus}Add</button>` : '<span class="search-out">Sold out</span>'}</li>`;
      }).join('')}</ul>`
        : `<p class="search-none">Nothing matches “${esc(q)}”. Try a simpler word, or <a href="shop.html">browse the whole harvest</a>.</p>`;
    };
    let opener = null;
    const open = on => {
      if (on === !box.hidden) return;
      box.hidden = !on; btn.setAttribute('aria-expanded', String(on));
      document.documentElement.classList.toggle('search-open', on);
      if (on) { opener = document.activeElement; draw(); input.focus(); input.select(); }
      else if (opener && opener.isConnected) opener.focus();
    };
    input.addEventListener('input', draw);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const a = $('.search-results a', box); if (a) location.href = a.href; }
      if (e.key === 'ArrowDown') { const a = $('.search-results a', box); if (a) { e.preventDefault(); a.focus(); } }
    });
    box.addEventListener('keydown', e => {
      const links = $$('.search-results a', box), i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i > -1) { e.preventDefault(); (links[i + 1] || links[i]).focus(); }
      if (e.key === 'ArrowUp' && i > -1) { e.preventDefault(); i ? links[i - 1].focus() : input.focus(); }
      if (e.key === 'Tab') {               // keep Tab inside the search box
        const f = $$('input, a[href], button', $('.search-panel', box));
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-search]')) open(true);
      else if (e.target.closest('[data-close-search]')) open(false);
      const t = e.target.closest('[data-try]'); if (t) { input.value = t.dataset.try; draw(); input.focus(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !box.hidden) { open(false); return; }
      // "/" opens search from anywhere except while typing
      if (e.key === '/' && box.hidden && !e.target.closest('input, textarea, select, [contenteditable]')) { e.preventDefault(); open(true); }
    });
  }

  /* ---------- honey jar: a small Coffee Blossom Honey jar above the WhatsApp button, with one bee circling it ---------- */
  // only on browsing pages; it hides once the honey is in the basket, if it sells out, or when closed for this visit
  function honeyPeek() {
    const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
    if (!['index', 'shop', 'recipes', 'recipe', 'blog', 'post', 'our-story'].includes(page)) return;
    const p = PRODUCTS.find(x => x.handle.startsWith(BASKET_PICK));
    const v = p && p.variants.find(x => x.available);
    if (!v) return;
    try { if (sessionStorage.getItem('bewild-honey-closed')) return; } catch (e) {}
    document.body.insertAdjacentHTML('beforeend', `
      <div class="honey" id="honey" hidden>
        <div class="honey-card" id="honey-card" role="group" aria-label="${esc(displayName(p))}">
          <button class="honey-x" type="button" data-honey-close aria-label="Hide the honey">${icon.close}</button>
          <span class="kicker">${esc(p.tagline.split(' · ')[0])}</span>
          <b>${esc(displayName(p))}</b>
          <small>${esc(p.weight || '')}${p.weight ? ' · ' : ''}${money(v.price)}</small>
          <div class="honey-actions">
            <button class="add-btn" data-add="${v.id}">${icon.plus}Add</button>
            <a class="link-arrow" href="${pdpUrl(p)}">View</a>
          </div>
        </div>
        <button class="honey-jar" type="button" aria-expanded="false" aria-controls="honey-card" aria-label="${esc(displayName(p))}, ${money(v.price)}">
          <img src="assets/img/honey-jar.webp" alt="" width="200" height="284">
          <svg class="honey-bee" viewBox="0 0 28 22" aria-hidden="true">
            <g class="honey-wings"><ellipse cx="11" cy="6" rx="5" ry="6.5" fill="#fff8ee" fill-opacity=".85" stroke="#781d10" stroke-width="1"/><ellipse cx="17" cy="6.5" rx="4.2" ry="5.6" fill="#fff8ee" fill-opacity=".85" stroke="#781d10" stroke-width="1"/></g>
            <ellipse cx="14" cy="14" rx="9" ry="6" fill="#e9a72c" stroke="#3b2e27" stroke-width="1.2"/>
            <path d="M11 8.6v10.8M15 8.2v11.6M19 9.2v9.6" stroke="#3b2e27" stroke-width="2"/>
            <circle cx="23" cy="13" r="3" fill="#3b2e27"/>
          </svg>
        </button>
      </div>`);
    const box = $('#honey'), jar = $('.honey-jar', box);
    const inBasket = () => cart.items.some(i => byVariant.get(i.id)?.p === p);
    let scrolled = false;
    const sync = () => {
      const show = scrolled && !inBasket();
      box.hidden = !show;
      if (!show) setCard(false);
    };
    const setCard = on => { box.classList.toggle('is-open', on); jar.setAttribute('aria-expanded', String(on)); };
    const onScroll = () => { if (!scrolled && scrollY > innerHeight * .6) { scrolled = true; sync(); } };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    document.addEventListener('bewild:cart', sync);
    jar.addEventListener('click', () => setCard(!box.classList.contains('is-open')));
    box.addEventListener('click', e => {
      if (!e.target.closest('[data-honey-close]')) return;
      try { sessionStorage.setItem('bewild-honey-closed', '1'); } catch (err) {}
      box.remove();
    });
    document.addEventListener('click', e => { if (!box.contains(e.target)) setCard(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('is-open')) { setCard(false); jar.focus(); } });
  }

  /* ---------- story of our produce: tap (or Enter) fades a card to its photo; hover does it on a desktop ---------- */
  function flips() {
    const list = $('.flips');
    if (!list) return;
    const turn = card => { $$('.flip.is-turned', list).forEach(c => c !== card && c.classList.remove('is-turned')); card.classList.toggle('is-turned'); };
    list.addEventListener('click', e => { const c = e.target.closest('.flip'); if (c && !matchMedia('(hover: hover)').matches) turn(c); });
    list.addEventListener('keydown', e => { const c = e.target.closest('.flip'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); turn(c); } });
  }

  /* ---------- carousels ---------- */
  function strips() {
    $$('[data-strip]').forEach(wrap => {
      const track = $('.strip, .grid--row', wrap.closest('.chapter'));
      const range = $('[data-step-range]', wrap);
      if (range) {
        // "Steps 1–4 of 12": which cards are fully in view
        const update = () => {
          const box = track.getBoundingClientRect();
          const seen = [...track.children].map((c, i) => [c.getBoundingClientRect(), i + 1])
            .filter(([r]) => r.left >= box.left - 4 && r.right <= box.right + 4).map(([, n]) => n);
          const page = [...track.children].find(c => c.dataset.range && Math.abs(c.getBoundingClientRect().left - box.left) < c.offsetWidth / 2);
          if (page) range.textContent = page.dataset.range;   // a page of cards says which steps it holds
          else if (seen.length) range.textContent = seen.length > 1 ? `${seen[0]}–${seen[seen.length - 1]}` : `${seen[0]}`;
        };
        track.addEventListener('scroll', update, { passive: true });
        addEventListener('resize', update);
        update();
      }
      // paged strips (data-page) move a whole screenful at a time and grey out an arrow at either end
      const paged = track.hasAttribute('data-page');
      const dirs = $$('[data-dir]', wrap);
      dirs.forEach(b => b.addEventListener('click', () =>
        track.scrollBy({ left: Number(b.dataset.dir) * (paged ? track.clientWidth + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth * .8), behavior: 'smooth' })));
      if (paged) {
        const ends = () => dirs.forEach(b => { b.disabled = Number(b.dataset.dir) < 0 ? track.scrollLeft <= 2 : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; });
        track.addEventListener('scroll', ends, { passive: true }); addEventListener('resize', ends); ends();
      }
    });
  }

  /* ---------- page: home ---------- */
  function home() {
    const grid = $('#produce-grid');
    if (!grid) return;
    const seen = seenProducts().slice(0, 4);
    if (seen.length) {
      $('#harvest').insertAdjacentHTML('beforebegin', `<section class="chapter" id="seen">
        <div class="chapter-head"><div><span class="kicker">Recently viewed</span><h2>Pick up <em>where you left off</em></h2></div></div>
        <div class="grid grid--row" id="seen-grid"></div></section>`);
      renderGrid($('#seen-grid'), seen);
    }
    const tabs = $$('#produce-tabs .tab');
    const show = cat => {
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.cat === cat)));
      const list = PRODUCTS.filter(p => p.category === cat).sort((a, b) => b.available - a.available).slice(0, 8);
      renderGrid(grid, list);
      $('#produce-all').href = `shop.html?cat=${cat}`;
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.cat)));
    show('coffee');
    renderGrid($('#combo-grid'), PRODUCTS.filter(p => p.category === 'combos'));
    originShop();
    recipeBox();
    journey();
  }

  /* ---------- recipe box: details come from the recipes on bewild.life/blogs/recipes ---------- */
  const RECIPE_IMG = 'https://bewild.life/cdn/shop/articles/';
  const RECIPES = [
    { title: 'Peanut Butter + Chilli Crisp Noodles', type: 'Weeknight noodles', product: 'peanut-butter-crunchy-250g',
      img: 'b58951a4-6308-49de-bce8-bd0517d75afc_a67d1cca-0508-4b34-a234-ee7fcfb463a7.png?v=1780048184',
      url: 'peanut-butter-chilli-crisp-noodles', meta: ['10 ingredients', '8 steps'],
      text: 'Hot groundnut oil poured over peanut butter, garlic and chilli oil, then tossed with noodles, edamame and crunchy peppers.' },
    { title: 'Sprouted Ragi Pancakes', type: 'Gluten-free breakfast', product: 'sprouted-ragi-mix',
      img: 'WhatsApp_Image_2026-05-29_at_11.33.38_AM_2_c9e887fb-24f8-41dd-b38f-486789a592cc.jpg?v=1780048562',
      url: 'sprouted-ragi-pancakes-gluten-free-breakfast', meta: ['Prep 5 min', 'Cook 10–12 min', 'Serves 2'],
      text: 'Sprouted ragi, ripe banana and a pinch of cardamom, cooked golden for two to three minutes a side.' },
    { title: 'Mango Toor Dal', type: 'Everyday dal', product: 'pigeon-pea-toor-dal',
      img: 'mangodal1.webp?v=1780048456',
      url: 'mango-toor-dal-tangy-mango-dal', meta: ['8 ingredients', 'Cook 30 min'],
      text: 'Toor dal simmered with ripe mango, turmeric and curry leaves, finished with a cumin tempering.' },
    { title: 'Navara Rice Kanji', type: 'Comfort porridge', product: 'navara-red-rice-1kg',
      img: 'WhatsApp_Image_2026-05-29_at_2.43.23_PM_719a2df4-893c-405f-a02a-17d699090e6a.jpg?v=1780047998',
      url: 'navara-rice-kanji', meta: ['11 ingredients', 'Soak 2 hrs'],
      text: 'Navara red rice and green moong cooked soft with ginger, peppercorns, green chillies and curry leaves.' },
    { title: 'Rosella Spritzer', type: 'Cooler', product: 'rosella-herbal-tea',
      img: 'rosella_spritzer_dbc2e599-70e7-41cf-9b7c-13e8e15d70c9.png?v=1780048314',
      url: 'rosella-spritzer', meta: ['Steep 4 min', 'Shaken'],
      text: 'Rosella petals steeped and shaken with pineapple juice into a sparkling, ruby-red drink.' },
    { title: 'Mysore Mallige Idli', type: 'South Indian breakfast', product: 'mysore-mallige-rice',
      img: 'WhatsApp_Image_2026-05-29_at_2.20.48_PM_7bad1f4a-af59-43ec-b7b2-3e3df0ecfce9.jpg?v=1780048150',
      url: 'mysore-mallige-idli', meta: ['8 ingredients', 'Ferment 8–12 hrs'],
      text: 'Soft, fragrant idlis from Mysore Mallige rice, urad dal and poha, steamed after an overnight ferment.' },
  ];
  function recipeBox() {
    const strip = $('#recipe-strip');
    if (!strip) return;
    const prod = r => PRODUCTS.find(p => p.handle.startsWith(r.product));
    strip.innerHTML = RECIPES.map(r => {
      const p = prod(r);
      return `<li class="rc">
        <div class="rc-photo">
          <img src="${RECIPE_IMG + r.img}&width=700" alt="" loading="lazy">
          <span class="rc-tag">${esc(r.type)}</span>
          ${p ? `<a class="rc-made" href="${pdpUrl(p)}" aria-label="Made with Bewild ${esc(displayName(p))}"><img src="${p.image}" alt=""><span>Made with ${esc(displayName(p).replace(/\s*\(.*\)$/, ''))}</span></a>` : ''}
        </div>
        <h3><a class="rc-main" href="recipe.html?r=${encodeURIComponent(r.url)}">${esc(r.title)}</a></h3>
        <span class="rc-meta">${r.meta.map(esc).join(' · ')}</span>
      </li>`;
    }).join('');
  }

  /* ---------- our journey: events as postcards, filterable by year ---------- */
  const EVENT_IMG = 'https://bewild.life/cdn/shop/files/';
  const EVENTS = [
    { m: 'Oct', y: 2025, type: 'Festive market', title: 'Diwali Mela, Stonehill International School', place: 'Bengaluru', city: 'Bengaluru', img: '12ab946f-018e-422e-99a8-a8dfd350e43e_600x.jpg?v=1764142609' },
    { m: 'Sep', y: 2025, type: 'Members meet', title: 'Mumbai Members Meet', place: 'The Mumbai Collective', city: 'Mumbai', img: 'Mumbai_Member_Meet_600x.png?v=1764047108' },
    { m: 'Sep', y: 2025, type: 'Community event', title: 'Friends of the Farmer', place: 'Bengaluru', city: 'Bengaluru', img: 'Mavericks_2025_600x.jpg?v=1764142746' },
    { m: 'May', y: 2025, type: 'Coffee tasting', title: 'Community Coffee Tasting', place: 'The Poomaale Collective', city: 'Coorg', img: 'Community_Cupping_Poomaale_600x.jpg?v=1764047219' },
    { m: 'May', y: 2025, type: 'Workshop', title: 'Summer Salad Workshop', place: 'Bengaluru', city: 'Bengaluru', img: 'Summer_Salad_Workshop_600x.jpg?v=1764047036' },
    { m: 'May', y: 2025, type: 'Farmers’ market', title: 'The Farmers’ Market', place: 'Mumbai', city: 'Mumbai', img: 'IMG-20250504-WA0011_600x.jpg?v=1764143086' },
    { m: 'Apr', y: 2025, type: 'Coffee festival', title: 'India International Coffee Festival', place: 'Bengaluru', city: 'Bengaluru', img: 'IICF_2025_600x.jpg?v=1764047076' },
    { m: 'Dec', y: 2024, type: 'Coffee tasting', title: 'Coffee Experience', place: 'The Hyderabad Collective', city: 'Hyderabad', img: 'Coffee_Experience_Hyd_600x.jpg?v=1764143255' },
    { m: 'Sep', y: 2024, type: 'Coffee meetup', title: 'Coffee Meetup at Nerlu', place: 'Bengaluru', city: 'Bengaluru', img: 'Coffee_Meetup_at_Nerlu_Cafe_600x.jpg?v=1764046982' },
    { m: 'Sep', y: 2023, type: 'Conference', title: 'World Coffee Conference', place: 'Bengaluru', city: 'Bengaluru', img: 'WCC_2023_600x.jpg?v=1764143538' },
  ];
  const pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function journey() {
    const tabs = $('#journey-tabs'), card = $('#event-card'), photo = $('#event-photo');
    if (!tabs) return;
    // newest first
    const all = [...EVENTS].sort((a, b) => (b.y * 12 + MONTHS.indexOf(b.m)) - (a.y * 12 + MONTHS.indexOf(a.m)));
    const years = [...new Set(all.map(e => e.y))];
    $('#journey-stat').textContent = `${all.length} gatherings across ${new Set(all.map(e => e.city)).size} places since ${Math.min(...years)}`;
    tabs.innerHTML = [['all', 'All years', all.length], ...years.map(y => [y, y, all.filter(e => e.y === y).length])]
      .map(([k, label, n]) => `<button class="tab" role="tab" data-year="${k}">${label}<span class="n">${n}</span></button>`).join('');
    let list = all;
    const show = i => {
      const e = list[i];
      photo.src = EVENT_IMG + e.img.replace('_600x', '_1200x');
      photo.alt = e.title;
      // what it was and when, on one line; the photo stays clear
      card.innerHTML = `
        <div class="event-top"><span class="kicker">${esc(e.type)}</span><span class="event-date">${e.m} ${e.y}</span></div>
        <h3>${esc(e.title)}</h3>
        <p class="event-place">${pin}${esc(e.place)}</p>
        <div class="event-nav">
          <span class="event-count"><b>${String(i + 1).padStart(2, '0')}</b> / ${String(list.length).padStart(2, '0')}</span>
          <div class="strip-nav">
            <button class="round-btn" data-step="-1" aria-label="Newer event" ${i === 0 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H5M11 6l-6 6 6 6"/></svg></button>
            <button class="round-btn" data-step="1" aria-label="Older event" ${i === list.length - 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>
          </div>
        </div>`;
      card.dataset.index = i;
    };
    const pick = key => {
      $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', String(t.dataset.year === String(key))));
      list = key === 'all' ? all : all.filter(e => e.y === Number(key));
      show(0);   // each year opens on its most recent gathering
    };
    tabs.addEventListener('click', ev => { const t = ev.target.closest('[data-year]'); if (t) pick(t.dataset.year); });
    card.addEventListener('click', ev => {
      const b = ev.target.closest('[data-step]');
      if (b) show(Math.min(list.length - 1, Math.max(0, Number(card.dataset.index) + Number(b.dataset.step))));
    });
    pick('all');
  }

  /* ---------- shop by origin: region story + that region's products ---------- */
  const ORIGIN_INFO = {
    'western-ghats': { where: 'Poomaale Collective · Coorg', photo: 'assets/img/regions/western-ghats.webp?v=nat1', alt: 'Cardamom growing under the forest canopy in Coorg',
      text: 'Shade-grown robusta, forest pepper and cardamom from rainforest-edge coffee estates.' },
    'deccan-plateau': { where: 'Hyderabad Collective', photo: 'assets/img/regions/deccan-plateau.webp?v=nat1', alt: 'Rice harvest at the Hyderabad Collective',
      text: 'Heirloom rice, millets, pulses and sun-cured spices from our growing food forests.' },
    'central-highlands': { where: 'Bhopal Collective', photo: 'assets/img/regions/central-highlands.webp?v=nat1', alt: 'Paddy fields at sunset',
      text: 'Aromatic native rice and freshly milled wheat and millet flours from the heartland.' },
  };
  function originShop() {
    const grid = $('#origin-grid'), panel = $('#origin-panel');
    if (!grid) return;
    const tabs = $$('#origin-tabs .tab');
    const show = key => {
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.origin === key)));
      const info = ORIGIN_INFO[key];
      const order = Object.keys(CATEGORIES);
      const list = PRODUCTS.filter(p => p.origin === key)
        .sort((a, b) => b.available - a.available || order.indexOf(a.category) - order.indexOf(b.category));
      panel.innerHTML = `<div class="origin-photo"><img src="${info.photo}" alt="${info.alt}"></div>
        <span class="where">${info.where}</span>
        <h3>${ORIGINS[key]}</h3>
        <p>${info.text}</p>
        <a class="count" href="shop.html?origin=${key}">View all ${families(list).length} products →</a>`;
      renderGrid(grid, list);
      grid.scrollLeft = 0;
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.origin)));
    show('western-ghats');
  }

  /* shared helpers for page-only scripts (combo.js) */
  window.BEWILD = { packSize, PRODUCTS, ORIGIN_INFO, COMBO_CONTENTS, displayName, pdpUrl, money, esc, icon, cart, renderGrid, siblings, optionsOf };

  /* ---------- product detail page (product.html?p=<handle>) ---------- */
  function productPage() {
    const root = $('#pdp');
    if (!root) return;
    const p = PRODUCTS.find(x => x.handle === new URLSearchParams(location.search).get('p'));
    if (!p) {
      root.hidden = true;
      const miss = $('#pdp-missing'); miss.hidden = false;
      // somewhere to go next: one in-season product from each collection
      const picks = Object.keys(CATEGORIES).map(c => families(PRODUCTS.filter(x => x.category === c)).find(x => optionsOf(x).some(o => o.available))).filter(Boolean).slice(0, 4);
      if (picks.length) {
        miss.insertAdjacentHTML('beforeend', '<div class="pdp-missing-more"><h2>In season <em>right now</em></h2><div class="grid"></div></div>');
        renderGrid($('.pdp-missing-more .grid', miss), picks);
      }
      return;
    }
    // keep each kind of product on its own page (an old or shared link is forwarded to the right one)
    if (!location.pathname.endsWith('/' + pdpPage(p))) { location.replace(pdpUrl(p)); return; }
    const name = displayName(p), cat = CATEGORIES[p.category], origin = ORIGINS[p.origin];
    const isCoffee = p.name.startsWith('Canephora');
    document.title = `${name} — Bewild`;

    $('#pdp-crumbs').innerHTML = `<a href="shop.html">Shop</a><span>/</span><a href="${p.category === 'gifting' ? 'gifting.html' : 'shop.html?cat=' + p.category}">${cat}</a><span>/</span><b>${esc(name)}</b>`;

    /* gallery: our transparent pack first, then the store's photos (minus the studio pack shot and the line drawing) */
    const ownArt = p.art && p.art.endsWith(`/${p.handle}.webp`);
    const photos = p.photos.slice(1, ownArt ? -1 : undefined);
    // gift boxes: the open box photo, the closed box, then the pack of each product inside
    const shots = p.category === 'gifting'
      ? [{ src: p.image, big: p.image }, { src: 'assets/img/gifting/gift-box-closed.webp', big: 'assets/img/gifting/gift-box-closed.webp' },
         ...(COMBO_CONTENTS[p.handle] || []).map(n => PRODUCTS.find(x => !['combos', 'gifting'].includes(x.category) && displayName(x).includes(n)))
           .filter(Boolean).map(m => ({ src: m.image, pack: true, big: m.image }))]
      : [{ src: p.image, pack: true, big: p.image }, ...photos.map(src => ({ src: img(src, 1200), thumb: img(src, 200), big: img(src, 2000) }))];
    let shotNow = 0;
    const stage = $('#pdp-stage'), thumbs = $('#pdp-thumbs');
    const showShot = i => {
      shotNow = i;
      const sh = shots[i];
      stage.className = 'pdp-stage' + (sh.pack ? ' is-pack' : '');
      stage.innerHTML =
        `<img class="shot" src="${sh.src}" alt="${esc(name)}${i ? ', photo ' + i : ''}">` +
        (!p.available ? '<span class="badge badge--out">Sold out</span>' : '');
      $$('button', thumbs).forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
    };
    /* photo viewer: click the photo to see it large; ‹ × › at the bottom, arrow keys, Esc, swipe */
    stage.setAttribute('role', 'button'); stage.tabIndex = 0;
    stage.setAttribute('aria-label', `View ${name} photos larger`);
    document.body.insertAdjacentHTML('beforeend', `<div class="viewer" id="viewer" role="dialog" aria-modal="true" aria-label="${esc(name)} photos" hidden>
      <figure class="viewer-stage"><img alt=""></figure>
      <span class="viewer-count" aria-live="polite"></span>
      <div class="viewer-nav">
        <button type="button" class="viewer-btn" data-view="-1" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button type="button" class="viewer-btn" data-view-close aria-label="Close">${icon.close}</button>
        <button type="button" class="viewer-btn" data-view="1" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
    </div>`);
    const viewer = $('#viewer'), vImg = $('.viewer-stage img', viewer), vCount = $('.viewer-count', viewer);
    let vAt = 0, vOpener = null;
    const vShow = i => {
      vAt = (i + shots.length) % shots.length;
      vImg.src = shots[vAt].big; vImg.alt = `${name}${vAt ? ', photo ' + vAt : ''}`;
      vImg.closest('figure').classList.toggle('is-pack', !!shots[vAt].pack);
      vCount.textContent = `${vAt + 1} / ${shots.length}`;
      $$('[data-view]', viewer).forEach(b => { b.hidden = shots.length < 2; });
    };
    const vOpen = on => {
      if (on) { vOpener = document.activeElement; vShow(shotNow); viewer.hidden = false; document.documentElement.classList.add('viewer-open'); $('[data-view-close]', viewer).focus(); }
      else { viewer.hidden = true; document.documentElement.classList.remove('viewer-open'); showShot(vAt); (vOpener && vOpener !== document.body && vOpener.isConnected ? vOpener : stage).focus(); }
    };
    stage.addEventListener('click', () => vOpen(true));
    stage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vOpen(true); } });
    viewer.addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (b) { vShow(vAt + Number(b.dataset.view)); return; }
      if (e.target.closest('[data-view-close]') || e.target === viewer || e.target.classList.contains('viewer-stage')) vOpen(false);
    });
    document.addEventListener('keydown', e => {
      if (viewer.hidden) return;
      if (e.key === 'Escape') vOpen(false);
      else if (e.key === 'ArrowLeft') vShow(vAt - 1);
      else if (e.key === 'ArrowRight') vShow(vAt + 1);
      else if (e.key === 'Tab') {               // keep Tab on the three buttons
        const f = $$('.viewer-btn:not([hidden])', viewer); const i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let vx = null;
    viewer.addEventListener('touchstart', e => { vx = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', e => { if (vx === null) return; const dx = e.changedTouches[0].clientX - vx; if (Math.abs(dx) > 40) vShow(vAt + (dx < 0 ? 1 : -1)); vx = null; });

    thumbs.innerHTML = shots.map((sh, i) => `<button type="button" role="tab" data-shot="${i}" aria-label="Image ${i + 1}">
      <img src="${sh.thumb || sh.src}" alt="" loading="lazy"></button>`).join('');
    thumbs.addEventListener('click', e => { const b = e.target.closest('[data-shot]'); if (b) showShot(Number(b.dataset.shot)); });
    showShot(0);

    /* buy panel */
    const opts = optionsOf(p), multi = opts.length > 1, label = isCoffee ? 'Grind' : 'Size';
    let v = p.variants.find(x => x.available) || p.variants[0], qty = 1;
    const chips = opts.length <= 4;
    const fact = k => (p.insights.find(([l]) => l.toLowerCase() === k) || [])[1];
    const grower = fact('farm') || (p.origin ? ORIGIN_INFO[p.origin].where.split(' · ')[0] : fact('origin') || 'Beforest collectives');
    // every fact is said once, all in the row under the buy panel; "no fillers / preservatives" is the ribbon's promise, so it is not repeated
    const promise = v => /no (artificial|fillers|preservatives)/i.test(v);
    const extraFacts = p.insights.filter(([k, val]) => !['quantity', 'farm', 'origin'].includes(k.toLowerCase()) && !promise(val))
      .map(([k, val]) => [k.replace(/^Roast Level$/i, 'Roast'), val]).slice(0, 4);
    const inRow = new Set(['quantity', 'farm', 'origin', ...p.insights.filter(([, val]) => promise(val)).map(([k]) => k.toLowerCase()), ...extraFacts.map(([k]) => k.toLowerCase().replace(/^roast$/, 'roast level'))]);
    const buy = $('#pdp-buy');
    const render = () => {
      buy.innerHTML = `
        <span class="kicker">${esc(origin || cat)}</span>
        <h1>${esc(name)}</h1>
        <p class="pdp-sub">${isCoffee ? `Canephora Robusta · ${esc(p.roast)}` : esc(p.tagline || '')}</p>
        ${p.flavours.length ? `<ul class="pdp-notes" aria-label="Flavour notes">${p.flavours.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
        <div class="pdp-price">${priceHTML(v.price, p.compare)}<small>Taxes included</small></div>
        ${multi ? `<div class="pdp-field"><span class="pdp-label">${label}</span>${chips
          ? `<div class="tabs">${opts.map(o => o.owner === p
              ? `<button type="button" class="tab" data-variant="${o.id}" aria-pressed="${o.id === v.id}" ${o.available ? '' : 'disabled'}>${esc(o.label)}</button>`
              : `<a class="tab" href="${pdpUrl(o.owner)}" aria-pressed="false">${esc(o.label)}${o.available ? '' : ' · sold out'}</a>`).join('')}</div>`
          : `<label class="sr-only" for="pdp-variant">Choose ${label.toLowerCase()}</label><select id="pdp-variant">${opts.map(o =>
              `<option value="${o.id}" ${o.id === v.id ? 'selected' : ''} ${o.available ? '' : 'disabled'}>${esc(o.label)}${o.available ? '' : ' (sold out)'}</option>`).join('')}</select>`}</div>` : ''}
        ${localOnly(p) ? (() => { const pin = savedPin(), ok = HYD_PIN.test(pin), bad = pin.length === 6 && !ok;
          return `<div class="pdp-pin${ok ? ' is-ok' : bad ? ' is-bad' : ''}">
            <label class="pdp-label" for="pdp-pin">Delivery pincode</label>
            <div class="pdp-pin-row"><input id="pdp-pin" inputmode="numeric" autocomplete="postal-code" maxlength="6" pattern="[0-9]{6}" placeholder="6-digit pincode" value="${esc(pin)}"><button type="button" class="btn btn--ghost" data-pin-check>Check</button></div>
            <small aria-live="polite">${ok ? `Delivers to ${esc(pin)}, Hyderabad.` : bad ? `Sorry, the ${esc(p.weight)} pack is delivered only within Hyderabad.${siblings(p).some(x => x !== p && !localOnly(x) && x.available) ? ' The smaller pack ships across India.' : ''}` : `The ${esc(p.weight)} pack is delivered only within Hyderabad.`}</small>
          </div>`; })() : ''}
        <div class="pdp-actions">
          <div class="qty qty--lg"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><span aria-live="polite">${qty}</span><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>
          <button class="btn pdp-add" type="button" ${v.available && (!localOnly(p) || HYD_PIN.test(savedPin())) ? '' : 'disabled'}>${v.available ? icon.plus + 'Add to basket' : 'Sold out'}</button>
        </div>
        ${v.available && (p.category === 'coffee' || localOnly(p)) && (!localOnly(p) || HYD_PIN.test(savedPin())) ? (() => {
          const what = [name, p.weight, v.title !== 'Default Title' ? v.title : ''].filter(Boolean).join(', ');
          const msg = `Hi Bewild, I'd like a monthly subscription: ${what} × ${qty}${localOnly(p) ? ` (pincode ${savedPin()})` : ''}.`;
          return `<details class="pdp-subscribe">
            <summary>${icon.plus}<span>Subscribe${SUB_SAVE ? ` &amp; save ${SUB_SAVE}%` : ''} · delivered every month</span></summary>
            <div class="pdp-subscribe-body">
              <p>${esc(what)} × ${qty}, delivered every month.</p>
              <a class="btn" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Start on WhatsApp ${icon.arrow}</a>
              <small>We confirm the price and first delivery date with you on WhatsApp.</small>
            </div>
          </details>`; })() : ''}
        ${v.available ? (localOnly(p) && !HYD_PIN.test(savedPin()) ? '' : `<a class="btn btn--ghost pdp-now" href="${STORE}/cart/${v.id}:${qty}">Buy now ${icon.arrow}</a>`)
          : `<form class="notify" data-notify="${v.id}" novalidate>
              <p class="pdp-soldout">This harvest has sold out. It returns with the next season.</p>
              <label for="notify-email">Email me when it is back</label>
              <div class="notify-row"><input id="notify-email" type="email" name="email" autocomplete="email" placeholder="you@example.com" required><button class="btn" type="submit">Notify me</button></div>
              <small class="notify-msg" aria-live="polite"></small>
            </form>`}
        ${v.available && !(localOnly(p) && !HYD_PIN.test(savedPin())) ? `<p class="pdp-pay"><span>${PAY_LINE}</span><span class="pdp-pay-by">${LOCK}Secured by <b>Razorpay</b></span></p>` : ''}
        <p class="pdp-ship">${SHIP_LINE} · <a href="https://bewild.life/policies/shipping-policy" target="_blank" rel="noopener">Shipping &amp; returns</a></p>
        ${p.storage ? `<p class="pdp-storage"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/></svg><span><b>Storage note</b>${esc(p.storage)}</span></p>` : ''}`;
      buy.dispatchEvent(new CustomEvent('pdp:render', { bubbles: true }));
    };

    /* facts: one full-width row under the image + buy panel */
    const comboItems = COMBO_CONTENTS[p.handle];
    const facts = [
      fact('quantity') && ['Pack', packSize(fact('quantity'))],
      ['Grown by', grower],
      ...extraFacts,
    ].filter(Boolean).slice(0, 6);
    const factsEl = $('#pdp-facts');
    factsEl.style.setProperty('--cols', facts.length);
    factsEl.innerHTML = facts.map(([k, val]) => `<li><span>${esc(k)}</span><b>${esc(val)}</b></li>`).join('');
    buy.addEventListener('click', e => {
      const ch = e.target.closest('[data-variant]');
      if (ch) { v = p.variants.find(x => x.id === Number(ch.dataset.variant)); render(); }
      const q = e.target.closest('[data-q]');
      if (q) { qty = Math.max(1, Math.min(20, qty + Number(q.dataset.q))); render(); }
      if (e.target.closest('.pdp-add') && v.available) cart.add(v.id, qty);
    });
    const checkPin = () => {
      const val = ($('#pdp-pin', buy)?.value || '').replace(/\D/g, '').slice(0, 6);
      try { localStorage.setItem('bewild-pin', val); } catch (err) {}
      render();
      const f = $('#pdp-pin', buy); if (f && !HYD_PIN.test(val)) f.focus();
    };
    buy.addEventListener('click', e => { if (e.target.closest('[data-pin-check]')) checkPin(); });
    buy.addEventListener('keydown', e => { if (e.target.id === 'pdp-pin' && e.key === 'Enter') { e.preventDefault(); checkPin(); } });
    buy.addEventListener('change', e => {
      if (e.target.id !== 'pdp-variant') return;
      const o = opts.find(x => x.id === Number(e.target.value));
      if (o.owner !== p) { location.href = pdpUrl(o.owner); return; }
      v = p.variants.find(x => x.id === o.id); render();
    });
    render();

    /* phones: once the buy panel scrolls away, a slim bar keeps the price and Add in reach */
    const bar = document.createElement('div');
    bar.className = 'buybar'; bar.setAttribute('aria-hidden', 'true');
    document.body.append(bar);
    const fillBar = () => {
      const add = $('.pdp-add', buy);
      bar.innerHTML = `<div><b>${esc(name)}</b><span class="price">${money(v.price * qty)}</span></div>
        <button class="btn" type="button" ${add && !add.disabled ? '' : 'disabled'}>${add && !add.disabled ? icon.plus + 'Add' : 'Sold out'}</button>`;
    };
    fillBar();
    buy.addEventListener('pdp:render', fillBar);
    bar.addEventListener('click', e => { if (e.target.closest('button')) $('.pdp-add', buy)?.click(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        bar.classList.toggle('is-shown', show); bar.setAttribute('aria-hidden', String(!show));
        document.body.classList.toggle('has-buybar', show);
      }).observe(buy);   // the panel itself stays put while its contents redraw
    }

    /* recently viewed: the last products this visitor opened (kept in their browser only) */
    (() => {
      const list = seenProducts(siblings(p).map(x => x.handle)).slice(0, 4);
      let seen = [];
      try { seen = JSON.parse(localStorage.getItem('bewild-seen') || '[]'); localStorage.setItem('bewild-seen', JSON.stringify([p.handle, ...seen.filter(h => h !== p.handle)].slice(0, 12))); } catch (e) {}
      if (!list.length) return;
      const anchor = $('#pdp-more'); if (!anchor) return;
      anchor.insertAdjacentHTML('afterend', `<section class="chapter" id="pdp-seen">
        <div class="chapter-head"><div><span class="kicker">Recently viewed</span><h2>Where you <em>left off</em></h2></div></div>
        <div class="grid grid--row" id="pdp-seen-grid"></div></section>`);
      renderGrid($('#pdp-seen-grid'), list);
    })();

    /* page-only scripts (coffee.js, product.js, combo.js) pick up from here */
    window.BEWILD_PDP = { p, buy, render };

    /* every product page (regular, coffee, combo) points to its collection's questions on faq.html, just above "You may also like" */
    $('#pdp-more')?.insertAdjacentHTML('beforebegin', `<p class="pdp-faq"><span>Questions about our ${p.category}?</span>
      <a class="link-arrow" href="faq.html#${p.category}">Read the FAQ</a></p>`);

    /* combos have their own page (combo.html): combo.js fills the rest of it from here */
    if (document.body.classList.contains('pdp-combo')) {
      const members = (COMBO_CONTENTS[p.handle] || []).map(n => PRODUCTS.find(x => !['combos', 'gifting'].includes(x.category) && displayName(x).includes(n))).filter(Boolean);
      Object.assign(window.BEWILD_PDP, { members });
      document.dispatchEvent(new CustomEvent('bewild:pdp', { detail: window.BEWILD_PDP }));
      return;
    }

    /* frequently bought together: this product + two pairings (same idea as bewild.life) */
    const pick = h => PRODUCTS.find(x => x.handle.startsWith(h));
    let mates = (PAIRS[p.category] || []).map(pick).filter(x => x && x.available && x.handle !== p.handle);
    for (const x of PRODUCTS) {   // top up from other categories if a pairing is the product itself or sold out
      if (mates.length >= 2) break;
      if (x.available && x.category !== p.category && !['combos', 'gifting'].includes(x.category) && !mates.includes(x)) mates.push(x);
    }
    mates = mates.slice(0, 2);
    const fbt = $('#pdp-fbt'), picked = new Set([0, 1, 2]);
    const fbtItems = () => [{ p, v }, ...mates.map(m => ({ p: m, v: m.variants.find(x => x.available) || m.variants[0] }))];
    const renderFbt = () => {
      const items = fbtItems(), chosen = items.filter((_, i) => picked.has(i) && items[i].v.available);
      const total = chosen.reduce((t, it) => t + it.v.price, 0);
      fbt.innerHTML = `
        <div class="chapter-head split">
          <div><span class="kicker">Frequently bought together</span><h2>Better <em>together</em></h2></div>
          <p class="lead">A few things from our collectives that go well with ${esc(name)}.</p>
        </div>
        <div class="fbt" style="--n: ${items.length}">
          <ol class="fbt-items">${items.map((it, i) => `
            <li class="fbt-item${picked.has(i) ? '' : ' is-off'}">
              <label class="fbt-check"><input type="checkbox" data-fbt="${i}" ${picked.has(i) ? 'checked' : ''} ${it.v.available ? '' : 'disabled'}>
                <span>${i ? 'Add this' : 'This item'}</span></label>
              <a class="fbt-media" href="${i ? pdpUrl(it.p) : '#pdp'}" aria-label="${esc(displayName(it.p))}"><img src="${it.p.image}" alt=""></a>
              <b>${esc(displayName(it.p))}</b>
              <small>${esc([it.p.weight, it.v.title !== 'Default Title' ? it.v.title : ''].filter(Boolean).join(' · '))}</small>
              <span class="price">${money(it.v.price)}</span>
            </li>${i < items.length - 1 ? '<li class="fbt-plus" aria-hidden="true">+</li>' : ''}`).join('')}
          </ol>
          <div class="fbt-total">
            <span class="kicker">Total for ${chosen.length} item${chosen.length === 1 ? '' : 's'}</span>
            <span class="price">${money(total)}</span>
            <button class="btn" type="button" data-fbt-add ${chosen.length ? '' : 'disabled'}>${icon.plus}Add ${chosen.length > 1 ? 'all ' : ''}to basket</button>
            <small>Taxes included</small>
          </div>
        </div>`;
    };
    fbt.addEventListener('change', e => {
      const c = e.target.closest('[data-fbt]'); if (!c) return;
      const i = Number(c.dataset.fbt); c.checked ? picked.add(i) : picked.delete(i); renderFbt();
    });
    fbt.addEventListener('click', e => {
      if (!e.target.closest('[data-fbt-add]')) return;
      fbtItems().forEach((it, i) => { if (picked.has(i) && it.v.available) cart.add(it.v.id, 1); });
    });
    renderFbt();
    buy.addEventListener('click', () => renderFbt());      // keep the chosen grind/size in sync
    buy.addEventListener('change', () => renderFbt());

    /* story: the region photo beside it, and the dish to cook (the drawing is left for the shop cards) */
    const region = p.origin && ORIGIN_INFO[p.origin];
    const recipe = !p.brew.length && RECIPES.find(r => p.handle.startsWith(r.product));
    const recipeCard = recipe ? `<a class="pdp-recipe" href="recipe.html?r=${encodeURIComponent(recipe.url)}"><img src="${RECIPE_IMG + recipe.img}&width=700" alt="">
          <span><span class="kicker">Cook it</span><b>${esc(recipe.title)}</b><small>${esc(recipe.meta.join(' · '))}</small></span></a>` : '';
    $('#pdp-story').innerHTML = `
      <div class="chapter-head">
        <div><span class="kicker">The story</span><h2>Shaped by <em>${region ? esc(origin) : 'the land'}</em></h2></div>
      </div>
      <div class="pdp-story-body">
        <div class="pdp-prose">${p.story.slice(0, 2).map(t => `<p>${t}</p>`).join('')}${p.story.length > 2 ? `
          <div class="pdp-more-text" hidden>${p.story.slice(2).map(t => `<p>${t}</p>`).join('')}</div>
          <button type="button" class="pdp-readmore" aria-expanded="false">Read more</button>` : ''}</div>
        ${region ? `<div class="pdp-story-side"><figure class="pdp-region"><img src="${region.photo}" alt="${esc(region.alt)}">
            <figcaption><a class="link-arrow" href="shop.html?origin=${p.origin}">Shop more from ${esc(origin)}</a></figcaption></figure>
            ${recipeCard}</div>`
          : recipeCard ? `<div class="pdp-story-side">${recipeCard}</div>` : p.art ? `<figure class="pdp-region pdp-region--art"><img src="${p.art}" alt=""></figure>` : ''}
      </div>`;

    /* insights, flavour and brewing (or, for combos, what's in the box) */
    const inside = COMBO_CONTENTS[p.handle];
    const members = inside ? inside.map(n => PRODUCTS.find(x => !['combos', 'gifting'].includes(x.category) && displayName(x).includes(n))).filter(Boolean) : [];
    const side = p.flavours.length || p.brew.length ? `<div class="pdp-ink">
        ${p.flavours.length ? `<span class="kicker">Flavour notes</span><ul class="flavour-stamps">${p.flavours.map(n => `<li><span>${esc(n)}</span></li>`).join('')}</ul>` : ''}
        ${p.brew.length ? `<span class="kicker">Recommended brew</span><table class="brew"><thead><tr><th>Method</th><th>Ratio</th><th>Time</th><th>Temp</th></tr></thead>
          <tbody>${p.brew.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
      </div>`
      : '';
    const rest = p.insights.filter(([k]) => !inRow.has(k.toLowerCase()));
    if (!inside && !rest.length && !side) $('#pdp-details').hidden = true;
    $('#pdp-details').innerHTML = `
      <div class="chapter-head"><div><span class="kicker">${inside ? 'In the box' : rest.length ? 'Product insights' : 'In the kitchen'}</span><h2>${inside ? 'What’s <em>inside</em>' : rest.length ? 'Know your <em>harvest</em>' : 'From the harvest <em>to the kitchen</em>'}</h2></div></div>
      <div class="pdp-details${side ? '' : ' pdp-details--solo'}">
        ${inside ? `<ul class="pdp-inside">${members.map(m => `<li><a href="${pdpUrl(m)}"><img src="${m.image}" alt=""><span><b>${esc(displayName(m))}</b><small>${esc(m.weight)}</small></span></a></li>`).join('')}</ul>`
          : !rest.length ? '' : `<dl class="insights">${rest.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>`}
        ${side}
      </div>`;

    /* reviews (shared block, see reviews-ui.js) */
    window.BEWILD_REVIEWS_UI?.mount(p);

    /* more like this */
    // only what can be bought today: a family counts as in stock if any of its sizes is
    const more = inside ? members : families(PRODUCTS.filter(x => x.category === p.category && !siblings(p).includes(x))).filter(x => optionsOf(x).some(o => o.available));
    if (!more.length) { $('#pdp-more').hidden = true; return; }
    $('#pdp-more-kicker').textContent = inside ? 'Buy them separately' : 'You may also like';
    $('#pdp-more-title').innerHTML = inside ? 'Each one, <em>on its own</em>' : `More <em>${esc(cat.toLowerCase())}</em>`;
    $('#pdp-more-link').href = inside ? 'shop.html' : `shop.html?cat=${p.category}`;
    if (p.category === 'gifting') $('#pdp-more-link').href = 'gifting.html';
    renderGrid($('#pdp-more-grid'), more.slice(0, 4));   // one row; "View all" opens the rest
  }

  /* ---------- page: shop ---------- */
  function shop() {
    const grid = $('#shop-grid');
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const state = { cat: params.get('cat') || 'all', origin: params.get('origin') || 'all', sort: 'featured', instock: false };
    const catBox = $('#cat-chips'), originBox = $('#origin-chips');
    const count = (key, val) => families(val === 'all' ? PRODUCTS : PRODUCTS.filter(p => p[key] === val)).length;
    catBox.innerHTML = [['all', 'Everything'], ...Object.entries(CATEGORIES)].map(([k, v]) =>
      `<button class="tab" data-k="cat" data-v="${k}">${v}<span class="n">${count('category', k)}</span></button>`).join('');
    originBox.innerHTML = [['all', 'All regions'], ...Object.entries(ORIGINS)].map(([k, v]) =>
      `<button class="tab" data-k="origin" data-v="${k}">${v}<span class="n">${count('origin', k)}</span></button>`).join('');
    const apply = () => {
      $$('[data-k]').forEach(b => b.setAttribute('aria-pressed', String(state[b.dataset.k] === b.dataset.v)));
      let list = PRODUCTS.filter(p =>
        (state.cat === 'all' || p.category === state.cat) &&
        (state.origin === 'all' || p.origin === state.origin) &&
        (!state.instock || p.available));
      if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
      if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
      if (state.sort === 'featured') list = [...list].sort((a, b) => b.available - a.available);
      const shown = renderGrid(grid, list);
      $('#result-count').textContent = `${shown} product${shown === 1 ? '' : 's'}`;
      const q = new URLSearchParams();
      if (state.cat !== 'all') q.set('cat', state.cat);
      if (state.origin !== 'all') q.set('origin', state.origin);
      history.replaceState(null, '', q.toString() ? '?' + q : location.pathname);
      const t = state.cat !== 'all' ? CATEGORIES[state.cat] : state.origin !== 'all' ? ORIGINS[state.origin] : 'The Harvest';
      $('#shop-heading').textContent = t;
    };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      state[b.dataset.k] = b.dataset.v;
      apply();
    });
    $('#sort').addEventListener('change', e => { state.sort = e.target.value; apply(); });
    $('#instock').addEventListener('change', e => { state.instock = e.target.checked; apply(); });
    apply();
  }

  /* ---------- ticker duplication for a seamless loop ---------- */
  $$('.ribbon-track').forEach(t => { t.innerHTML += t.innerHTML; });

  buildChrome();
  buildSearch();
  welcome();
  cart.render();
  honeyPeek();
  strips();
  flips();
  home();
  shop();
  productPage();
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();

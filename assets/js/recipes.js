/* Recipes (recipes.html) and a single recipe (recipe.html?r=<handle>).
   Data: recipes-data.js, built from bewild.life/blogs/recipes. */
(() => {
  const RECIPES = window.BEWILD_RECIPES || [];
  const B = window.BEWILD;
  if (!RECIPES.length || !B) return;
  const { PRODUCTS, displayName, pdpUrl, money, esc, icon, cart, renderGrid } = B;
  const $ = (s, r = document) => r.querySelector(s);
  const CATS = ['Breakfast', 'Drinks', 'Mains & sides', 'Chutneys & spreads', 'Sweets & snacks', 'For little ones'];
  const img = (src, w) => src ? `${src}${src.includes('?') ? '&' : '?'}width=${w}` : '';
  const url = r => `recipe.html?r=${encodeURIComponent(r.handle)}`;
  const productOf = prefix => {
    const all = PRODUCTS.filter(p => p.handle.startsWith(prefix));
    return all.find(p => p.available) || all[0];
  };
  const counts = r => ({ ing: r.ingredients.reduce((t, g) => t + g.items.length, 0), steps: r.method.reduce((t, g) => t + g.items.length, 0) });
  const meta = r => { const c = counts(r); return [c.ing && `${c.ing} ingredients`, c.steps && `${c.steps} steps`, r.time].filter(Boolean); };

  const card = r => {
    const p = r.uses[0] && productOf(r.uses[0]);
    return `<a class="rcp-card" href="${url(r)}">
      <figure><img src="${img(r.image, 700)}" alt="${esc(r.title)}" loading="lazy"><figcaption>${esc(r.category)}</figcaption></figure>
      <div class="rcp-card-body">
        <h3>${esc(r.title)}</h3>
        ${r.subtitle ? `<p>${esc(r.subtitle)}</p>` : ''}
        <ul class="rcp-meta">${meta(r).map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        ${p ? `<span class="rcp-uses"><img src="${p.image}" alt="">Made with ${esc(displayName(p))}</span>` : ''}
      </div>
    </a>`;
  };

  /* ---------------- recipes.html ---------------- */
  const grid = $('#rcp-grid');
  if (grid) {
    const params = new URLSearchParams(location.search);
    let cat = CATS.includes(params.get('cat')) ? params.get('cat') : 'all', q = '';
    const latest = RECIPES[0];

    // the latest recipe, large
    const fp = latest.uses[0] && productOf(latest.uses[0]);
    $('#rcp-feature').innerHTML = `
      <a class="rcp-feature-photo" href="${url(latest)}"><img src="${img(latest.image, 1400)}" alt="${esc(latest.title)}"></a>
      <div class="rcp-feature-text">
        <span class="kicker">New in the kitchen · ${esc(latest.category)}</span>
        <h2><a href="${url(latest)}">${esc(latest.title)}</a></h2>
        <ul class="rcp-meta">${meta(latest).map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        ${fp ? `<span class="rcp-uses"><img src="${fp.image}" alt="">Made with ${esc(displayName(fp))}</span>` : ''}
        <a class="btn" href="${url(latest)}">Cook this ${icon.arrow}</a>
      </div>`;

    const cats = $('#rcp-cats');
    cats.innerHTML = [['all', 'All recipes', RECIPES.length], ...CATS.map(c => [c, c, RECIPES.filter(r => r.category === c).length])]
      .map(([k, label, n]) => `<button type="button" class="tab" data-cat="${esc(k)}">${esc(label)}<span class="n">${n}</span></button>`).join('');

    const text = r => [r.title, r.subtitle, r.category, ...r.ingredients.flatMap(g => g.items)].join(' ').toLowerCase();
    const apply = () => {
      $$('[data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      const list = RECIPES.filter(r => (cat === 'all' || r.category === cat) && words.every(w => text(r).includes(w)));
      grid.innerHTML = list.map(card).join('');
      $('#rcp-count').textContent = `${list.length} recipe${list.length === 1 ? '' : 's'}${cat !== 'all' ? ` in ${cat}` : ''}${q ? ` with “${q}”` : ''}`;
      $('#rcp-empty').hidden = list.length > 0;
      const u = new URLSearchParams(); if (cat !== 'all') u.set('cat', cat);
      history.replaceState(null, '', u.toString() ? `?${u}` : location.pathname);
    };
    function $$(s) { return [...document.querySelectorAll(s)]; }
    cats.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { cat = b.dataset.cat; apply(); } });
    $('#rcp-q').addEventListener('input', e => { q = e.target.value.trim(); apply(); });
    $('#rcp-empty').addEventListener('click', e => { if (e.target.closest('[data-clear]')) { cat = 'all'; q = ''; $('#rcp-q').value = ''; apply(); } });
    apply();
    return;
  }

  /* ---------------- recipe.html ---------------- */
  const detail = $('#rcp-detail');
  if (!detail) return;
  const r = RECIPES.find(x => x.handle === new URLSearchParams(location.search).get('r'));
  if (!r) { detail.hidden = true; $('#rcp-missing').hidden = false; return; }
  document.title = `${r.title} — Bewild Recipes`;
  const c = counts(r);
  const products = r.uses.map(productOf).filter(Boolean);

  $('#rcp-crumbs').innerHTML = `<a href="recipes.html">Recipes</a><span>/</span><a href="recipes.html?cat=${encodeURIComponent(r.category)}">${esc(r.category)}</a><span>/</span><b>${esc(r.title)}</b>`;

  // hero: photo + the essentials, with the Bewild product to add straight away
  const lead = products[0], lv = lead && (lead.variants.find(v => v.available) || lead.variants[0]);
  $('#rd-hero').innerHTML = `
    <figure class="rd-photo"><img src="${img(r.image, 1400)}" alt="${esc(r.title)}"></figure>
    <div class="rd-intro">
      <span class="kicker">${esc(r.category)}</span>
      <h1>${esc(r.title)}</h1>
      ${r.subtitle ? `<p class="rd-sub">${esc(r.subtitle)}</p>` : ''}
      ${r.intro[0] ? `<p class="rd-lede">${esc(r.intro[0])}</p>` : ''}
      <ul class="rd-facts">
        ${c.ing ? `<li><b>${c.ing}</b><span>Ingredients</span></li>` : ''}
        ${c.steps ? `<li><b>${c.steps}</b><span>Steps</span></li>` : ''}
        ${r.time ? `<li><b>${esc(r.time.replace(/\s*mins?\b/i, '').replace(/\s*minutes?\b/i, ''))}</b><span>Minutes</span></li>` : ''}
      </ul>
      ${lead ? `<div class="made-with rd-made">
        <img src="${lead.image}" alt="">
        <div><small>Made with Bewild</small><b>${esc(displayName(lead))}</b><span class="price">${money(lv.price)}</span></div>
        <button class="add-btn" data-add="${lv.id}" ${lead.available ? '' : 'disabled'}>${lead.available ? icon.plus + 'Add' : 'Sold out'}</button>
      </div>` : ''}
      <div class="rd-actions">
        <a class="btn btn--ghost" href="#rd-cook">Start cooking ${icon.arrow}</a>
        <button class="rd-print" type="button" data-print>Print recipe</button>
      </div>
    </div>`;

  // ingredients you can tick off, and steps you can mark done
  const groupTitle = n => n ? `<h3 class="rd-group">${esc(n)}</h3>` : '';
  let n = 0;
  $('#rd-body').innerHTML = `
    <aside class="rd-ingredients" id="rd-cook">
      <div class="rd-panel-head"><span class="kicker">Ingredients</span><small>Tick them off as you gather</small></div>
      ${r.ingredients.length ? r.ingredients.map(g => `${groupTitle(g.name)}<ul>${g.items.map(t => `<li><label><input type="checkbox"><span>${esc(t).replace(/\b(Bewild)\b/i, '<b>$1</b>')}</span></label></li>`).join('')}</ul>`).join('')
        : '<p class="rd-note">Everything you need is listed in each step.</p>'}
    </aside>
    <section class="rd-method">
      <div class="rd-panel-head"><span class="kicker">Method</span><small>Tap a step when it’s done</small></div>
      ${r.method.map(g => `${groupTitle(g.name)}<ol>${g.items.map(t => `<li><button type="button" class="rd-step"><i>${++n}</i><span>${esc(t)}</span></button></li>`).join('')}</ol>`).join('')}
    </section>`;
  $('#rd-body').addEventListener('click', e => { const s = e.target.closest('.rd-step'); if (s) s.classList.toggle('is-done'); });

  // health benefits and good-to-know notes, when the recipe has them
  const extra = [];
  if (r.benefits.length) extra.push(`<div class="rd-card rd-card--red"><span class="kicker">Why it’s good for you</span><ul>${r.benefits.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
  if (r.tips.length) extra.push(`<div class="rd-card"><span class="kicker">Good to know</span><ul>${r.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
  if (r.intro[1]) extra.push(`<div class="rd-card"><span class="kicker">From our kitchen</span><p>${esc(r.intro[1])}</p></div>`);
  $('#rd-extra').innerHTML = extra.join('');
  $('#rd-extra').hidden = !extra.length;
  $('#rd-extra').classList.toggle('is-one', extra.length === 1);

  // shop the Bewild products this recipe uses
  if (products.length) { $('#rd-shop').hidden = false; renderGrid($('#rd-shop-grid'), products); }

  // more from the same meal, then the rest
  const more = [...RECIPES.filter(x => x.category === r.category && x !== r), ...RECIPES.filter(x => x.category !== r.category)].slice(0, 4);
  $('#rd-more-title').innerHTML = `More <em>${esc(r.category.toLowerCase())}</em>`;
  $('#rd-more-grid').innerHTML = more.map(card).join('');

  document.addEventListener('click', e => { if (e.target.closest('[data-print]')) print(); });
})();

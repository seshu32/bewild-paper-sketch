/* Curated combo detail page (combo.html) only. Combo-specific behaviour goes here,
   so the regular product page (product.html) is never affected.
   main.js renders the shared parts (gallery, buy panel, facts) and hands over the combo
   through window.BEWILD_PDP / the 'bewild:pdp' event. */
(() => {
  if (!document.body.classList.contains('pdp-combo')) return;
  const $ = (s, r = document) => r.querySelector(s);

  const start = ({ p }) => {
    const { PRODUCTS, ORIGIN_INFO, COMBO_CONTENTS, displayName, pdpUrl, money, esc, icon, cart, renderGrid, optionsOf } = window.BEWILD;

    /* each product in the combo, always in its smallest size (e.g. Turmeric 250g, not 500g) */
    const grams = s => { const m = String(s || '').match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i); return m ? parseFloat(m[1]) * (m[2].toLowerCase() === 'kg' ? 1000 : 1) : Infinity; };
    const sizeOf = (m, v) => (v.title !== 'Default Title' ? v.title : m.weight) || '';
    const smallest = name => {
      const options = PRODUCTS.filter(x => !['combos', 'gifting'].includes(x.category) && displayName(x).includes(name))
        .flatMap(m => m.variants.map(v => ({ m, v, g: grams(sizeOf(m, v)) })));
      options.sort((a, b) => a.g - b.g || a.v.price - b.v.price);
      return options.find(o => o.v.available) || options[0];
    };
    const items = (COMBO_CONTENTS[p.handle] || []).map(smallest).filter(Boolean);
    const grower = m => (m.origin && ORIGIN_INFO[m.origin] ? ORIGIN_INFO[m.origin].where.split(' · ')[0] : 'Friends of Beforest');

    /* 1 · the story (right below the top), with the products in this combo listed under the text */
    $('#pdp-story').innerHTML = `
      <div class="chapter-head">
        <div><span class="kicker">The story</span><h2>Shaped by <em>the land</em></h2></div>
      </div>
      <div class="pdp-story-body">
        <div>
          <div class="pdp-prose">${p.story.map(t => `<p>${t}</p>`).join('')}</div>
          ${items.length ? `<details class="combo-inside" open>
            <summary>In this ${p.category === 'gifting' ? 'box' : 'combo'} <span>${items.length} products</span></summary>
            <ul>${items.map(({ m, v }) => `<li>
              <a class="combo-inside-media" href="${pdpUrl(m)}"><img src="${m.image}" alt=""></a>
              <div><a class="combo-inside-name" href="${pdpUrl(m)}">${esc(displayName(m))}</a>
                ${m.origin ? `<a class="combo-inside-from" href="shop.html?origin=${m.origin}">${esc(grower(m))} ›</a>` : `<span class="combo-inside-from">${esc(grower(m))}</span>`}</div>
              <span class="combo-inside-size">${esc(sizeOf(m, v))}</span>
            </li>`).join('')}</ul>
          </details>` : ''}
        </div>
        ${p.art ? `<figure class="pdp-region pdp-region--art"><img src="${p.art}" alt=""></figure>` : ''}
      </div>`;

    // the box, the saving and the growers are already in "In this combo" and the combo panel, so no separate facts row
    const row = $('#pdp-facts'); if (row) row.hidden = true;

    /* 2 · buy them separately: every product in the combo, ticked by default, with a running total */
    const sep = $('#combo-separately');
    const picked = new Set(items.map((_, i) => i));
    const renderSep = () => {
      if (!items.length) { sep.hidden = true; return; }
      const chosen = items.filter((it, i) => picked.has(i) && it.v.available);
      const total = chosen.reduce((t, it) => t + it.v.price, 0);
      const all = items.reduce((t, it) => t + it.v.price, 0);
      const comboV = p.variants.find(x => x.available) || p.variants[0];
      sep.innerHTML = `
        <div class="chapter-head split">
          <div><span class="kicker">Buy them separately</span><h2>Each one, <em>on its own</em></h2></div>
          <p class="lead">Pick only what you need from ${esc(displayName(p))}.</p>
        </div>
        <div class="fbt" style="--n: ${items.length}">
          <ol class="fbt-items">${items.map(({ m, v }, i) => `
            <li class="fbt-item${picked.has(i) ? '' : ' is-off'}">
              <label class="fbt-check"><input type="checkbox" data-sep="${i}" ${picked.has(i) ? 'checked' : ''} ${v.available ? '' : 'disabled'}>
                <span>Add this</span></label>
              <a class="fbt-media" href="${pdpUrl(m)}" aria-label="${esc(displayName(m))}"><img src="${m.image}" alt=""></a>
              <b>${esc(displayName(m))}</b>
              <small>${esc(sizeOf(m, v))}</small>
              <span class="price">${money(v.price)}</span>
            </li>${i < items.length - 1 ? '<li class="fbt-plus" aria-hidden="true">+</li>' : ''}`).join('')}
          </ol>
          <div class="fbt-total">${comboV.available && all > comboV.price ? `
            <span class="kicker">All ${items.length} as one ${p.category === 'gifting' ? 'gift box' : 'combo'}</span>
            <span class="price">${money(comboV.price)}</span>
            <small>You save ${money(all - comboV.price)} on buying them one by one.</small>
            <button class="btn" type="button" data-combo-add>${icon.plus}Add the combo</button>
            <span class="fbt-or">or only what you ticked</span>
            <button class="btn btn--ghost" type="button" data-sep-add ${chosen.length ? '' : 'disabled'}>Add separately · ${money(total)}</button>` : `
            <span class="kicker">Total for ${chosen.length} item${chosen.length === 1 ? '' : 's'}</span>
            <span class="price">${money(total)}</span>
            <button class="btn" type="button" data-sep-add ${chosen.length ? '' : 'disabled'}>${icon.plus}Add ${chosen.length > 1 ? 'all ' : ''}to basket</button>
            <small>Taxes included</small>`}
          </div>
        </div>`;
    };
    sep.addEventListener('change', e => {
      const c = e.target.closest('[data-sep]'); if (!c) return;
      const i = Number(c.dataset.sep); c.checked ? picked.add(i) : picked.delete(i); renderSep();
    });
    sep.addEventListener('click', e => {
      if (e.target.closest('[data-combo-add]')) { const cv = p.variants.find(x => x.available); if (cv) cart.add(cv.id, 1); return; }
      if (!e.target.closest('[data-sep-add]')) return;
      items.forEach((it, i) => { if (picked.has(i) && it.v.available) cart.add(it.v.id, 1); });
    });
    renderSep();

    /* 3 · reviews (shared with product.html, see reviews-ui.js) */
    window.BEWILD_REVIEWS_UI.mount(p);

    /* 4 · you may also like: the other curated combos */
    const others = PRODUCTS.filter(x => x.category === 'combos' && x.handle !== p.handle && optionsOf(x).some(o => o.available));
    if (!others.length) { $('#pdp-more').hidden = true; return; }
    $('#pdp-more-kicker').textContent = 'You may also like';
    $('#pdp-more-title').innerHTML = 'More <em>curated combos</em>';
    $('#pdp-more-link').href = 'shop.html?cat=combos';
    renderGrid($('#pdp-more-grid'), others);
  };

  if (window.BEWILD_PDP) start(window.BEWILD_PDP);
  else document.addEventListener('bewild:pdp', e => start(e.detail), { once: true });
})();

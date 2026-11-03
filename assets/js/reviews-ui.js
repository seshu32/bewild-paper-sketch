/* Reviews block shared by the product pages (product.html and combo.html):
   a rating line under the product title, and a "Customer Reviews" section (#reviews) laid out like Judge.me.
   Review data lives in reviews.js (real reviews only). Styles: assets/css/reviews.css. */
(() => {
  const STAR_D = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z';
  const stars = (value, cls = '') => `<span class="stars ${cls}" role="img" aria-label="${value ? value.toFixed(1) + ' out of 5 stars' : 'No rating yet'}">
      ${[0, 1, 2, 3, 4].map(i => { const f = Math.max(0, Math.min(1, value - i)) * 100;
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="star-empty" d="${STAR_D}"/><path class="star-full" style="clip-path:inset(0 ${100 - f}% 0 0)" d="${STAR_D}"/></svg>`; }).join('')}
    </span>`;

  function mount(p) {
    const { displayName, esc, icon } = window.BEWILD;
    const section = document.getElementById('reviews'), buy = document.getElementById('pdp-buy');
    if (!section) return;
    // sizes of one product (e.g. Tomato Pickle 150g and 250g) are separate products on Shopify, each with its own reviews:
    // the page shows them as one product, so it shows all of their reviews together
    const family = (window.BEWILD.siblings ? window.BEWILD.siblings(p) : [p]);
    const reviews = family.flatMap(x => (window.BEWILD_REVIEWS || {})[x.handle] || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const count = reviews.length;
    const avg = count ? reviews.reduce((t, r) => t + Number(r.rating || 0), 0) / count : 0;
    const name = displayName(p);
    const writeUrl = `https://bewild.life/products/${encodeURIComponent(p.handle)}`;
    const fmtDate = d => { const t = new Date(d); return isNaN(t) ? esc(d || '') : t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };

    // rating line under the title (the buy panel redraws on size/quantity changes)
    const ratingLine = () => {
      if (!buy) return;
      buy.querySelector('.pdp-rating')?.remove();
      const a = document.createElement('a');
      a.className = 'pdp-rating';
      a.href = '#reviews';
      a.innerHTML = `${stars(avg)}<span>${count ? `${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}</span>`;
      buy.querySelector('h1')?.after(a);
    };
    ratingLine();
    buy?.addEventListener('pdp:render', ratingLine);

    // laid out like the Judge.me widget on bewild.life, so the store can match it in Judge.me's settings:
    // a header (average · bar breakdown · Write a review), a "Most recent" sort, then the reviews one under another.
    // With no reviews yet: just the empty stars, "Be the first to write a review" and the button.
    const PAGE = 3;
    let shown = PAGE, order = 'recent';
    const sorted = () => {
      const list = reviews.slice();
      if (order === 'high') list.sort((a, b) => b.rating - a.rating || String(b.date).localeCompare(String(a.date)));
      if (order === 'low') list.sort((a, b) => a.rating - b.rating || String(b.date).localeCompare(String(a.date)));
      if (order === 'photos') list.sort((a, b) => (b.photos ? 1 : 0) - (a.photos ? 1 : 0));
      return list;
    };
    const PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/></svg>';
    const render = () => {
      const bars = [5, 4, 3, 2, 1].map(n => {
        const c = reviews.filter(r => Math.round(r.rating) === n).length;
        return `<li>${stars(n, 'stars--sm')}<i><b style="width:${count ? (c / count) * 100 : 0}%"></b></i><span>${c}</span></li>`;
      }).join('');
      section.innerHTML = `
        <h2 class="rv-title">Customer Reviews</h2>
        ${count ? `<div class="rv-head">
            <div class="rv-score">${stars(avg)}<span><b>${avg.toFixed(2)}</b> out of 5</span><small>Based on ${count} review${count === 1 ? '' : 's'}</small></div>
            <ul class="rv-bars" aria-label="Rating breakdown">${bars}</ul>
            <div class="rv-cta"><a class="btn btn--ghost" href="${writeUrl}" target="_blank" rel="noopener">Write a review</a></div>
          </div>
          <div class="rv-sort"><label>Sort by <select data-rv-sort>
            <option value="recent"${order === 'recent' ? ' selected' : ''}>Most recent</option>
            <option value="high"${order === 'high' ? ' selected' : ''}>Highest rating</option>
            <option value="low"${order === 'low' ? ' selected' : ''}>Lowest rating</option>
            <option value="photos"${order === 'photos' ? ' selected' : ''}>With photos</option></select></label></div>
          <div class="rv-list">
            ${sorted().slice(0, shown).map(r => `<article class="rv-item">
              <header>${stars(Number(r.rating || 0))}<time datetime="${esc(r.date || '')}">${fmtDate(r.date)}</time></header>
              <div class="rv-who"><span class="rv-avatar">${PERSON}</span><b>${esc(r.name)}</b>${r.verified ? '<span class="rv-verified">Verified</span>' : ''}${r.place ? `<small>${esc(r.place)}</small>` : ''}</div>
              ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
              <p>${esc(r.text)}</p>
              ${r.photos ? `<div class="rv-photos">${r.photos.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u.replace(/width=\d+/, 'width=240'))}" alt="Photo ${i + 1} from ${esc(r.name)}" loading="lazy"></a>`).join('')}</div>` : ''}
            </article>`).join('')}
          </div>
          ${count > shown ? `<button class="btn btn--ghost rv-more" type="button" data-rv-more>Show more reviews</button>` : ''}`
        : `<div class="rv-head rv-head--empty">
            <div class="rv-score">${stars(0)}<small>Be the first to write a review</small></div>
            <div class="rv-cta"><a class="btn btn--ghost" href="${writeUrl}" target="_blank" rel="noopener">Write a review</a></div>
          </div>`}`;
    };
    section.addEventListener('change', e => { if (e.target.closest('[data-rv-sort]')) { order = e.target.value; shown = PAGE; render(); } });
    section.addEventListener('click', e => { if (e.target.closest('[data-rv-more]')) { shown += PAGE; render(); } });
    render();
  }

  window.BEWILD_REVIEWS_UI = { mount };
})();

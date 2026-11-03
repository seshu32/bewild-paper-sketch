/* Festive gift boxes collection page (gifting.html) only.
   One row per box, the photo alternating sides: name, what is inside, price and "View details",
   which opens the box's own page (that is where it is bought). Only the button reacts on hover. */
(() => {
  const list = document.getElementById('gift-grid');
  if (!list || !window.BEWILD) return;
  const { PRODUCTS, displayName, pdpUrl, money, esc, icon } = window.BEWILD;
  // shop names for the products inside, so the line reads like the packs ("Raw Honey", not the long Shopify name)
  const product = name => PRODUCTS.find(x => !['combos', 'gifting'].includes(x.category) && displayName(x).includes(name));

  list.innerHTML = PRODUCTS.filter(p => p.category === 'gifting').map((p, i) => {
    const inside = [...p.inside.map(n => product(n) ? displayName(product(n)) : n), ...p.extras];
    return `<article class="gift-row" id="${esc(p.handle)}">
      <a class="gift-row-media" href="${pdpUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" width="1445" height="1088"></a>
      <div class="gift-row-body">
        <span class="gift-row-no">Box ${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(p.name)}</h3>
        <p class="gift-row-tag">${esc(p.tagline)}</p>
        <p class="gift-row-inside"><b>Inside</b> ${inside.map(esc).join(' · ')}</p>
        <div class="gift-row-foot">
          <span class="price">${money(p.variants[0].price)}</span>
          <a class="btn gift-row-cta" href="${pdpUrl(p)}">View details ${icon.arrow}</a>
        </div>
      </div>
    </article>`;
  }).join('');
})();

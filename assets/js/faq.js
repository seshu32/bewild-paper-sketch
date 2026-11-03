/* FAQ page (faq.html) only: renders the groups from faqs.js, keeps the tabs in step with the page,
   opens the group a link points at (faq.html#coffee) and tells search engines what the page answers. */
(() => {
  const list = document.getElementById('faq-groups'), tabs = document.getElementById('faq-tabs');
  const groups = window.BEWILD_FAQS;
  if (!list || !tabs || !groups) return;
  const pad = n => String(n).padStart(2, '0');

  tabs.innerHTML = groups.map(g => `<a class="tab" href="#${g.id}">${g.short}<span class="n">${g.items.length}</span></a>`).join('');
  list.innerHTML = groups.map(g => `
    <section class="faq-group" id="${g.id}" aria-labelledby="${g.id}-title">
      <div class="faq-group-head"><span class="kicker">${g.short}</span><h2 id="${g.id}-title">${g.title}</h2></div>
      <div class="faq-items">${g.items.map((it, i) => `
        <details class="faq-item">
          <summary><span class="faq-no">${pad(i + 1)}</span><span class="faq-q">${it.q}</span></summary>
          <div class="faq-a"><p>${it.a}</p>${it.confirm ? '<span class="faq-confirm">To confirm</span>' : ''}</div>
        </details>`).join('')}
      </div>
    </section>`).join('');

  // the tab of the group in view is the selected one
  const mark = id => tabs.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-current', String(t.hash === '#' + id)));
  const seen = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && mark(e.target.id)), { rootMargin: '-30% 0px -60% 0px' });
  list.querySelectorAll('.faq-group').forEach(s => seen.observe(s));
  mark(groups[0].id);

  // a link to a group (from a product page, the basket or the tabs) opens its first question
  const open = () => {
    const g = location.hash && document.getElementById(location.hash.slice(1));
    if (!g || !g.classList.contains('faq-group')) return;
    const first = g.querySelector('details'); if (first) first.open = true;
    mark(g.id);
    requestAnimationFrame(() => g.scrollIntoView({ block: 'start' }));
  };
  addEventListener('hashchange', open);
  open();

  // structured data: every question and answer, as plain text
  const text = html => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); };
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: groups.flatMap(g => g.items.filter(it => !it.confirm)).map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: text(it.a) } })),
  });
  document.head.appendChild(ld);
})();

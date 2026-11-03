/* The Journal (blog.html) and one story (post.html?p=<handle>). Posts: blog-data.js, from bewild.life/blogs/news. */
(() => {
  const POSTS = window.BEWILD_POSTS || [];
  const B = window.BEWILD;
  if (!POSTS.length || !B) return;
  const { PRODUCTS, esc, icon, renderGrid, pdpUrl } = B;
  const $ = (s, r = document) => r.querySelector(s);
  const url = p => `post.html?p=${encodeURIComponent(p.handle)}`;
  const date = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const img = (src, w) => src ? `${src}${src.includes('?') ? '&' : '?'}width=${w}` : '';
  const line = p => `${esc(p.topic)} · ${p.minutes} min read`;

  const card = p => `<a class="blog-card" href="${url(p)}">
      <figure><img src="${img(p.cover, 800)}" alt="" loading="lazy"></figure>
      <div class="blog-card-body">
        <span class="blog-line">${line(p)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.excerpt)}</p>
        <span class="blog-date">${date(p.date)}</span>
      </div>
    </a>`;

  /* ---------------- blog.html ---------------- */
  const grid = $('#blog-grid');
  if (grid) {
    const [first, ...rest] = POSTS;
    $('#blog-feature').innerHTML = `
      <a class="blog-feature-photo" href="${url(first)}"><img src="${img(first.cover, 1600)}" alt=""></a>
      <div class="blog-feature-text">
        <span class="kicker">Latest · ${line(first)}</span>
        <h2><a href="${url(first)}">${esc(first.title)}</a></h2>
        <p>${esc(first.excerpt)}</p>
        <span class="blog-date">${esc(first.author)} · ${date(first.date)}</span>
        <a class="btn" href="${url(first)}">Read the story ${icon.arrow}</a>
      </div>`;
    const topics = ['All stories', ...new Set(POSTS.map(p => p.topic))];
    let topic = 'All stories';
    $('#blog-topics').innerHTML = topics.map(t => `<button type="button" class="tab" data-topic="${esc(t)}">${esc(t)}<span class="n">${t === 'All stories' ? rest.length : rest.filter(p => p.topic === t).length}</span></button>`).join('');
    const apply = () => {
      document.querySelectorAll('[data-topic]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topic === topic)));
      grid.innerHTML = rest.filter(p => topic === 'All stories' || p.topic === topic).map(card).join('');
    };
    $('#blog-topics').addEventListener('click', e => { const b = e.target.closest('[data-topic]'); if (b) { topic = b.dataset.topic; apply(); } });
    apply();
    return;
  }

  /* ---------------- post.html ---------------- */
  const post = $('#post');
  if (!post) return;
  const p = POSTS.find(x => x.handle === new URLSearchParams(location.search).get('p'));
  if (!p) { post.hidden = true; $('#post-missing').hidden = false; return; }
  document.title = `${p.title} — Bewild Journal`;

  $('#post-crumbs').innerHTML = `<a href="blog.html">Journal</a><span>/</span><a href="blog.html">${esc(p.topic)}</a><span>/</span><b>${esc(p.title)}</b>`;
  $('#post-head').innerHTML = `
    <span class="kicker">${esc(p.topic)}</span>
    <h1>${esc(p.title)}</h1>
    <p class="post-meta"><span>By ${esc(p.author)}</span><span>${date(p.date)}</span><span>${p.minutes} min read</span></p>`;
  $('#post-cover').innerHTML = `<img src="${img(p.cover, 1800)}" alt="">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}`;

  // the article, with links to bewild.life pointed at this site
  const body = $('#post-body');
  body.innerHTML = p.html;
  // don't show the cover photo twice
  body.querySelectorAll('img').forEach(i => { if (i.getAttribute('src') === p.cover) (i.closest('figure') || i).remove(); });
  body.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    const prod = h.match(/bewild\.life\/products\/([^/?#]+)/), col = h.match(/bewild\.life\/collections\/([^/?#]+)/), blog = h.match(/bewild\.life\/blogs\/(news|recipes)\/([^/?#]+)/);
    if (prod) { const x = PRODUCTS.find(q => q.handle === prod[1] || q.handle.startsWith(prod[1].slice(0, 24))); if (x) a.href = pdpUrl(x); }
    else if (col) a.href = /coffee/.test(col[1]) ? 'shop.html?cat=coffee' : /grain|cereal|pulse/.test(col[1]) ? 'shop.html?cat=grains' : /spice/.test(col[1]) ? 'shop.html?cat=spices' : /condiment/.test(col[1]) ? 'shop.html?cat=condiments' : /combo/.test(col[1]) ? 'shop.html?cat=combos' : 'shop.html';
    else if (blog) a.href = blog[1] === 'news' ? `post.html?p=${blog[2]}` : `recipe.html?r=${blog[2]}`;
    if (!/^https?:/.test(a.getAttribute('href'))) { a.removeAttribute('target'); a.removeAttribute('rel'); }
  });

  // side: contents (from the article's headings) and sharing
  const heads = [...body.querySelectorAll('h2')];
  heads.forEach((h, i) => { h.id = `s${i + 1}`; });
  const share = encodeURIComponent(`${p.title} ${location.href}`);
  $('#post-aside').innerHTML = `
    ${heads.length > 2 ? `<nav class="post-toc" aria-label="In this story"><span class="kicker">In this story</span>
      <ol>${heads.map(h => `<li><a href="#${h.id}">${esc(h.textContent.replace(/^\d+\.\s*/, ''))}</a></li>`).join('')}</ol></nav>` : ''}
    <div class="post-share"><span class="kicker">Share</span>
      <a href="https://wa.me/?text=${share}" target="_blank" rel="noopener">WhatsApp</a>
      <button type="button" data-copy>Copy link</button></div>`;
  $('#post-aside').addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    navigator.clipboard?.writeText(location.href).then(() => { b.textContent = 'Link copied'; setTimeout(() => { b.textContent = 'Copy link'; }, 1800); });
  });
  // highlight the section being read
  const tocLinks = [...document.querySelectorAll('.post-toc a')];
  const bar = $('#post-progress');
  const onScroll = () => {
    const r = body.getBoundingClientRect();
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, (innerHeight * .3 - r.top) / r.height))})`;
    let on = -1; heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * .35) on = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('is-on', i === on));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // products the story is about
  const txt = (p.title + ' ' + body.textContent).toLowerCase();
  const picks = [];
  const add = list => list.forEach(x => { if (x && !picks.includes(x)) picks.push(x); });
  const fams = list => list.filter((x, i, a) => x.available && a.findIndex(y => y.name === x.name && y.process === x.process) === i);
  if (/coffee/.test(txt)) add(fams(PRODUCTS.filter(x => x.category === 'coffee')).slice(0, 4));
  if (/bajra/.test(txt)) add(fams(PRODUCTS.filter(x => /^bajra/.test(x.handle))).slice(0, 2));
  if (picks.length) { $('#post-shop').hidden = false; renderGrid($('#post-shop-grid'), picks.slice(0, 4)); }

  $('#post-more').innerHTML = POSTS.filter(x => x !== p).sort((a, b) => (b.topic === p.topic) - (a.topic === p.topic)).slice(0, 3).map(card).join('');
})();

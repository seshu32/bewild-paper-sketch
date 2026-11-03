/* Track your order (track.html). Uses the same tracking service as bewild.life/pages/track-your-order:
   an order number (3–6 digits) is looked up through the store, an AWB (10+ digits) straight with Delhivery.
   The page then shows a five-stage progress line, the latest status, every courier update and the order details. */
(() => {
  const form = document.getElementById('track-form');
  if (!form) return;
  const API = {
    order: 'https://bewildshopify.ops.beforest.co/webhook/order-track',
    awb: 'https://bewildshopify.ops.beforest.co/api/track',
  };
  const input = document.getElementById('track-input'), errorEl = document.getElementById('track-error'), out = document.getElementById('track-result');
  const button = form.querySelector('button');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---- reading the courier's updates (same rules as bewild.life) ---- */
  const TITLES = {
    'UD': 'Shipment update', 'DL': 'Delivered', 'X-UCI': 'Order confirmed', 'X-PPOM': 'Picked up', 'X-DWS': 'In transit', 'X-PIOM': 'Processing',
    'X-DBL1F': 'In transit', 'X-DLL2F': 'In transit', 'X-OLL4F': 'In transit', 'X-ILL2F': 'In transit', 'X-ILL1F': 'In transit',
    'X-IBD3F': 'Processing', 'X-DDD3FD': 'Out for delivery', 'EOD-38': 'Delivered',
  };
  const fmt = d => { const t = new Date(d); return d && !isNaN(t) ? t.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (d || ''); };
  const scansToTimeline = scans => {
    // drop "Processing" scans, keep only the latest "In transit" one, keep the rest in order
    const kept = []; let lastTransit = null;
    (scans || []).forEach((s, index) => {
      const d = s.ScanDetail || {};
      const title = TITLES[d.StatusCode] || d.Scan || d.ScanType || 'Shipment update';
      if (title === 'Processing') return;
      const item = { index, title, text: d.Instructions || d.Scan || '', date: fmt(d.ScanDateTime), place: d.ScannedLocation || '' };
      if (title === 'In transit') lastTransit = item; else kept.push(item);
    });
    if (lastTransit) kept.push(lastTransit);
    return kept.sort((a, b) => a.index - b.index);
  };

  // five stages, from the courier's status
  const STAGES = ['Order placed', 'Picked up', 'On the way', 'Out for delivery', 'Delivered'];
  const stageOf = (status, timeline) => {
    const s = String(status || '').toLowerCase(), titles = timeline.map(t => t.title.toLowerCase());
    if (s.includes('deliver') && !s.includes('out for') && !s.includes('undeliver')) return 4;
    if (s.includes('out for delivery') || titles.includes('out for delivery')) return 3;
    if (/(transit|dispatch|pending)/.test(s) || titles.includes('in transit')) return 2;
    if (/(picked|manifest)/.test(s) || titles.includes('picked up')) return 1;
    return 0;
  };

  const fromOrder = data => {
    if (!data || !data.success || !data.order) return null;
    const o = data.order, info = (data.tracking_info || [])[0], dl = data.delhivery_tracking;
    const ship = dl && dl.success && dl.data && dl.data.ShipmentData && dl.data.ShipmentData[0];
    let timeline = [], status = o.fulfillment_status || 'Processing', where = '', when = '';
    if (ship) {
      timeline = scansToTimeline(ship.Shipment.Scans);
      status = ship.Shipment.Status.Status; where = ship.Shipment.Status.StatusLocation; when = fmt(ship.Shipment.Status.StatusDateTime);
    }
    if (!timeline.length || !/order/i.test(timeline[0].title)) timeline.unshift({ title: 'Order placed', text: `Order ${o.name} confirmed`, date: fmt(o.created_at), place: 'Bewild' });
    const details = [
      ['Order', o.name], ['Placed on', fmt(o.created_at)], ['Amount', o.total_price ? `₹${o.total_price}` : ''],
      ['Payment', o.financial_status && String(o.financial_status).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())], ['AWB', info && info.awb], ['Courier', info && info.tracking_company],
    ];
    return { ref: o.name, awb: info && info.awb, status, where, when, timeline, details };
  };
  const fromAwb = (data, awb) => {
    const ship = data && data.success && data.data && data.data.ShipmentData && data.data.ShipmentData[0];
    if (!ship) return null;
    const st = ship.Shipment.Status;
    return { ref: awb, awb, status: st.Status, where: st.StatusLocation, when: fmt(st.StatusDateTime), timeline: scansToTimeline(ship.Shipment.Scans),
      details: [['AWB', awb], ['Courier', 'Delhivery']] };
  };

  async function lookup(q) {
    const v = q.replace(/\s+/g, '').replace(/^#/, '');
    if (/^\d{3,6}$/.test(v)) {
      const r = await fetch(API.order, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_name: v }) });
      return r.ok ? fromOrder(await r.json()) : null;
    }
    if (/^\d{10,}$/.test(v)) {
      const r = await fetch(API.awb, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ awb: v }) });
      return r.ok ? fromAwb(await r.json(), v) : null;
    }
    throw new Error('format');
  }

  /* ---- showing it ---- */
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const render = d => {
    const stage = stageOf(d.status, d.timeline);
    const delivered = stage === 4;
    const updates = [...d.timeline].reverse();             // newest first
    out.innerHTML = `
      <header class="tr-top">
        <div>
          <span class="kicker">${d.awb ? `Order ${esc(d.ref)}${d.awb !== d.ref ? ` · AWB ${esc(d.awb)}` : ''}` : `Order ${esc(d.ref)}`}</span>
          <h2>${esc(delivered ? 'Delivered' : STAGES[stage])}</h2>
          ${d.where || d.when ? `<p>${[d.where && `Last seen at <b>${esc(d.where)}</b>`, d.when && esc(d.when)].filter(Boolean).join(' · ')}</p>` : ''}
        </div>
        <span class="tr-badge${delivered ? ' is-delivered' : ''}">${esc(d.status)}</span>
      </header>

      <ol class="tr-stages" style="--at:${stage}" aria-label="Delivery progress">
        ${STAGES.map((s, i) => `<li class="${i < stage || delivered ? 'is-done' : i === stage ? 'is-now' : ''}"><i>${i < stage || delivered ? TICK : ''}</i><span>${s}</span></li>`).join('')}
      </ol>

      <div class="tr-body">
        <section class="tr-updates">
          <span class="kicker">Every update</span>
          <ol>${updates.map((u, i) => `<li class="${i === 0 ? 'is-latest' : ''}">
            <b>${esc(u.title)}</b>
            ${u.text && u.text !== u.title ? `<p>${esc(u.text)}</p>` : ''}
            <small>${[esc(u.date), esc(u.place)].filter(Boolean).join(' · ')}</small>
          </li>`).join('')}</ol>
        </section>
        <aside class="tr-details">
          <span class="kicker">Order details</span>
          <dl>${d.details.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </aside>
      </div>`;
    out.hidden = false;
    out.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const fail = msg => { errorEl.innerHTML = msg; errorEl.hidden = false; out.hidden = true; };
  const busy = on => { form.classList.toggle('is-busy', on); button.disabled = on; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const q = input.value.trim();
    errorEl.hidden = true;
    if (q.replace(/\D/g, '').length < 3) { fail('Please enter your order number (like 1770) or your AWB.'); input.focus(); return; }
    busy(true);
    try {
      const data = await lookup(q);
      if (data) {
        render(data);
        history.replaceState(null, '', `?q=${encodeURIComponent(q.replace(/^#/, ''))}`);
      } else {
        fail('We couldn’t find that one yet. Check the number, or <a href="https://wa.me/919154137599" target="_blank" rel="noopener">message us on WhatsApp</a> and we’ll look it up for you.');
      }
    } catch (err) {
      fail(err.message === 'format'
        ? 'That doesn’t look like an order number or AWB. Order numbers are 3 to 6 digits; AWBs are 10 or more.'
        : 'We couldn’t reach the tracking service just now. Please try again in a moment, or <a href="https://wa.me/919154137599" target="_blank" rel="noopener">message us on WhatsApp</a>.');
    }
    busy(false);
  });
  input.addEventListener('input', () => { errorEl.hidden = true; });

  // a shared link (track.html?q=1770) tracks straight away
  const q = new URLSearchParams(location.search).get('q');
  if (q) { input.value = q; form.requestSubmit(); }
})();

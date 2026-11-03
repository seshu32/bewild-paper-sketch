/* Contact page (contact.html): the order-number field shows only when the message is about an order. */
(() => {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const order = form.querySelector('[data-order]');
  const sync = () => { order.hidden = form.querySelector('input[name="contact[topic]"]:checked')?.value !== 'An order'; };
  form.addEventListener('change', e => { if (e.target.name === 'contact[topic]') sync(); });
  sync();
})();

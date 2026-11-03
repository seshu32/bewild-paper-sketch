/* Non-coffee product detail page (product.html) only. Behaviour for grains, spices,
   condiments and other non-coffee products goes here, so the coffee (coffee.html)
   and combo (combo.html) pages are never affected. */
(() => {
  if (!document.body.classList.contains('pdp-single')) return;
})();

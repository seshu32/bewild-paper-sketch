/* Festive gift boxes: not on Shopify yet, so they are added here, after products.js, in the same shape.
   PLACEHOLDERS until the boxes are live: the names, prices and variant ids (Shopify checkout will not know these ids).
   `inside` lists products by their shop name (so each links to its own page); `extras` are the gifts that are not sold alone;
   `art` is the line drawing beside the story (one of the box's own products). */
(window.BEWILD_PRODUCTS = window.BEWILD_PRODUCTS || []).push(
  {
    handle: 'gift-box-coffee-and-cardamom', name: 'Coffee & Cardamom', category: 'gifting',
    tagline: 'For the one who starts every morning with a cup',
    inside: ['Connected Drip Bags', 'Multi Floral Raw Honey', 'Green Cardamom', 'Kachampuli'],
    extras: ['Brass diya'],
    price: 1899, variantId: 9100000000001, image: 'assets/img/gifting/gift-box-1.webp',
    art: 'assets/img/products/art/green-elaichi-green-cardamom-75g-sundried-extra-bold.webp',
    story: [
      "A box for slow mornings. <strong>Connected Coffee Drip Bags</strong>, freshly ground canephora from the Poomaale Collective in Coorg, brew a proper cup with nothing more than hot water. Wild multifloral honey from the Nilgiris and Kodaikanal, and sun-dried green cardamom from the same Coorg slopes, are there to sweeten and scent it.",
      "Kachampuli, the tangy fruit extract Kodava kitchens have treasured for generations, is for the cook in the house. Everything sits in our indigo Bewild box, with a brass diya to light."
    ],
  },
  {
    handle: 'gift-box-sweet-and-nutty', name: 'Sweet & Nutty', category: 'gifting',
    tagline: 'Ragi laddus, slow-roasted peanut butter and wild honey',
    inside: ['Ragi Laddu', 'Peanut Butter', 'Multi Floral Raw Honey', 'Green Cardamom'],
    extras: ['Brass diya'],
    price: 1499, variantId: 9100000000002, image: 'assets/img/gifting/gift-box-2.webp',
    art: 'assets/img/products/art/peanut-butter-crunchy-250g-kadiri-nath-peanuts-slow-roasted-naturally-delicious-copy.webp',
    story: [
      "For the ones who always reach for something sweet. <strong>Ragi Laddus</strong> made from sprouted finger millet, and crunchy <strong>Peanut Butter</strong> from Kadiri Nath peanuts, both from our Friends of Beforest in Anantapuramu and slow-roasted the traditional way.",
      "Wild multifloral honey from the Western Ghats and sun-dried green cardamom from Coorg round it off. Packed in our indigo Bewild box, with a brass diya to light."
    ],
  },
  {
    handle: 'gift-box-spice-and-honey', name: 'Spice & Honey', category: 'gifting',
    tagline: 'Coorg pepper and cardamom, with bajra laddus to sweeten it',
    inside: ['Bajra Laddu', 'Black Pepper', 'Green Cardamom', 'Multi Floral Raw Honey'],
    extras: ['Brass diya'],
    price: 1499, variantId: 9100000000003, image: 'assets/img/gifting/gift-box-3.webp',
    art: 'assets/img/products/art/black-pepper-whole-coorg-125g-sundried-ungarbled.webp',
    story: [
      "Coorg’s two great spices, sun-dried whole: <strong>Black Pepper</strong> from vines that climb through the Poomaale Collective’s forest, and <strong>Green Cardamom</strong> from the same high slopes.",
      "Bajra Laddus, slow-roasted pearl millet from Gujarat, and wild multifloral honey from the Nilgiris and Kodaikanal bring the sweetness. Packed in our indigo Bewild box, with a brass diya to light."
    ],
  },
  {
    handle: 'gift-box-festive-table', name: 'The Festive Table', category: 'gifting',
    tagline: 'Two kinds of millet laddu, wild honey and Kachampuli',
    inside: ['Ragi Laddu', 'Bajra Laddu', 'Multi Floral Raw Honey', 'Kachampuli'],
    extras: ['Lotus brass diya', 'Wooden spoon'],
    price: 1999, variantId: 9100000000004, image: 'assets/img/gifting/gift-box-4.webp',
    art: 'assets/img/products/art/ragi-laddu-250g-traditionally-made-sprouted-millet-goodness.webp',
    story: [
      "Made for a festive spread. Two kinds of millet laddu, sprouted <strong>Ragi</strong> from Anantapuramu and slow-roasted <strong>Bajra</strong> from Gujarat, sit beside wild multifloral honey from the Western Ghats.",
      "<strong>Kachampuli</strong>, the tangy fruit extract Kodava kitchens have treasured for generations, brings Coorg to the table. This box comes with a lotus brass diya and a wooden spoon, in our indigo Bewild box."
    ],
  },
);
/* fill in the rest of the product shape the shared code expects */
window.BEWILD_PRODUCTS.filter(p => p.category === 'gifting' && !p.variants).forEach(p => Object.assign(p, {
  weight: '', process: '', roast: '', notes: '', origin: '', compare: null, available: true,
  desc: p.story[0].replace(/<[^>]+>/g, ''), photos: [p.image], insights: [], flavours: [], brew: [],
  variants: [{ id: p.variantId, title: 'Default Title', price: p.price, available: true }],
}));

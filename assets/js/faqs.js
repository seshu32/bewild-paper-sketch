/* Bewild — frequently asked questions (faq.html).
   One group per collection, plus General for anything about orders. Each answer is written once here;
   faq.html shows every group and product pages link to their own group (faq.html#coffee etc.).
   Sources: the live shipping and refund policies on bewild.life, and the product data in products.js.
   confirm: true marks an answer the team still has to check; it shows a small "To confirm" tag. */
window.BEWILD_FAQS = [
  { id: 'general', title: 'Orders & delivery', short: 'General', items: [
    { q: 'How much does shipping cost?',
      a: 'Shipping is free on every order within India above ₹1,000. Below that, shipping costs between ₹80 and ₹500, worked out at checkout from the final weight and size of your parcel.' },
    { q: 'How long will my order take to arrive?',
      a: 'Orders reach you within 7–10 days through a registered courier. We keep you posted by email and SMS at every step, and you can follow your parcel any time on <a href="track.html">Track your order</a>.' },
    { q: 'Can I cancel my order?',
      a: 'Many of our products are packed or processed fresh once you order, so write to us as early as you can. If your order has not been processed or dispatched yet, we will cancel it and refund you to the original payment method. Refunds take 7–10 working days to reach your account.' },
    { q: 'What if I’m not happy with what arrived?',
      a: 'Tell us on WhatsApp or by phone at <a href="https://wa.me/919154137599" target="_blank" rel="noopener">+91 91541 37599</a>, or email <a href="mailto:orders@bewild.life">orders@bewild.life</a>. We will work out what went wrong and put it right as quickly as we can.' },
    { q: 'How can I pay?',
      a: 'UPI, cards, netbanking and wallets. Every payment is secured by Razorpay.' },
    { q: 'Why can some 5 kg packs only be delivered in Hyderabad?',
      a: 'Our 5 kg rice packs are delivered only to Hyderabad pincodes. The smaller packs of the same rice ship across India, and the product page tells you which one reaches your pincode.' },
  ] },

  { id: 'coffee', title: 'Single origin coffee', short: 'Coffee', items: [
    { q: 'Which grind should I choose?',
      a: 'Pick the brewer you use: Aeropress, Channi, Cold Brew, Commercial Espresso or French Press, and we grind for it. If you grind at home, choose Whole Beans; they hold their aroma longest.' },
    { q: 'Why is all your coffee robusta?',
      a: 'All our coffee is Canephora (robusta), shade-grown at the Poomaale Collective in Coorg on rainforest-edge estates. Robusta gives a bold, full-bodied cup, and it suits the forest-integrated way our estates are farmed.' },
    { q: 'What do Naturals, Frozen Cherry, Anaerobic and Lactic mean?',
      a: 'They are the ways the coffee cherry is dried or fermented after picking. Each one shapes the taste of the cup differently; the flavour notes and recommended brew on each coffee’s page tell you what to expect.' },
    { q: 'How should I store my coffee once it’s open?',
      a: 'Keep it in an airtight container in a cool, dark place, away from heat and moisture, and enjoy it within a few weeks of opening for the best aroma. Avoid the fridge; it brings in moisture and smells.', confirm: true },
  ] },

  { id: 'grains', title: 'Native grains, cereals & pulses', short: 'Grains', items: [
    { q: 'Why does your rice look and cook differently from what I usually buy?',
      a: 'Our rice is naturally grown and minimally processed, and most of it is left unpolished, so it keeps its bran. That makes it richer in fibre, a little firmer and slower to cook. Soaking it for 30 minutes or more before cooking helps.', confirm: true },
    { q: 'Why are there neem leaves in my rice?',
      a: 'We store our rice the traditional way, with neem leaves, to keep it fresh and keep pests away without chemicals. Simply pick them out before you wash and cook the rice.' },
    { q: 'Is your toor dal polished?',
      a: 'No. Our toor dal is traditionally stone-ground to split it, with no polishing, preservatives or chemical treatments.' },
    { q: 'How should I store your flours?',
      a: 'Our flours are freshly milled in small batches with no preservatives, so store them in an airtight container in a cool, dry place and use them within a couple of months.', confirm: true },
  ] },

  { id: 'condiments', title: 'Artisan condiments', short: 'Condiments', items: [
    { q: 'My honey has crystallised. Is it still good?',
      a: 'Yes. Raw honey that is only minimally filtered crystallises naturally over time; it is a sign it has not been heated or processed. Stand the jar in warm (not hot) water and it will turn runny again.' },
    { q: 'How long do the laddus keep?',
      a: 'Our laddus are made without preservatives, so they are best eaten within a month. Keep them in an airtight container in a cool, dry place.' },
    { q: 'Do I need to refrigerate the pickle, jam or peanut butter?',
      a: 'Always use a clean, dry spoon. Keep the pickle and peanut butter in a cool, dry place, and refrigerate the jam once it is open.', confirm: true },
    { q: 'What do you sweeten with?',
      a: 'Brown jaggery, never refined sugar. Our Rosella Jam is rosella petals and jaggery with a little natural pectin, and our Peanut Butter is 99.9% roasted groundnuts with a touch of jaggery and no palm oil.' },
    { q: 'What is Kachampuli?',
      a: 'A dark, tangy souring agent from Coorg, made from the Garcinia gummi-gutta fruit. Ours is naturally fermented and concentrated in small batches at the Poomaale Collective, with no added colours, flavours or preservatives.' },
  ] },

  { id: 'spices', title: 'Whole(some) spices', short: 'Spices', items: [
    { q: 'Where are your spices grown?',
      a: 'Black pepper and green cardamom come from the Poomaale Collective in Coorg. Turmeric, red chilli and wild mustard come from the Hyderabad Collective.' },
    { q: 'What does “ungarbled” black pepper mean?',
      a: 'The peppercorns are not sorted or graded by size and colour after drying, so you get the whole harvest as it comes from the vine, sun-dried to keep its natural oils and aroma.' },
    { q: 'Is any colour added to the turmeric or chilli powder?',
      a: 'No. Our turmeric is 100% sun-dried turmeric and our chilli powder is 100% sun-dried red chillies, with no artificial colours, fillers or preservatives. Their colour is entirely their own.' },
    { q: 'How do I keep spices fresh?',
      a: 'Store them in airtight containers away from light, heat and moisture. Whole spices like pepper, cardamom and mustard keep their aroma far longer than powders; grind or crush them just before you cook.' },
  ] },

  { id: 'combos', title: 'Curated combos', short: 'Combos', items: [
    { q: 'What’s inside each combo?',
      a: '<b>Red Rice, White Rice</b>: Navara Red Rice and Indrayani Rice. <b>Millet Mithai</b>: Ragi Laddu and Bajra Laddu. <b>The Flour Family</b>: Bajra Flour, Whole Wheat Flour and Sprouted Ragi Mix. <b>Amma’s Spice Box</b>: Black Pepper, Green Cardamom and Turmeric Powder. <b>Sweet, Spicy &amp; Nutty</b>: Raw Honey, Peanut Butter and Tomato Pickle.' },
    { q: 'Do I save by buying a combo?',
      a: 'Yes. Each combo costs less than buying its products one by one, and every combo page shows exactly how much you save.' },
    { q: 'Can I change what’s in a combo?',
      a: 'Combos come packed as a set. To choose your own mix, use “Buy them separately” on the combo’s page and tick only the products you want.' },
    { q: 'Can I send a combo as a gift?',
      a: 'Yes. Add the combo to your basket, write your gift message in the basket note, and enter the recipient’s address at checkout. The note reaches us with your order.', confirm: true },
  ] },
];

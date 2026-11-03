---
version: alpha
name: Bewild-design-system
description: A hand-printed, forest-to-table storefront for Bewild, Beforest's produce brand. Everything sits on one warm cream paper sheet, edge to edge, with deep-red ink type, hand-drawn red woodcut illustrations and a single bright orange reserved for actions. One serif family (ABC Arizona Flare Variable) at only two weights, square corners everywhere, and natural photographs of the real collectives carry the story.

colors:
  frame: "#a6342a"          # the search panel border (the sheet and basket drawer no longer have a frame)
  paper: "#f7f1e8"          # page background (with paper noise)
  paper-2: "#efe6d8"        # quiet bands, image wells, avatars
  paper-card: "#fcf8f2"     # cards, inputs, panels
  ink: "#781d10"            # headings, primary text, borders on active elements
  ink-2: "#86291c"          # body text
  ink-soft: "rgba(120, 29, 16, 0.7)"   # secondary text
  ink-line: "rgba(120, 29, 16, 0.26)"  # borders, dashed dividers
  accent: "#fd6641"         # small action signals: basket hover and count, brew button, active steps, progress lines
  accent-deep: "#e04a26"    # labels (kickers), links, hover of accent, stars
  on-accent: "#fff7f0"      # text on accent and on button
  button: "#4b3c35"         # filled buttons: primary .btn, Add, the − n + quantity control
  button-hover: "#342e29"   # hover of filled buttons
  illustration: "#962820"   # the red the woodcut illustrations are drawn in; the floating WhatsApp button
  earth: "#2f251f"          # navigation bar, dark panels
  earth-2: "#3b2e27"        # mobile menu panel
  panel-red: "#8c2a1e"      # story panels (promise, brew band, combo total, empty reviews) — not yet a token
  on-panel: "#fff1e4"       # text on panel-red / earth
  on-panel-soft: "#f0d6c3"  # secondary text on panel-red
  on-panel-label: "#ffb194" # labels on panel-red

typography:
  display-hero: { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: "6.5cqi (≈94px at 1440)", fontWeight: 400, lineHeight: 1, letterSpacing: -0.015em }
  display-page: { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: "clamp(40px, 4.6vw, 70px)", fontWeight: 400, lineHeight: 1.02, letterSpacing: -0.015em }
  heading-2:    { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: "clamp(34px, min(4.3vw, 7.2svh), 66px)", fontWeight: 400, lineHeight: 1.02, letterSpacing: -0.015em }
  heading-3:    { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: "clamp(21px, 1.8vw, 25px)", fontWeight: 400, lineHeight: 1.12 }
  lead:         { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: "clamp(18px, 1.5vw, 21px)", fontWeight: 300, lineHeight: 1.5 }
  body:         { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: 18px, fontWeight: 400, lineHeight: 1.55 }
  body-light:   { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: 16.5px, fontWeight: 300, lineHeight: 1.6 }
  kicker:       { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: 12.5px, fontWeight: 400, lineHeight: 1, letterSpacing: 0.22em, textTransform: uppercase }
  label-sm:     { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: 12px, fontWeight: 400, letterSpacing: 0.12em, textTransform: uppercase }
  button:       { fontFamily: "ABC Arizona Flare Variable, serif", fontSize: 19px, fontWeight: 400, lineHeight: 1 }

spacing:
  page-gutter: "clamp(22px, 5vw, 80px)"     # --pad
  section: "clamp(52px, 9svh, 96px)"        # --chap-pad, space above each chapter
  nav-gap: "clamp(10px, 1.4vw, 22px)"       # gap around the floating nav bar
  grid-gap: "clamp(16px, 2vw, 26px)"
  card-padding: 12px

rounded:
  none: 0px        # everything
  circle: 50%      # only true circles: round icon buttons, step numbers, map pins, ratio dots

components:
  button-primary:   { backgroundColor: "{colors.button}", textColor: "{colors.on-accent}", rounded: "{rounded.none}", padding: "17px 32px", typography: "{typography.button}", hover: "{colors.button-hover}, lifts 2px" }
  button-ghost:     { backgroundColor: transparent, textColor: "{colors.ink}", border: "1.5px inset {colors.ink}", rounded: "{rounded.none}" }
  link-arrow:       { textColor: "{colors.ink}", underline: "1.5px {colors.ink-line}", hover: "underline turns {colors.accent}" }
  nav-bar:          { backgroundColor: "{colors.earth} at 97%", border: "1.5px {colors.accent} at 45%", position: "sticky, inset by {spacing.nav-gap}", textColor: "#f3dccb" }
  product-card:     { backgroundColor: "{colors.paper-card}", border: "1.5px {colors.ink-line}", rounded: "{rounded.none}", padding: "{spacing.card-padding}", hover: "border {colors.ink}, lifts 3px" }
  badge:            { backgroundColor: "{colors.paper-card}", textColor: "{colors.ink}", border: "1.2px {colors.ink}", typography: "{typography.label-sm}" }
  save-tag:         { backgroundColor: "{colors.paper-card}", textColor: "{colors.accent-deep}", border: "1.2px {colors.accent-deep}", typography: "{typography.label-sm}" }
  tab:              { border: "1.5px {colors.ink}", textColor: "{colors.ink}", active: "background {colors.ink}, text {colors.paper}" }
  story-panel:      { backgroundColor: "{colors.panel-red} + paper noise", textColor: "{colors.on-panel}", labels: "{colors.on-panel-label}" }
---

## Overview

Bewild sells forest-grown produce from Beforest's collectives (Coorg, Hyderabad, Ratapani, Mumbai). The site is built to feel like a **hand-printed sheet of paper**: one cream sheet (`{colors.paper}` with a fine noise texture) sits inside a brick-red frame (`{colors.frame}`), and every section flows down that one sheet rather than stacking separate slides.

Type is set in **deep-red ink** (`{colors.ink}`), never black. Decoration is **hand-drawn red woodcut illustration** (coffee branch, rice, fern, bird, mushrooms). Real places are shown in **natural-colour photographs**. One bright **orange** (`{colors.accent}`) is the only loud colour and is kept for things you can do.

**Key characteristics**
- Cream paper + red ink + dark earth buttons, with orange kept for a few small action signals. Nothing else is saturated.
- One serif family, ABC Arizona Flare Variable, at **300 and 400 only**. No italics, no bold.
- **Square corners** on everything; circles only where the thing is genuinely round.
- The story comes first: origin, the collective and the people appear on the pages where people decide to buy.
- Pages are full-width; the navigation bar floats inside the sheet and sticks on scroll.

## Colors

### Brand & Accent
- **Button** (`{colors.button}` #4b3c35, hover `{colors.button-hover}` #342e29): every filled button — primary buttons, Add, Checkout, Subscribe, the − n + quantity control The floating WhatsApp button is illustration red (`{colors.illustration}` #962820) with a white icon.
- **Accent / Orange** (`{colors.accent}` #fd6641): the basket hover and count, the coffee brew button, the active brew step, progress lines. Nothing decorative.
- **Accent Deep** (`{colors.accent-deep}` #e04a26): kickers (small uppercase labels), links, star ratings, the Save tag.
- **Frame** (`{colors.frame}` #a6342a): the border around the search panel. The page sheet and the basket drawer have no red frame.

### Surface
- **Paper** (`{colors.paper}`): every page background, always with the paper noise texture.
- **Paper 2** (`{colors.paper-2}`): quiet wells (product image backgrounds, avatars).
- **Paper Card** (`{colors.paper-card}`): cards, inputs, side panels.
- **Panel Red** (`{colors.panel-red}` #8c2a1e): full story panels — Our Promise, Brew it at home, Buy them separately total, "Be the first to review", Track help strip, Return to Nature. Text on it is `{colors.on-panel}`.
- **Earth** (`{colors.earth}`): the navigation bar and its dropdown.

### Text
- **Ink** (`{colors.ink}`): headings and primary text.
- **Ink 2** (`{colors.ink-2}`): body text.
- **Ink Soft** (`{colors.ink-soft}`): secondary text, metadata.
- **Ink Line** (`{colors.ink-line}`): borders and dashed dividers.

## Typography

### Font Family
**ABC Arizona Flare Variable** only, served from Beforest's font store (woff2):
- 300 Light: `https://isdbyvwocudnlwzghphw.supabase.co/storage/v1/object/public/fonts_beforest_arizona/ABCArizonaFlare-Light.e9c1597c.woff2`
- 400 Regular: `https://isdbyvwocudnlwzghphw.supabase.co/storage/v1/object/public/fonts_beforest_arizona/ABCArizonaFlare-Regular.cbcc518c.woff2`

`font-family: "ABC Arizona Flare Variable", serif;` — labels use the same family (`--font-label`).

### Hierarchy
| Style | Size | Weight | Used for |
| --- | --- | --- | --- |
| display-hero | 6.5cqi | 400 | Home hero "From Forest Roots to Your Table" |
| display-page | clamp(40px, 4.6vw, 70px) | 400 | Page titles (Contact, Recipes, Journal, Track) |
| heading-2 | clamp(34px, 4.3vw, 66px) | 400, emphasis words 300 | Section headings |
| heading-3 | clamp(21px, 1.8vw, 25px) | 400 | Card and block titles |
| lead | clamp(18px, 1.5vw, 21px) | 300 | One line under a heading |
| body | 18px | 400 | Running text |
| body-light | 16.5px | 300 | Longer descriptions, review text |
| kicker | 12.5px, 0.22em, uppercase | 400 | Small label above a heading |
| label-sm | 12px (minimum for any text), 0.12em, uppercase | 400 | Badges, tags, small captions |

### Principles
- Emphasis inside a heading is the **300 weight**, not italics ("Cook with your *heart & hands*" = 400 + 300).
- Only 300 and 400 exist. `font-synthesis: none` stops the browser faking bold or italic.
- Section leads stay short: one line on wide screens.

## Layout

### Spacing System
- Page gutter `{spacing.page-gutter}`, section rhythm `{spacing.section}`, grid gaps `{spacing.grid-gap}`.
- Headings: kicker → heading → one lead line → content.

### Grid & Container
- One full-width sheet (`.sheet` → `.paper`, no frame padding). No side illustrations, no brown margins.
- Product grids: auto-fill, min 240px per card. Horizontal rows ("You may also like") scroll with round arrow buttons.
- Product detail: gallery left, buy panel right, facts row full width under both.

### Whitespace Philosophy
Generous space between sections; dense, aligned information inside cards. Sections are separated by space or a single dashed rule, never by boxes.

## Elevation & Depth
Flat paper first. Shadows are soft and warm, used only to lift:
- Cards on hover: `0 24px 36px -26px rgba(120, 29, 16, .55)`.
- Floating nav bar: `0 14px 28px -18px rgba(0, 0, 0, .65)`.
- Primary buttons: an inner 3px bottom shade `inset 0 -3px 0 rgba(0, 0, 0, .12)`.
- Red panels: an inner vignette `inset 0 0 60px rgba(0, 0, 0, .2)` with the paper noise.

## Shapes

### Border Radius Scale
- `{rounded.none}` (0px): cards, buttons, inputs, tags, panels, images, the basket, dropdowns. **Always.**
- `{rounded.circle}`: round icon buttons (carousel arrows, basket close), step numbers, map pins, star/ratio dots, the cart count.

### Photography & Illustrations
- **Photos of places and people are natural colour.** No red/duotone overlay. Where text sits on a photo, use only a dark bottom fade: `linear-gradient(180deg, rgba(20,12,8,0) 40–50%, rgba(20,12,8,.8–.85) 100%)`.
- **Product packs** are transparent cut-outs on `{colors.paper-2}` / `{colors.paper-card}`, with a soft drop shadow.
- **Illustrations** are the hand-drawn red woodcut set (`assets/img/*.png`, hero `hero-art.png`, footer `footer-forest.png`). Used large in the hero and footer, small and occasional elsewhere; never covering text or products.
- Logos: `bewild-logo-light.png` on dark (nav), `bewild-logo.png` on paper (footer).

## Components

### Navigation
Dark earth bar floating inside the sheet (inset by `{spacing.nav-gap}`), sticky on scroll. Logo left, links centred (Shop ▾ with collections dropdown · Origins · Combos · Our Story · Recipes · Blog · Contact), then a quiet underlined "Track order", a square **search** button and Basket right with an orange count. Phones: "Menu" opens a single panel, with "Track your order" as its last item. A "Skip to content" link appears on keyboard focus.
Collection names are the same everywhere (menu, shop filters, footer, home tabs): Single Origin Specialty Coffee · Native Grains, Cereals and Pulses · Whole(some) Spices · Artisan Condiments · Curated Combos.

### Buttons
- **Primary** (`{component.button-primary}`): dark earth (`{colors.button}`), square, arrow icon that nudges right on hover.
- **Ghost** (`{component.button-ghost}`): ink outline; fills ink on hover.
- **Link arrow**: text with a thin underline that turns orange on hover.

### Product Card
Whole card links to the product (the name's link stretches over the card). Above that link and still clickable: the size/grind selector and Add.
Contents: image well with pack, badge (roast/process, top-left) and Save tag (top-right) → origin · weight row (kicker style) → name → one-line sub → option selector or dashed "pack" chip → price + **Add**.
After adding, **Add becomes − n +** in the same place and always matches the basket; reaching 0 brings back Add.

### Tags / Badges
- **Badge** (`{component.badge}`): cream, ink border, small uppercase.
- **Save tag** (`{component.save-tag}`): same shape, deep-orange text and border, "SAVE ₹233". No circles, no rotation.

### Tabs / Filters
`{component.tab}`: outlined square buttons with a small count; active = filled ink.

### Product detail pages (three layouts)
- **product.html** (everyday produce), **coffee.html**, **combo.html** — each has its own CSS/JS file so changes stay page-specific.
- Photo (wider screens): fixed size, up to 600px tall (never taller than the screen minus the header). It pins 104px from the top, under the floating header, while the buy panel scrolls past, and stops where the buy panel ends, so it never covers the facts row. Phones: photo on top, nothing pinned.
- Photo viewer: hovering the photo shows a zoom-in cursor; clicking (or Enter) opens it full screen on cream, as large as the screen allows, with three round buttons centred at the bottom — previous · close · next — and a "2 / 4" count top-left. Arrow keys, Esc, swipe on phones; clicking the empty area closes it.
- Buy panel: region kicker → short name → rating line → one-line benefits → price ("Taxes included · free shipping above ₹1,000") → size buttons → quantity + Add to basket → Buy now → payment strip (cream, thin border): "UPI, cards, netbanking and wallets" · lock icon "Secured by Razorpay" (no COD — not offered; text only, no logos) → one quiet line "Free shipping above ₹1,000 · Delivered in 7–10 days · Shipping & returns" → Storage note (when the product has one). Shipping is said only here and in the basket's free-shipping meter.
- Subscription (coffee and 5kg rice only, 5kg after a valid pincode): a dashed box between Add to basket and Buy now, "+ Subscribe · delivered every month" ("& save X%" once SUB_SAVE is set in main.js). Opens to the product, size/grind × quantity and "Start on WhatsApp" with the order pre-filled, until a Shopify subscription app is connected.
- Sold out: dashed "This harvest has sold out" box, then **Notify me** (email field + button); thanks message replaces the form.
- One facts block per page. Everyday produce: the row under the gallery (Pack · Grown by · up to four product facts). Coffee: no row; "Know your coffee" holds Roast, Process, Origin, Grown at, Variety, Pack, and the flavour notes stay under the name only. Combos: no row; "In this combo" and the combo panel carry the contents and saving. The chemical-free promise used to live in the ribbon only; the ribbon was removed (2026-11-02), so for now it is not said on product pages.
- Story: two paragraphs, then "Read more". Beside it the region photo ("Shop more from …") and, for non-coffee products, the recipe card. Reviews show 3 at a time; "You may also like" is one row of 4.
- "You may also like" shows only products that can be bought today; under it, "Recently viewed" (up to 4, newest first, kept in the visitor's browser).
- 5kg packs (Hyderabad-only): a "Delivery pincode" field + Check above the buttons; Add and Buy now stay off until a pincode starting 500 is checked. Wrong pincode: "Sorry, the 5kg pack is delivered only within Hyderabad. The smaller pack ships across India." A 5kg pack added from a shop card sends the visitor to its page to check first.
- Phones: a **buy bar** slides up from the bottom (name, price, Add) once the buy panel scrolls away.
- Not found: "This harvest has moved on" plus four in-season products.
- Coffee: "Know your coffee" (notes on one line + fact strip) and the **Brew it at home** band (cup drawing that fills step by step, dose presets, timer with "Watch it brew" ≈10s preview and "Brew for real").
- Combos: Buy them separately (each item ticked and priced) with a red panel whose main button is **Add the combo** (price + saving) and whose outline button is "Add separately" → The story with "In this combo" → Reviews → other combos.

### Reviews
Laid out like Judge.me on bewild.life: "Customer Reviews" → average · 5→1 bar breakdown · Write a review → Sort by → reviews listed one under another (stars, date, avatar + name + VERIFIED, title, text, photo thumbnails). Empty state: five empty stars, "Be the first to write a review", button. Sizes of one product share their reviews.

### Basket drawer
The only basket (there is no separate basket page). Checkout must open Razorpay Magic Checkout on the live Shopify theme (via Razorpay's Shopify app script); in this static build it uses Shopify's cart link as a stand-in.
A dialog from the right (focus moves in, Tab stays inside, Esc closes). Scrolling part: items (with ~~was~~ price on discounted packs) → combo-overlap note if any → "You save ₹X" → free-shipping meter in a cream box ("Add ₹X more for free shipping") → **"Goes well with your basket"**: one swipeable row of up to 4 small cards (photo, name, price, Add) — returning visitors: up to 2 recently viewed first; then Coffee Blossom Honey, then pairings for what is in the basket (coffee → Rosella tea, cardamom; rice → toor dal, turmeric…), in stock and not already in, no Hyderabad-only packs → "+ Add a note for us" (500-character counter). At the end of the scroll (not pinned), after the suggestions and the note: Subtotal · Checkout · lock "Secured by Razorpay · UPI, cards, netbanking and wallets". Empty basket: bird, "Your basket is empty — the forest is waiting.", Shop the harvest, then "Recently viewed" (up to 3) and "New this season" (Coffee Blossom Honey).

### Search
Square outline button in the header (or press /). Opens a frame-red panel under the header: big cream search field, then results as you type, up to six (thumbnail · name · collection or roast · origin · price · Add, or "Sold out"). Empty field shows "Try" chips (Coffee, Rice, Honey, Millet, Pepper, Combos); no match shows a plain sentence with a link to the shop. Every word must match the start of a word in the name, collection, origin, notes or facts. Esc closes; arrow keys move through results.

### No ribbon
The scrolling dark ribbon (`.ribbon`) was removed from every page on 2026-11-02 at the owner's request. Its CSS is kept so it can be put back exactly; don't add it to new pages unless asked.

### Gifting banner (home)
Full sheet width directly under the hero (outside `.chapters`), **3:1**, the shape of the photo (at least 340px tall). Only the **Shop gift boxes** button is a link (to `gifting.html`), and only the button reacts on hover; the photo and band stay still.
The backdrop is the **terracotta still-life photo** (`assets/img/gifting/banner-terracotta.webp`, 1200px `banner-terracotta-1200.webp` for ≤ 900px; source "Terracotta Bewild Gift Box Still Life.png"): the Bewild box on a stone slab on the right, line-drawn branch and swirls on the left edge. Ink rules top and bottom, a dashed inner rule in faint cream, a soft dark shade from the left behind the copy. No cut-outs or woodcut on top of the photo.
Left, on the empty wall (inset 15% so it clears the drawn branch and swirls; 11% at ≤ 1200px, where the line wraps to two): kicker in pale peach "New · Festive gift boxes" · heading in cream "Gifts that carry *the forest home*" · spaced uppercase line in cream "Four boxes · Each lit with a brass diya" · **Shop gift boxes** as a cream button with ink text. On hover the button lifts and turns white. ≤ 900px: the copy sits on its own terracotta panel (`#a5421f`, the wall colour) with the photo below it at 16:10 (5:4 at ≤ 640px, cropped so the whole box shows), and the photo's top edge fades into the panel.

### Festive gift boxes (gifting.html)
The collection page for the gift boxes, linked from the home banner button and "Festive Gift Boxes" in the Shop menu and footer. The boxes are products in the `gifting` category, kept in `assets/js/gift-boxes.js` (loaded after products.js on every page) until they are on Shopify; **names, prices and variant ids there are placeholders**. Each box's page is combo.html: the gallery shows the open box photo (full bleed), the closed box, then the pack of each product inside (contained, like other packs); the story is the box's own two paragraphs with one of its products' line drawings beside it (cardamom, peanut, pepper, ragi), and the list reads "In this box".
Top: crumbs (Shop / Festive Gift Boxes), then the **same terracotta photo banner as the home page** (`.gift-banner--hero`): kicker "New · Festive gifting" · h1 "Festive / *Gift Boxes*" on two lines · "Four boxes · Each lit with a brass diya" wrapped to two lines so it stops short of the bowl. No button and no cut-outs.
"The boxes · Choose *a box*": one **compact row per box** (photo 5/12, at most 360px tall, alternating sides; stacked on ≤ 900px): "Box 01" · name · one-line tagline · dashed rule · "Inside" as one line of names joined by " · " (products, then the diya/spoon) · price · **View details** button to the box's page. No Add on this page: people buy from the box's page. Only the button reacts on hover.
"The box itself · Worth keeping *after*": the closed box and the dragonfly outer pack side by side, a short line, and "Choose a box" back up to the cards.

### Recently viewed (home)
Only for returning visitors: "Recently viewed · Pick up where you left off", one row of up to 4 in-stock product cards, just above "Discover our seasonal produce". First-time visitors never see it.

### Story cards (home, "Twelve seasons of care")
Twelve steps in two pages of six (3 across × 2 rows), with round arrows and "Steps 1–6 of 12"; an arrow greys out at either end. Card front (cream, ink border, 214px tall): a 46px line icon drawn in ink (map, sprout, seeds in hand, tractor, sowing hand, watering can, shears, basket, seed jar, winnowing tray, house, speech bubble) · step number top-right · title · one or two lines. On hover (tap on phones, Enter on keyboard) the card lifts 5px with a soft ink shadow while its text fades out and the step's photo fades in over it. Phones: 2 across. No orange.

### Recipe cards (home)
Arrows and "All 30 recipes" sit in the heading row, under the lead. Three cards in view. Each card: borderless photo (4:3.8, slight zoom on hover) with its type as a small cream tag top-left and the Bewild staple as a 60px pack sticker bottom-right (ink border; hover slides out "Made with Peanut Butter", the short product name without any bracketed part, and links to the product) · recipe name (up to 2 lines, underline on hover) · one quiet meta line. The whole card opens the recipe. No orange text. Phones: 2 in view.

### Community voices (home)
Three equal cards: photo (16:10) · five ink stars · one short quote in the display face, word for word · dashed rule · initials in an outlined square, name, "Hyderabad Collective member". No links, no product strip, no red panel, no orange stars. Phones: cards swipe sideways (78% wide).

### As seen on (home)
Logos only, centred: three in the first row, two in the second (Deccan Chronicle, The Hindu BusinessLine, Hindustan Times / The New Indian Express, Outlook Traveller). Each sits in a cream tile with a thin border, in greyscale; hover brings back its colour and lifts the tile; each links to its story. "View all 13 mentions" below, linking to bewild.life/pages/media. Phones: two per row.

### In the news page (media.html)
Centred head ("In the news" · "Our forests in the papers" · count line), then all 13 mentions from bewild.life/pages/media as cards, 3 across (2 on tablets, 1 on phones). Card: logo tile (greyscale, its own colours on hover) · paper name · headline in quotes in the display face · "Read the article ↗" / "See the clipping ↗" / "Read the PDF ↗". The whole card opens the story in a new tab. Linked from the home "View all 13 mentions" and from the footer (About › In the news).

### FAQ page (faq.html)
Centred head ("Questions & answers" · "Good to know" · one lead line), then a row of square tabs (General · Coffee · Grains · Condiments · Spices · Combos, each with its count) that sticks under the nav and selects the group in view. Each group: kicker + title on the left, its questions on the right (ink rule on top, dashed rules between, number · question · chevron; the answer opens in place). Closes with the red "Still wondering?" panel and its see-through WhatsApp and email buttons. All questions live once in `assets/js/faqs.js`; an answer still to be checked carries `confirm: true`, shows a dashed "To confirm" tag and is left out of the FAQPage structured data. `faq.html#coffee` (etc.) opens that group's first question. Linked from every product page (a dashed line above "You may also like": "Questions about our coffee? · Read the FAQ"), the basket (under the payment line: "Shipping, cancellations & refunds"), the Contact head and the footer (Help › FAQ).

### Footer
Left: logo, the one-line description under it, then © and Privacy · Terms; Shop · About · Help sized to their content with equal gaps. Right: "Stay a little wild." signup, with the Instagram, Facebook and YouTube buttons under the email box.

### Journey timeline (Our Story)
Four numbered stops under the map, one pattern each: place (display face) + one quiet line — Coorg / Since 2019 · 3 collectives, Hyderabad / Since 2020, Ratapani / Growing now, Mumbai / Seed community. A solid dark-red line fills along the dashed one as you read towards each stop; visited stops are filled dark-red dots, the current one has a ring. Map pins carry the same numbers and only the place name (dates live in the timeline). Route, moving dot and current pin are dark red — no orange. Phones: numbered dots + place names, no second line.

### Welcome offer (10% off first order, lead generation)
Card (cream, square, dark-red top rule, a single etched leaf top-right): "A welcome note from Bewild" · "10% off your first Bewild order." · "Tell us where to send your first-order coupon." · dashed row "First order coupon … 10% off" · Email (required) · WhatsApp +91 (optional, 10 digits) · consent checkbox (required) · orange "Send my 10% off coupon" · "Maybe later". After sign-up: "Your 10% off is ready." · check-box note "It is already added to your basket and applied at checkout. Nothing to copy or enter." · "We have also sent your code (WELCOME10) to <email>, in case you shop from another device." · Start shopping. Home page only, once: ~5 s after arriving or after scrolling half a screen; never over the basket, search or photo viewer; "Maybe later"/× rests it 7 days; never again after sign-up. Phones: bottom sheet. Sign-ups go to the Shopify customer list (tags newsletter, welcome10, whatsapp; WhatsApp number in the note).
Basket: dashed "10% off your first order. Get it now ↓" opens a short form in place (email, WhatsApp optional, consent, "Apply 10% off"). Once signed up: "✓ 10% off applied with your first-order code WELCOME10.", a "First-order discount (WELCOME10) − ₹X" line, Total after the discount, and Checkout carries ?discount=WELCOME10 (Shopify confirms the first-order rule at checkout). The code is never shown publicly and never has to be copied.

### Honey jar
A cut-out photo of the Coffee Blossom Honey jar (`assets/img/honey-jar.webp`, clear glass kept see-through) floats above the WhatsApp button on browsing pages (home, shop, recipes, blog, our story). It appears after scrolling 60% of a screen, sways gently, and one small bee loops around it (in front, then behind). Tap or hover opens a card: tagline kicker · name · 200g · price · Add · View · × (hidden for the visit). Hidden when the honey is in the basket or sold out; hidden on phones while the buy bar shows. Still with reduced motion.

### Text motion
`assets/js/motion.js`, story moments only (never prices, buttons, forms or the basket): hero lines rise, section heads arrive kicker → heading → light words → lead, "Food carries the memory…" appears word by word, quotes and promises one line at a time, plain-number facts count up. Ease `cubic-bezier(.16,1,.3,1)`, blur + rise. Off with reduced motion; a position check backs up the observer so text never stays hidden.

### Story Panels
Full-width `{component.story-panel}` blocks for moments that matter (Our Promise, Brew band, Four Returns active panel, empty reviews, track help).

## Do's and Don'ts

### Do
- Use `{colors.button}` for filled buttons; keep orange for the few small action signals listed under Accent.
- Keep corners square; use circles only for genuinely round things.
- Use ABC Arizona Flare Variable at 300 and 400; emphasise with 300.
- Show real places in natural colour and name the collective near the product.
- Keep one idea per section and one short lead line under each heading.
- Give every new page type its own CSS/JS file when it needs its own behaviour.

### Don't
- No rounded corners on cards, buttons, inputs, tags or images.
- No italics, no bold, no other fonts or weights.
- No red/duotone overlays on photographs.
- No orange for decoration, backgrounds or text emphasis.
- No grid-paper or ruled-line backgrounds, no illustrations in the left/right margins, no brown edges outside the sheet.
- No big round sale stickers; no labels inside the brew dial.
- No invented reviews or content — copy real data from bewild.life.

## Responsive Behavior

### Breakpoints
- **≤ 1180px**: wide multi-column sections reduce columns; nav links tighten.
- **≤ 900px**: nav collapses to "Menu"; product detail stacks (gallery above buy panel); story/brew sections stack.
- **≤ 640px**: single-column content; filter tabs scroll sideways; brew band and reviews stack fully.
- Short desktop screens (`max-height: 820px`) get tighter vertical spacing.

### Touch Targets
Buttons and quantity controls are at least 40–44px tall. The − and + on cards are full-height 40px cells.

### Collapsing Strategy
Rows become horizontal scrollers with arrow buttons on desktop and swipe on phones; side-by-side panels stack in reading order (story → action).

## Iteration Guide
1. Start from the tokens above (`:root` in `assets/css/style.css`); never type a new hex value.
2. New section = kicker + heading (400 with a 300 phrase) + one lead line + content.
3. Reuse the product card, tabs, badges and story panel before inventing a component.
4. If something should be page-specific, put it in that page's own CSS/JS (`product.css`, `coffee.css`, `combo.css`…).
5. Check every new page at 1440 × 900, 1180 and 375 wide; nothing may scroll sideways.
6. Respect `prefers-reduced-motion`: animations must have a still fallback.

## Known Gaps
- **Notify me** saves requests in the visitor's browser only; `NOTIFY_ENDPOINT` in main.js must point at a real service (e.g. the store's back-in-stock app or an email list) before launch.
- Each coffee has one brew recipe in the store data, so the brew guide does not change with the chosen grind.
- **Panel red `#8c2a1e`** and its on-panel text colours are hard-coded in about 15 places, not yet CSS tokens.
- **Nav text colour `#f3dccb`** is hard-coded.
- Form error/success states are only partly designed (contact and track pages).
- The Journal post and Recipe pages were built from bewild.life content; long-form styles beyond them are not defined.
- The live store will run this as a Shopify theme with Judge.me; Judge.me's own widget styling must be set to match the Reviews spec above.

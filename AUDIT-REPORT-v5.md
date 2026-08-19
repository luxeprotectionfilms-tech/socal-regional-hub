# LUXE × Gravity Garage SoCal Hub — Sales + SEO Audit & Implementation

**URL:** https://gravitygarage.luxeprotectionfilms.com/
**Date:** 19 August 2026
**Build:** v5 — **NOT DEPLOYED.** Backup of the live v4 taken before any change.

---

## 1 · What was wrong

**Indexing (Phase 1)**

The page is technically healthy. The genuine problem is not blocking — it is
that the page is **new, orphaned, and has no measurement**.

| Check | Finding |
|---|---|
| noindex / nofollow | None. No meta robots tag exists at all. |
| Googlebot meta | None — nothing targeted at it. |
| X-Robots-Tag header | **Cannot exist.** GitHub Pages provides no mechanism to set custom response headers, so this class of problem is structurally impossible here. |
| Canonical | Self-referencing and correct. |
| robots.txt | `Allow: /`, no Disallow, sitemap declared. |
| Sitemap | Valid, 1 URL, correctly declared. |
| HTTPS | Serving. |
| Staging / login wall / IP restriction | None. Static public hosting. |
| WordPress noindex settings | **Not applicable** — this subdomain is not WordPress. It is static files on GitHub Pages, entirely separate from the main site's WordPress install. |
| Indexed in Google? | **No.** An exact-match search for the domain returns nothing. Expected — the page went live hours ago. |

**Two real defects found:**

1. **The street address was not in the crawlable HTML.** It was injected by
   JavaScript at runtime; the static markup a non-rendering crawler receives
   said only "Southern California". For a page whose entire purpose is ranking
   for *PPF Santa Clarita / Valencia*, the NAP being JS-dependent is a
   material local-SEO defect. **Fixed** — the full address is now in the
   static HTML.

2. **The page leaked its own traffic.** Every product card and every colour
   range linked outbound to luxeppfilms.com. A local prospect who clicked
   any of them left the hub and landed in LUXE's national shop, where the
   local lead is lost. This is exactly the problem you identified about the
   colour deck, and it applied to the whole product section.

**Conversion (Phases 3–5)**

- One generic contact form served every audience. A vehicle owner and a shop
  buying rolls filled in the identical five fields.
- No vehicle capture at all — no year, make, model, service, or timeframe.
- No trade capture — no company, city, business type, volume, or brand.
- CTA language was appointment-oriented ("Request a Showroom Visit"), not
  sales-oriented. No "Get a PPF Quote" anywhere. No "Buy LUXE film locally".
- No measurement of anything.

---

## 2 · What I changed

**Positioning and SEO (Phases 2, 6)**

| Element | Before | After |
|---|---|---|
| Title | LUXE Protection Films — Southern California Regional Hub \| Gravity Garage | LUXE PPF Southern California \| Santa Clarita & Valencia Hub \| Gravity Garage |
| H1 | Southern California's LUXE Regional Hub | LUXE PPF, stocked in Southern California |
| Eyebrow | LUXE Protection Films · Southern California | Santa Clarita · Valencia · Southern California |
| Meta description | Generic hub description | Buy-or-install intent, names Color Series / Gloss Is Boss / Stealth Matte and the two cities |
| OG / Twitter | Partial | Full OG + Twitter card set |
| Geo meta | None | geo.region, geo.placename, geo.position, ICBM |

Local terms appear naturally in the H1, eyebrow, section headings and body —
no stuffing. The visible NAP still matches the Google Business Profile
exactly ("Valencia"), because NAP consistency outranks keyword placement;
"Santa Clarita" carries in copy and headings instead.

**Conversion architecture (Phase 3)**

CTAs now run: **Get a PPF Quote** (primary, gold) → **Buy LUXE Film Locally**
(secondary) → **Installers & Dealers** (professional). Nav CTA and mobile
action bar both changed to "Get a PPF Quote".

The contact section is now **two separate forms behind a tab switcher**, so
the split is obvious before anyone types:

- **Vehicle Owner** — name, email, phone, vehicle year / make / model,
  desired service, film interest, colour interest, timeframe, comments.
- **Installer & Dealer** — name, company, email, phone, website or Instagram,
  city, state, business type, current PPF brands, LUXE product interest,
  local pickup interest, account interest, estimated monthly usage, notes.

Every CTA opens the correct tab and scrolls to the tab bar — not the top of
the section, which left the two choices below the fold on a laptop. Deep
links work: `/#quote` and `/#trade` open the matching form directly, so
outreach emails and Instagram bio links can target a lane.

**The colour deck — your point (Phases 4, and your follow-up)**

All 26 finishes are now **interactive**. Tapping one opens the vehicle-owner
form with that colour pre-filled, the product preset to Color Series and the
service preset to Color change PPF. The enquiry lands in the Gravity system
instead of bouncing to the LUXE catalogue.

The deck carries its own **"Contact Gravity Garage"** CTA plus "Check Local
Availability". Every outbound luxeppfilms.com link is demoted from a primary
action to a small grey "Specs" link, and each product card gained a local
"Check local availability" button as its primary action. Outbound clicks are
tracked separately as `outbound_luxe_catalogue`, so the remaining leak stays
measurable.

**Inventory-led selling (Phase 4)**

New "LUXE film available in Southern California" block showing the four
stocked *categories* — Color Series, Gloss Is Boss, Stealth Matte, Specialty.
Those are verifiable.

A second block for **specific colours on hand** is built and wired to
`site-config.js`, but ships **empty and hidden**. I did not populate it with
the example colours from your brief, because publishing a specific stock list
that has not been confirmed against the manifest is exactly what the project
rules prohibit. Send me the confirmed list and it switches on. No quantities
or pricing anywhere.

**Structured data (Phase 7)**

Upgraded `AutoBodyShop` → **`AutomotiveBusiness`**, plus a `WebSite` block.
Added geo coordinates, `areaServed` (Southern California, Santa Clarita,
Valencia, Los Angeles), `makesOffer` for PPF installation / colour change /
LUXE film, `parentOrganization` → LUXE, and `brand`. Both blocks validate as
JSON. **No invented fields** — no ratings, no reviews, no price range.

**Tracking (Phase 9)**

Events now fire for: `cta_click` (with which CTA), `contact_tab`,
`color_deck_select` (with colour name), `outbound_luxe_catalogue`,
`call_click`, `directions_click`, `instagram_click`,
`product_outbound_click`, `form_submit` (with audience + inquiry type),
`form_error`, and three distinct conversion events — `lead_ppf_quote`,
`lead_installer_dealer`, `lead_film_availability`.

UTM capture happens on page load and persists for the session, so a visitor
arriving from an Instagram campaign who clicks through two sections before
submitting still carries the correct source. Every submission also carries
`lead_source`, `page_url`, `referring_url`, `landing_page`, and a timestamp.

**Mobile (Phase 11)**

Fixed: colour chips became buttons but kept 19px chip padding — far under the
44px tap minimum. Now 44px on phones. Fixed anchored jumps landing under the
sticky header.

Verified across iPhone SE, 14 and 14 Pro Max: zero horizontal scroll, zero
tap targets under 40px, no overflowing elements, action bar never covers the
submit button, tap-to-call works, chip tap routes into the form correctly.

---

## 3 · What I did NOT change

- Design system, colours, typography, photography, layout, responsive
  behaviour. No redesign.
- The footer legal disclaimer — untouched, as instructed.
- **The main LUXE WordPress site.** Nothing touched. See Phase 8 below.
- The Google Business Profile.
- Any CRM automation — there is none connected to change.
- The live site. **v5 is not deployed.**

A full backup of the deployed v4 was taken before any edit
(`BACKUP-v4-live.tar.gz`). Six files changed: `index.html`, `main.css`,
`main.js`, `forms.js`, `site-config.js`, `sitemap.xml`.

---

## 4 · Search Console — verification required, not guessed

**I cannot verify this.** Search Console requires your Google login, which I
do not have. Per your instruction not to guess, here is what to check and
what each answer means.

Open **search.google.com/search-console** and look at the property list:

- **If `luxeprotectionfilms.com` appears as a Domain property** (no
  `https://` prefix shown) — the subdomain is already covered. Nothing to
  create. Submit the sitemap and run URL Inspection.
- **If only `https://www.luxeprotectionfilms.com/` appears** (URL-prefix) —
  the subdomain is **not** covered. Add a new URL-prefix property for
  `https://gravitygarage.luxeprotectionfilms.com/`. Verification is easiest
  via a DNS TXT record on the DigitalOcean zone, which you already control,
  or via the GA4 tag once one exists.

Then, in that property:
1. Submit `https://gravitygarage.luxeprotectionfilms.com/sitemap.xml`
2. Run **URL Inspection** on the homepage. Record: on Google?, crawled?,
   discovered?, user-declared vs Google-selected canonical, coverage state,
   last crawl date.
3. **Request Indexing** — but only after Phase 8 below, because a brand-new
   orphaned subdomain with zero inbound links is the single biggest reason it
   will sit undiscovered.

---

## 5 · Phase 8 — internal linking (needs your approval)

I audited the main site. **The installer locator cannot do this job.**

`luxeprotectionfilms.com/installer-locator/` loads its results via
JavaScript and currently reports "Number Of Shops: 0". Even if Gravity Garage
were added to that database, it would very likely not produce a crawlable
HTML link — which is the entire point of the exercise. Adding the hub there
is still worth doing for customers, but it will not solve discovery.

I did not touch the WordPress site, per your instruction. Three options,
least disruptive first:

1. **A plain text link in the main site's footer** under Resources or
   Company — e.g. "Southern California Regional Hub". One link, crawlable,
   sitewide, no navigation restructure. **My recommendation.**
2. **A section on `/become-a-dealer/`** — highly relevant context: shops
   reading that page are exactly the trade audience, and a "Buying in
   Southern California? Contact the SoCal hub" block converts as well as it
   crawls.
3. **A regional-hubs page** — most future-proof if more hubs are planned,
   but it is a new page and a navigation decision.

Any of these takes minutes in WordPress. Tell me which and I will write the
exact block; I will not edit the main site without you saying so.

---

## 6 · Phase 10 — lead routing (blocked, and this is the critical one)

**Where both forms currently go: nowhere.** `formEndpoint` is empty, so both
forms fall back to opening the visitor's own email client addressed to
`corporate@luxeprotectionfilms.com`. That means no archive, no delivery
confirmation, no attribution, and no routing. There is no existing CRM
workflow to document, because none is connected.

The site side is finished and waiting. Every submission already carries an
`audience` field of exactly **`Retail`** or **`Trade`** — that single field is
all a Zoho rule needs:

- `audience = Retail` → Gravity operational contact
- `audience = Trade` → Heidi + LUXE visibility

Plus `inquiry_type`, `hub`, full UTM set, and page/referrer. Confidential LUXE
account information is never exposed to the page; recipients are configured at
the endpoint, never in public markup.

To finish this I need one Zoho Forms or Zoho CRM webform endpoint URL. Set
`formEndpoint`, set `formEncoding: "form"` (Zoho expects form encoding, which
is already supported and tested), and it is live.

---

## 7 · Anything that could stop this page generating leads

Ranked by severity.

1. **No form endpoint.** Every enquiry currently depends on the visitor
   having a working mail client and choosing to send. On mobile, from
   Instagram, most will not. **This is the single biggest leak.**
2. **No inbound links.** An orphaned subdomain may sit undiscovered
   indefinitely. Phase 8, one footer link, fixes it.
3. **No analytics.** You cannot tell whether Heidi's outreach works. GA4 ID
   is a one-line change; every event is already wired.
4. **Search Console not confirmed.** Cannot see crawl status or request
   indexing without it.
5. **Colour availability block is empty.** The strongest merchandising asset
   on the page is switched off until stock is confirmed.
6. **No dedicated hub email or named staff contact.** Leads route to
   corporate by default.

Items 1–4 are all blocked on things only you can provide. Nothing else stands
between this page and working.

---

## 8 · Still needs your decision

- Zoho endpoint URL → unblocks lead capture
- GA4 Measurement ID (LUXE-owned) → unblocks measurement
- Search Console property type → verify, then submit sitemap
- Which internal-link placement on the main site (recommend: footer)
- Confirmed list of locally stocked colours → switches on the merchandising block
- Dedicated hub email + named contact
- Whether the "LUXE official Color Deck" you mentioned means a PDF/physical
  deck to link or embed. I built the on-page interactive deck routing into
  Gravity's forms. If there is also a PDF, send it and I will host it on the
  hub — not link to LUXE's copy, so the download stays a hub touchpoint.

---

## 9 · Verification performed

| Check | Result |
|---|---|
| JS console errors | 0 |
| Both forms submit with correct payloads | pass |
| Retail vs Trade audience separation | pass |
| CTA → correct tab | pass |
| Colour chip → form prefill (colour, product, service) | pass |
| Deep links `/#quote`, `/#trade` | pass |
| UTM survives internal navigation | pass |
| Zoho form-encoded submission path | pass |
| Contrast, 35 text samples | all pass AA |
| Inventory copy over photo (rendered pixels) | 19.7:1 |
| Images loading | 16/16, zero broken |
| Broken anchors / duplicate ids / H1 count | 0 / 0 / 1 |
| Horizontal scroll, 3 iPhone sizes | 0px |
| Tap targets under 40px | 0 |
| Action bar vs submit button | clear |
| JSON-LD, both blocks | valid |
| Reduced motion | all content visible |

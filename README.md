# LUXE Protection Films — Southern California Regional Hub

Landing page for **gravitygarage.luxeprotectionfilms.com**

Static site. No build step, no framework, no package manager. Semantic HTML,
modern CSS, vanilla JavaScript. Deploys directly to GitHub Pages.

---

## 1 · Go-live checklist

There are **three** things to fill in before launch. All three live in one file:

```
assets/js/site-config.js
```

| # | Field | What it is | Where to get it |
|---|-------|------------|-----------------|
| 1 | `address`, `phone`, `phoneE164`, `hours`, `directionsUrl`, plus the four structured-data address fields | Gravity Garage business details | From Gravity Garage |
| 2 | `formEndpoint` + `fallbackEmail` | Where lead submissions are delivered | Create under a **LUXE-controlled** account (see §4) |
| 3 | `analyticsId` | Google Analytics 4 Measurement ID | Create under a **LUXE-controlled** GA4 property |

Anything left as `PENDING` will render as visible placeholder text on the live
page. Nothing breaks — but it will be obvious, by design, so it can't ship
half-finished by accident.

**You do not need to edit `index.html`.** The config values are applied to the
page, the footer, the mobile action bar, and the JSON-LD structured data
automatically at load.

---

## 2 · Deploying to GitHub Pages

1. Create a repository under the **LUXE** GitHub organization (not a personal
   account — this keeps the deployment under LUXE control).
2. Push the entire contents of this folder to the `main` branch, at the
   repository root. The `index.html` must sit at the top level, not inside a
   subfolder.
3. In the repository: **Settings → Pages**
   - Source: *Deploy from a branch*
   - Branch: `main` / `/ (root)`
4. Still under **Settings → Pages → Custom domain**, enter:
   ```
   gravitygarage.luxeprotectionfilms.com
   ```
   The included `CNAME` file already contains this value, so GitHub should
   pick it up automatically.
5. Tick **Enforce HTTPS** once the certificate has been issued (this can take
   up to an hour after DNS resolves).

### DNS record

At the DNS host for `luxeprotectionfilms.com`, add:

| Type | Name | Value |
|------|------|-------|
| CNAME | `gravitygarage` | `<luxe-org>.github.io` |

Replace `<luxe-org>` with the GitHub organization name. This record must be
created on the LUXE-controlled DNS zone — that's what keeps the subdomain
under LUXE's control regardless of who maintains the page content.

---

## 3 · File structure

```
/
├── index.html                  Homepage — all content
├── 404.html                    Not-found page
├── CNAME                       Custom domain for GitHub Pages
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md                   This file
└── assets/
    ├── brand/
    │   ├── luxe-logo-white.png / @2x.png    Transparent LUXE lockup, light marks
    │   ├── luxe-logo-dark.png  / @2x.png    Transparent LUXE lockup, dark marks
    │   └── icon-32 / -180 / -512.png        Favicons & touch icons
    ├── css/
    │   ├── reset.css           Baseline normalization
    │   ├── tokens.css          Design tokens — colors, type, spacing, motion
    │   └── main.css            All component and layout styles
    ├── js/
    │   ├── site-config.js      ★ THE ONE FILE TO EDIT
    │   ├── main.js             Nav, scroll header, reveals, config injection
    │   └── forms.js            Validation, submission, status messaging
    └── images/
        ├── *.jpg / *.webp                   Facility photography (desktop)
        ├── *-mob.jpg / *-mob.webp           Mobile-optimized variants
        ├── products/                        Film packaging photography
        └── social/og-luxe-gravity-hub.jpg   Open Graph share image
```

---

## 4 · Forms and lead ownership

Forms post JSON to whatever URL is set as `formEndpoint`.

**Set this up under a LUXE-owned account.** Whoever owns the form endpoint owns
the lead data. The recommended path:

1. Sign up at [formspree.io](https://formspree.io) using a LUXE email address.
2. Create a form, copy its endpoint URL (looks like
   `https://formspree.io/f/xxxxxxxx`).
3. Paste it into `formEndpoint` in `site-config.js`.
4. Add Gravity Garage's address as a **notification recipient** inside
   Formspree, rather than as the account owner. Gravity Garage gets every lead
   in real time; LUXE retains the archive, the export, and the ability to
   change routing at any point.

Any endpoint accepting a JSON `POST` works — Netlify Forms, a Zapier catch
hook, a custom handler. The shape of the payload:

```json
{
  "form": "contact",
  "purpose": "Request an installation quote",
  "name": "...",
  "email": "...",
  "phone": "...",
  "vehicle": "...",
  "message": "...",
  "page": "https://gravitygarage.luxeprotectionfilms.com/",
  "submitted": "2026-08-01T00:00:00.000Z",
  "_subject": "LUXE SoCal Hub — Request an installation quote — Jane Doe",
  "_replyto": "..."
}
```

`form` is either `contact` or `availability`, so the two forms stay
distinguishable in the inbox. The two underscore-prefixed keys are Formspree
conventions — they make the notification subject line readable and make
**Reply** go straight back to the enquirer. Any other endpoint simply ignores
keys it doesn't recognise.

If `formEndpoint` is left blank the forms fall back to opening the visitor's
email client with everything pre-filled, addressed to `fallbackEmail`. The site
remains fully functional either way — it just loses the tracking and the
archive.

### Two forms on the page

| Form | Location | Purpose |
|------|----------|---------|
| `#availabilityForm` | Inventory section | Quick "is this film in stock" check |
| `#mainForm` | Contact section | Everything else — routed by the purpose dropdown |

CTAs across the page carry a `data-purpose` attribute. Clicking one scrolls to
the contact form **and pre-selects the matching purpose**, so the visitor
doesn't restate what they already told you by clicking.

---

## 5 · Analytics

Set `analyticsId` in `site-config.js` to a GA4 Measurement ID
(`G-XXXXXXXXXX`) created under a **LUXE-owned** property. Grant Gravity Garage
*Viewer* access to that property — they see performance, LUXE keeps ownership
of the data and the tag.

If the field is left blank, **no analytics script loads at all**.

Note that the page still makes one unrelated third-party request regardless:
the Archivo and Inter webfonts are loaded from Google Fonts. If LUXE wants a
zero-third-party page, self-host those two families in `assets/fonts/` and
replace the `fonts.googleapis.com` `<link>` in `index.html` with local
`@font-face` rules. The page already falls back cleanly to Helvetica/Arial if
Google Fonts is unreachable.

Events tracked automatically:

| Event | Fires on |
|-------|----------|
| `call_click` | Any tap-to-call link, including the mobile bar |
| `directions_click` | Any Get Directions link |
| `form_submit` | Successful form submission (includes form name + purpose) |
| `form_error` | Failed submission |

---

## 6 · Editing content

All page copy is plain text inside `index.html`, in clearly commented sections:

```
HEADER · HERO · CREDENTIALS · HUB · INVENTORY · FILMS ·
INSTALLATION · LANES · ABOUT · CONTACT · FOOTER · ACTION BAR
```

### Adding or changing a film line

Film cards live in the `#films` section as `<article class="film-card">`
blocks. Copy an existing one and change the heading, the tagline, and the
description. The card grid reflows on its own — no layout changes needed.

The film availability dropdown in `#availabilityForm` should be kept in sync
with whatever lines are shown.

### Swapping a photograph

Each image uses a `<picture>` element with four sources: WebP and JPEG, in
desktop and mobile widths. To swap one out, replace all four files while
keeping the filenames. If you'd rather use new filenames, update all four
`srcset` paths in that `<picture>` block.

Recommended widths when generating replacements: **1800px** desktop,
**1100px** mobile, quality ~82.

---

## 7 · Content and compliance guardrails

The copy on this page was written to stay inside specific lines. If it gets
edited, keep these intact:

- **No invented testimonials, reviews, or customer quotes.** There are none on
  the page. Don't add any that aren't real and attributable.
- **No wholesale or dealer pricing displayed publicly.** Pricing conversations
  route through the contact form.
- **No exact inventory quantities.** The page says film is stocked locally. It
  does not claim specific roll counts, which would go stale immediately and
  create a promise the shop can't always keep.
- **No exclusivity claims.** Gravity Garage is described as *a* regional hub,
  never as the only authorized anything.
- **No implied joint ownership or legal partnership.** The footer states
  plainly that Gravity Garage is an independently owned and operated business
  and that LUXE Protection Films is the manufacturer and brand owner. Keep that
  disclaimer in place — it's the sentence that keeps the relationship
  accurately described.
- **Warranty language.** Only **Gloss Is Boss** carries the 10-year warranty
  statement on this page, because that is the only line LUXE's own site states
  it for: *"Backed by a comprehensive 10-year warranty for lasting peace of
  mind"* (luxeprotectionfilms.com/paint-protection-film/). Every other line
  uses the neutral wording *"Warranty coverage on approved installations"* and
  links to LUXE's warranty terms. Don't generalize the 10-year term across
  other lines without written confirmation from LUXE.

- **Relationship wording.** Gravity Garage is described as *a regional hub* —
  never as a "distributor", a "distributor partner", or "the appointed" or
  "exclusive" anything. Those words imply either resale rights or territory
  exclusivity, neither of which a consignment arrangement grants. The only
  place the word "partner" appears is in the footer disclaimer, where it is
  being *denied*. Keep it that way.

---

## 8 · Accessibility

Built to WCAG 2.1 AA:

- Skip-to-content link, landmark regions, one `<h1>`, ordered headings
- Visible focus rings on every interactive element (never removed, only styled)
- Form labels bound to inputs. Each error slot has a real `id`, carries
  `role="alert"`, and is wired to its field via `aria-describedby` — the link
  is added when the error appears and removed when it clears
- Body and UI text meets 4.5:1 contrast against its background. **Gold is never
  used for body text on black** — it fails contrast at small sizes. It's
  reserved for large display type, CTA fills, and rules.
- All animation is suppressed under `prefers-reduced-motion: reduce`
- Tap targets are 44px minimum; primary buttons are 52px
- Fully operable by keyboard, including the mobile nav (focus trap + Escape)

If you add anything, the two easiest things to break are contrast and focus
visibility. Check both.

---

## 9 · Browser support

Chrome, Edge, Safari, Firefox — current and previous major versions. iOS
Safari 15+ and Android Chrome. No polyfills required; no JavaScript feature is
used that isn't broadly supported.

The page degrades gracefully without JavaScript: all content is visible, all
links work, forms fall back to mailto. Only the reveal animations, the mobile
menu, and the config injection require JS.

---

## 10 · Known pending items

Done in this pass:

- [x] Business address — confirmed as **Valencia, CA 91355** against the public
      business listing (Valencia is the listed locality; Santa Clarita is the
      parent city, and the listing uses Valencia).
- [x] Phone — (818) 826-9695, confirmed against the listing.
- [x] Business hours — Mon–Fri 9:00am–5:00pm, Sat & Sun closed, taken from the
      published listing and mirrored into JSON-LD `openingHoursSpecification`.
- [x] Fallback email — set to `info@luxeprotectionfilms.com`.

Still open:

- [ ] **Form endpoint** — `site-config.js`. Until this is set, forms fall back
      to opening the visitor's mail client. Functional, but there is no lead
      archive and no delivery confirmation. This is the one item that costs you
      leads if it ships unset.
- [ ] **GA4 Measurement ID** — `site-config.js`. Optional; blank is a valid
      shipping state.
- [ ] **DNS `CNAME` record** on the `luxeprotectionfilms.com` zone.
- [ ] **Confirm the Gloss Is Boss 10-year warranty in writing** before it stays
      public. It is sourced from LUXE's own marketing page, not from a warranty
      document.
- [ ] **Resolve a film-thickness conflict.** This page states 7.8 mil for Gloss
      Is Boss, matching luxeprotectionfilms.com. But luxeppfilms.com states
      "8.0 mil protection". Two LUXE-owned sites disagree; one of them is wrong
      and should be corrected at the source.
- [ ] Optional: replace the extracted LUXE logo PNG with a vector `.svg` if one
      is located. The current lockup was keyed from a photograph of the wall
      banner and is clean at display sizes, but a true vector would be sharper
      at large scale and smaller in file size.
- [ ] Optional: self-host the webfonts (see §5).

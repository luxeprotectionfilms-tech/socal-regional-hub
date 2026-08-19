# Addendum — LUXE Color Deck, hub edition

**Build:** v6 — **NOT DEPLOYED**
**New page:** `/color-deck/` on the hub

---

## What you asked for, and what the problem actually was

You wanted the deck on the hub with CTAs pointing at Gravity Garage rather than
back into the LUXE ecosystem. Looking at it, the leak was wider than the deck:
**every product card and colour range on the homepage linked out to
luxeppfilms.com.** A Southern California prospect who clicked any of them left
the hub and landed in the national store, where the local lead is gone.

Both are now fixed.

---

## Where the data came from

Not invented. I pulled the deck's actual source from your Shopify store —
the connected store is `www.luxeppfilms.com`, and the deck lives in the body of
the "Digital Color Deck" page, not in a theme file or metaobject.

That gave me all **175 films** with real names, TPU codes, finish groups, hue
families, sprite-sheet coordinates, and the on-car render URLs.

Verified against the source before building:

| Finish | Source | Rebuilt |
|---|---|---|
| Gloss | 96 | 96 |
| Metallic | 26 | 26 |
| Satin & Matte | 28 | 28 |
| Liquid Metal | 13 | 13 |
| Specialty | 10 | 10 |
| Glow | 2 | 2 |
| **Total** | **175** | **175** |

Sprite positions are derived arithmetically (5 sheets, 6×6 tiles) and
spot-checked against the source at five indices including both ends. All match.

---

## What the hub version does differently

Same catalogue, same search-and-filter behaviour, same on-car renders. The
difference is entirely in where it sends people.

| | LUXE deck | Hub deck |
|---|---|---|
| Header CTA | Installer Portal → luxeppfilms.com | Get a PPF Quote → hub form |
| Footer | info@ + Installer Portal | Hub contact + hub forms |
| Colour click | Spec card, dead end | Spec card **+ three hub CTAs** |
| Outbound links to luxeppfilms.com | many | **zero** |

Clicking a finish opens a spec card with **Request this finish**, **Check local
availability**, and **Buying for a shop? Contact the hub**. Each carries the
colour and TPU code as a URL parameter into the matching form on the homepage,
so the enquiry arrives with the finish already attached and the visitor never
retypes it.

Verified end to end: clicking *Satin Cherry* lands on the quote form with
`Satin Cherry (TPU-6206)` in the colour field, Color Series and Color change
PPF preselected, and that value present in the submitted payload alongside
`audience: Retail`.

Deep links work too — `/color-deck/?code=TPU-5008` opens that finish directly,
so outreach can point at one specific colour.

---

## Why it is a separate page

Three reasons. It targets *LUXE color PPF Southern California* on its own URL
with its own title and meta. It takes your sitemap from one URL to two, which
matters because a single-URL sitemap looks thin. And it keeps the homepage from
growing to an unusable length.

The homepage keeps its 26-finish teaser with a **Browse All 175 Finishes**
button, and the deck is now in the nav.

Homepage product cards were also changed: **Check local availability** is now
the primary action on each, and the luxeppfilms.com link is demoted to a small
grey "Specs". Outbound clicks fire `outbound_luxe_catalogue` so the remaining
leak stays measurable.

---

## One thing I could not verify

**The colour swatches themselves.** They load as sprite sheets from
`cdn.shopify.com`, which my sandbox is blocked from reaching, so in my
screenshots the tiles are empty frames. Everything around them — layout,
search, filters, counts, modal, CTAs, routing — is verified working.

The sprite URLs are copied exactly from your live deck and the tile maths
checks out, so this should just work. But **please open `/color-deck/` first
thing after deploy and confirm the swatches appear.** If they do not, the cause
will be the CDN URLs, and it is a one-line fix.

Related: the deck depends on LUXE's Shopify CDN staying put. If those files are
ever moved or renamed, the hub deck greys out. Worth hosting the five sprite
sheets on the hub itself at some point — I would need them downloaded, since I
cannot reach the CDN from here.

---

## Verification

| Check | Result |
|---|---|
| Finishes rendered | 175 / 175 |
| Finish counts vs source | exact match, all six groups |
| Sprite position maths | verified at 5 indices |
| Filter — Liquid Metal | 13, correct |
| Search — "TPU-5008" | Satin Seaweed, correct |
| Modal name / code | correct |
| Colour carried into quote form | verified |
| Colour present in submitted payload | verified |
| Trade deep link with colour | verified |
| Outbound links to luxeppfilms.com | **0** |
| JS errors, both pages | 0 |
| Mobile horizontal scroll | 0px |
| Tap targets under 40px | 0 |
| Broken local references | 0 |
| Contrast, 35 samples | all pass AA |
| Swatch images rendering | **unverified — CDN unreachable from sandbox** |

---

## Deliverables

- `gravity-garage-luxe-site-v6.zip` — full build, 66 files, both pages
- `gravity-garage-PREVIEW-v6-colordeck.html` — deck preview, 147 KB
- `gravity-garage-PREVIEW-v6-home.html` — homepage preview

Both previews open by double-clicking. The deck data is inlined rather than
fetched specifically so it works from a local file.

Still not deployed, and still blocked on the same things: a form endpoint, a
GA4 ID, and the internal link from the main site.

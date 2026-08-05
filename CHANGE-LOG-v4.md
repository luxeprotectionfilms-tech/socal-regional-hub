# Revision v4 — Change Log

**Site:** gravitygarage.luxeprotectionfilms.com
**Date:** 5 August 2026
**Status: NOT DEPLOYED.** Held pending confirmation of five business details (§3).

Design, layout, photography, colour system and responsive behaviour are
unchanged. Every change below is copy, markup, or a targeted CSS/JS fix.

---

## 1 · Change log

### Relationship positioning

Every instance of the following is gone from the site — verified zero
occurrences across HTML, CSS and JS:

| Removed | Occurrences | Replaced with |
|---|---|---|
| "distributor partner" | 6 | regional-hub language |
| "appointed" | 1 | removed |
| "entrusted with the region" | 1 | rewritten heading |
| "under one roof" | 1 | rewritten heading |

The only surviving instance of the word "partner" is in the footer
disclaimer, where partnership is being expressly denied.

### Hero

New paragraph as specified. The two-CTA row became three primary routes —
Request a Showroom Visit, Request an Installation Quote, Dealer & Installer
Support — stacked full-width on phones so none get cramped. "Explore the
Collection" was dropped to make room; the Collection remains reachable from
the nav and from the scroll cue. Removed the claim that the complete LUXE
collection is stocked.

### Relationship section

Heading now "A LUXE regional hub, operated by Gravity Garage". Body and the
four bullets are your copy verbatim.

### Inventory

Headline now "LUXE inventory available locally", body copy as specified. No
inventory counts anywhere on the page.

**A real bug surfaced here.** The dark scrim over the inventory photograph
was set to a negative `z-index` inside its own parent, which paints it
*beneath* the non-positioned `<img>` rather than over it. The scrim has
never been doing anything — that section has been shipping white text
directly on a bright photograph. Fixed and re-tuned so the copy sits on a
near-black backdrop while the racking stays visible on the right.

Measured on actual rendered pixels, not computed CSS: white body text now
reads **19.7:1** against the brightest 1% of the backdrop behind it, gold
headings **10.3:1**. Thresholds are 4.5 and 3.0.

### Product collection

New intro including "Products shown on this page may not all be physically
stocked at the hub." Color Series lede replaced with the 40-finish wording —
the previous copy claimed swatches for all of them were held on site. All
five product paragraphs cut to two or three lines. Every "colour" → "color",
including the section id, the availability dropdown options, image alt text
and CSS comments.

### Installation

Opening copy replaced with your wording. Graphtec photograph confirmed
rendering at both breakpoints.

### Gravity Garage story → The Facility

Entire section replaced. Removed "Built by installers, for installers", the
craft narrative, the standard-that-refused-to-move line, and the three
invented era headings (Beginnings / Growth / Today) with their fabricated
founding history. Now three factual columns — Facility, Capability, Regional
Support — using your copy verbatim. Nav label changed from "Our Story" to
"The Facility". The unused story-override config keys were removed rather
than left as dead settings.

### About

Heading and both paragraphs replaced with your copy.

### Forms and lead routing

Every submission now carries: `lead_source`, `inquiry_type`, `page_url`,
`referring_url`, `landing_page`, `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `utm_term`, `submitted_at`.

UTM values are captured **on page load and held for the session**, not read
at submit time. This matters more than it sounds: a visitor arriving from an
Instagram campaign who clicks any internal link loses the query string, so
capturing at submit silently drops the attribution on nearly every real
lead. Verified — a visitor landing with campaign parameters, navigating to
two other sections, then submitting still carries the correct source.

Added consent disclosure and a link to the LUXE Privacy Policy beneath both
forms. Added a submission-speed trap alongside the existing honeypot. Error
message rewritten to be actionable.

Endpoint is provider-agnostic and now supports url-encoded submission
(`formEncoding: "form"`) as well as JSON, because Zoho Forms and Zoho CRM
webforms expect form encoding. Both paths tested.

Success message does **not** promise a confirmation email — an
`autoResponse` flag gates that wording, and it is off until an autoresponder
actually exists. Recipients are configured at the endpoint, never in public
markup.

### Booking language

Every "Book" → "Request": hero, nav CTA, showroom section, lanes, mobile
action bar, and the contact dropdown option. Confirmed each CTA still
preselects the matching inquiry type — this needed a corresponding fix to
the preselection map, which would otherwise have silently stopped matching
after the rename.

### Analytics

Added `instagram_click` and `product_outbound_click` (captures which film
line was clicked). Form events now carry `inquiry_type`, so showroom,
quote, availability and dealer submissions are separable in GA4. Existing
`call_click`, `directions_click`, `cta_click`, `form_submit`, `form_error`
retained. No analytics loads at all while `analyticsId` is blank.

### Mobile and visual

Hero paragraph shortened and vertical rhythm tightened. Headline set to
`text-wrap: balance` to stop awkward wrapping. Added document clearance for
the fixed action bar — it was overlapping the final form field, the submit
button and the footer disclaimer on phones. Anchor jumps no longer land
under the sticky header.

### Placeholders

"PENDING", "pending", and "(000) 000-0000" cannot render anywhere. If a
phone number is blanked in config, every phone affordance is now hidden
rather than showing a dead Call button.

### Footer

Unchanged, as instructed.

---

## 2 · One thing I did not change, and why

Item 6 specifies: *"Gravity Garage, **the** independently operated Southern
California regional hub for LUXE."*

I used your wording verbatim. But flagging it, because the definite article
does the same work as the phrases item 1 asks me to remove — "the … hub for
LUXE" reads as *the only one*, which is an exclusivity implication. Changing
"the" to "a" removes the ambiguity and costs nothing.

I did not make that change on my own initiative, since it is your approved
copy. Say the word and it is a one-character edit. The same applies to
item 8's "LUXE Protection Films' Southern California … hub", though the
possessive reads more naturally as descriptive than exclusive.

---

## 3 · Unresolved business details — required before deployment

Nothing here is guessed. Every disputed value is flagged in
`site-config.js` with both candidates, and the site degrades gracefully if
any is left blank.

| # | Item | Conflict | Currently set to | Needed |
|---|---|---|---|---|
| 1 | Hub phone | (818) 826-9695 vs (661) 241-8001 | (818), matches the public listing | Which is the public hub line |
| 2 | Instagram | @gravitygarage_ vs @ggmotorsportsla | @gravitygarage_ | Which account is official |
| 3 | Hours | Mon–Fri vs Mon–Sat by appointment | "Showroom visits by appointment" | Real schedule |
| 4 | Public business name | Gravity Garage vs GG Motorsports | Gravity Garage throughout | Legal + public-facing name |
| 5 | Hub email | none exists | falls back to corporate@ | Dedicated regional address |
| 6 | Address format | — | 27820 Fremont Ct, Ste 1, Valencia, CA 91355 | Confirm suite + Valencia vs Santa Clarita |
| 7 | Staff contact | unassigned | — | Named hub contact for lead routing |

**Two consequences worth understanding.**

Structured-data hours are now published as **empty**, not as Mon–Fri. Telling
Google a schedule that contradicts the Business Profile damages trust in
both. The human-readable line reads "Showroom visits by appointment" until
you confirm. Restore `openingHoursSpec` in `site-config.js` at the same time
you confirm hours.

The business-name conflict is the one with reach beyond the website. If the
legal entity is GG Motorsports, that affects the footer disclaimer, the
structured data, the Google Business Profile, and the consignment agreement —
the site should name whatever the signed agreement names.

---

## 4 · Form and analytics setup checklist

**Lead routing (do first)**

- [ ] Create the endpoint under a **LUXE-controlled** account — Zoho Forms or
      a Zoho CRM webform preferred, so leads land in LUXE's CRM directly.
- [ ] Set `formEndpoint` in `assets/js/site-config.js`.
- [ ] Set `formEncoding: "form"` for Zoho. Leave `"json"` for Formspree.
- [ ] Map these incoming fields in the CRM: `lead_source`, `inquiry_type`,
      `name`, `email`, `phone`, `vehicle`, `message`, `film`, `notes`,
      `page_url`, `referring_url`, `landing_page`, `utm_source`,
      `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
      `submitted_at`. These names are stable — changing them means remapping.
- [ ] Create four routing rules on `inquiry_type`: *Request a showroom
      visit*, *Request an installation quote*, *Check local film
      availability* / *Film availability check*, *Dealer or installer
      support*.
- [ ] Notifications to LUXE corporate, plus the Gravity Garage hub contact
      once assigned. Configure at the endpoint, never in the page.
- [ ] Enable the autoresponder, then set `autoResponse: true` so the success
      message tells people to expect it.
- [ ] Submit one test per inquiry type and confirm routing.

**Analytics**

- [ ] Create a GA4 property on a **LUXE-owned** Google account. Not Gravity
      Garage's.
- [ ] Set `analyticsId`. Grant Gravity Garage *Viewer* only.
- [ ] Mark as conversions: `form_submit`, `call_click`, `directions_click`.
- [ ] Verify in DebugView: `call_click`, `directions_click`,
      `instagram_click`, `cta_click`, `product_outbound_click`,
      `form_submit`, `form_error`.

**Search Console**

- [ ] Add `https://gravitygarage.luxeprotectionfilms.com` as a URL-prefix
      property; verify via the GA4 tag or a DNS TXT record on the
      DigitalOcean zone.
- [ ] Submit `/sitemap.xml`.
- [ ] Run the Rich Results test after contact details are confirmed.
- [ ] Confirm the Business Profile matches the site exactly on name, address,
      phone and hours.

Already verified in this build: canonical URL, robots.txt, sitemap.xml, 404
page, Open Graph image (1200×630), favicons, web manifest, and valid
LocalBusiness JSON-LD.

---

## 5 · Verification performed

| Check | Result |
|---|---|
| Banned terms across HTML/CSS/JS | 0 occurrences |
| "PENDING" / placeholder text renderable | none |
| Rendered contrast, inventory copy over photo | 19.7:1 white, 10.3:1 gold |
| Computed contrast, 34 text samples | all pass AA |
| Images loading, desktop + mobile | 16/16, zero broken |
| Internal anchors | all resolve |
| Duplicate element ids | none |
| `aria-describedby` on form errors | resolves to real elements |
| CTA → inquiry-type preselection | correct for all four |
| UTM capture surviving internal navigation | correct |
| JSON payload path | verified |
| Zoho-style form-encoded path | verified |
| Reduced-motion | all content visible |
| JS syntax, all three files | clean |
| JSON-LD | parses, valid |

---

## 6 · Deliverables

- `gravity-garage-luxe-site-v4.zip` — production files
- `gravity-garage-PREVIEW-v4.html` — single-file preview, opens anywhere
- Desktop and mobile section previews
- This change log

Deploy by pushing to `main` on
`luxeprotectionfilms-tech/socal-regional-hub` — **after** the five items in
§3 are confirmed. Push over git rather than the browser uploader; the web
drag-and-drop drops the `assets/` folder.

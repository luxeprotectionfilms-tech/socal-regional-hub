# Go-Live Runbook — gravitygarage.luxeprotectionfilms.com

**Build:** `gravity-garage-luxe-site-v3.zip`
**Prepared:** 5 August 2026
**Owner of every account created below: LUXE Protection Films.** That is the
whole point of the sequence — whoever owns the repo, the DNS record, the form
endpoint, and the analytics property owns the platform and the customer data.
Gravity Garage receives leads and access; it does not receive ownership.

---

## Before you start

You need three things in hand:

| # | Thing | Who creates it | Time |
|---|-------|----------------|------|
| 1 | A GitHub organization for LUXE (not a personal account) | LUXE | 5 min |
| 2 | Access to DNS for `luxeprotectionfilms.com` | LUXE | — |
| 3 | A Formspree account on a LUXE email address | LUXE | 5 min |

If you only have two of the three, deploy anyway. The site ships and works
without the form endpoint — it just falls back to opening the visitor's mail
client, which means no lead archive. Add the endpoint later; it is a one-line
change to one file, no redeploy of anything else.

---

## Step 1 · Set up lead delivery (do this first)

Do this before deploying, so the site is never live with unrouted forms.

1. Go to **formspree.io** and sign up using a **LUXE-controlled email address**.
   Not a Gravity Garage address. This account is the system of record for every
   lead the site produces.
2. Create a new form. Name it something like `LUXE SoCal Hub`.
3. Copy the endpoint URL. It looks like `https://formspree.io/f/xldpwkqz`.
4. Open `assets/js/site-config.js` in the unzipped build and set:

   ```js
   formEndpoint: "https://formspree.io/f/xldpwkqz",
   ```

5. Still inside Formspree, add Gravity Garage's email as a **notification
   recipient** — not as a team member or account owner. They get every lead in
   real time. LUXE keeps the archive, the export, and the ability to change
   routing at any moment without asking anyone.

Each submission arrives with a `form` field of either `contact` or
`availability`, so the two forms stay separable, and a subject line in the
shape `LUXE SoCal Hub — Request an installation quote — Jane Doe`. Hitting
**Reply** goes straight back to the enquirer.

---

## Step 2 · Create the repository

1. Under the **LUXE GitHub organization**, create a repository. **Make it
   Public.** On GitHub Free (including Free for organizations), Pages only
   publishes from public repositories — private-repo Pages requires Pro, Team,
   or Enterprise. Public here means the source files are visible, which for a
   static marketing page is not a real exposure: everything in this build is
   already served to every visitor's browser anyway. Nothing secret lives in
   the repo — the form endpoint is a public submission URL by design, and there
   are no keys or credentials.
2. Push the **entire contents** of the unzipped build to the `main` branch, at
   the repository root. `index.html` must sit at the top level — not inside a
   subfolder. This is the single most common way this step goes wrong.

The `CNAME` file in the build already contains
`gravitygarage.luxeprotectionfilms.com`, so GitHub will pick the domain up on
its own.

---

## Step 3 · Turn on Pages

In the repository: **Settings → Pages**

- Source: **Deploy from a branch**
- Branch: `main`, folder `/ (root)`

Then under **Settings → Pages → Custom domain**, confirm it reads
`gravitygarage.luxeprotectionfilms.com`.

---

## Step 4 · Add the DNS record

On the DNS zone for `luxeprotectionfilms.com`:

| Type | Name | Value |
|------|------|-------|
| CNAME | `gravitygarage` | `<luxe-org>.github.io` |

Replace `<luxe-org>` with the GitHub organization name — the org, not the
repository. This record must live on the LUXE-controlled DNS zone. That single
record is what keeps the subdomain under LUXE's control no matter who is
editing page content later.

DNS usually resolves within 15 minutes but is allowed up to 24 hours.

---

## Step 5 · Enforce HTTPS

Once DNS resolves, return to **Settings → Pages** and tick **Enforce HTTPS**.
The certificate can take up to an hour after DNS propagates. If the checkbox is
greyed out, DNS has not fully propagated yet — wait, don't retry the record.

---

## Step 6 · Verify before announcing

Walk this list on a real phone, not just a desktop browser:

- [ ] `https://gravitygarage.luxeprotectionfilms.com` loads over HTTPS with no
      certificate warning
- [ ] The hero photograph loads, and the page is legible on a phone
- [ ] Tap **Call** in the bottom bar — it dials (818) 826-9695
- [ ] Tap **Directions** — it opens Maps at 27820 Fremont Ct, Ste 1, Valencia
- [ ] Address and hours in the *Visit the Hub* block are correct, with no
      placeholder text anywhere on the page
- [ ] Submit the contact form with real details — confirm it arrives in
      Formspree **and** in Gravity Garage's inbox
- [ ] Submit the availability form — confirm it arrives tagged `availability`
- [ ] Click a **Request Dealer or Installer Support** button and confirm the
      contact form's dropdown is pre-selected to *Dealer or installer support*
- [ ] Paste the URL into a Slack or iMessage thread — confirm the share preview
      image and title appear

---

## Step 7 · Analytics (optional, do it after launch)

1. Create a GA4 property under a **LUXE-owned** Google account.
2. Copy the Measurement ID (`G-XXXXXXXXXX`).
3. Set it in `assets/js/site-config.js`:

   ```js
   analyticsId: "G-XXXXXXXXXX",
   ```

4. Grant Gravity Garage **Viewer** access to the property. They see
   performance; LUXE owns the data and the tag.

Left blank, no analytics script loads at all. That is a perfectly valid state
to launch in.

Events tracked once enabled: `call_click`, `directions_click`, `cta_click`,
`form_submit`, `form_error`.

---

## Step 8 · Google Business alignment

The page's structured data now publishes hours of Mon–Fri 09:00–17:00 with
weekends closed, matching the current public listing. **If those hours are
wrong, they are wrong in two places** — fix the Google Business Profile *and*
`site-config.js` together, or Google will see a conflict between the listing
and the page and may distrust both.

The same applies to the address. The page says **Valencia**, which is what the
listing says. If the Business Profile is ever changed to Santa Clarita, change
`address`, `addressLocality`, and the display copy to match.

---

## Making changes later

Everything an operator needs to change routinely lives in **one file**:
`assets/js/site-config.js` — address, phone, hours, directions link, Instagram,
form endpoint, analytics ID, and the optional Gravity Garage story text.

Page copy lives in plain text inside `index.html`, in commented sections.
Before editing copy, read **§7 Content and compliance guardrails** in
`README.md`. It exists because several of those sentences are load-bearing
legally, not stylistically.

Push to `main` and GitHub Pages redeploys within about a minute.

---

## Still open

- [ ] **Form endpoint** — the one item that costs leads if it ships unset.
- [ ] **GA4 Measurement ID** — optional.
- [ ] **DNS CNAME record** — Step 4.
- [ ] **Written confirmation of the Gloss Is Boss 10-year warranty.** It is
      currently sourced from LUXE's own marketing page, not a warranty
      document. It is the only warranty term stated on the site.
- [ ] **A film-thickness conflict between two LUXE-owned sites.**
      luxeprotectionfilms.com says 7.8 mil; luxeppfilms.com says 8.0 mil. The
      page currently follows 7.8. One of the two sites is wrong and should be
      corrected at the source.
- [ ] Optional: a vector `.svg` of the LUXE lockup, if one exists. The current
      PNG was keyed from a photograph of the wall banner.
- [ ] Optional: self-host the Archivo and Inter webfonts to remove the last
      third-party request on the page.

# Lead routing — Zoho CRM setup

**Status:** the website side is finished and tested. One endpoint URL turns it on.

---

## What the site already sends

Both forms now emit **Zoho's own field names**, checked against your live Leads
layout via the Zoho connection on `info@luxeprotectionfilms.com`. There is no
translation step to get wrong.

| Zoho field | Source | Notes |
|---|---|---|
| `First_Name` | First name | |
| `Last_Name` | Last name | Mandatory in Zoho — the form enforces it |
| `Email` | Email | |
| `Phone` | Phone | |
| `Company` | Company | trade form only |
| `City` / `State` | City / State | trade form only |
| `Website` | Website or Instagram | trade form only |
| `Lead_Source` | fixed: **"Website Leads"** | Must be this exact string — see below |
| `LV26_Business_Type` | Business type | Your existing custom picklist |
| `LV26_Monthly_PPF_Volume` | Monthly volume | Your existing custom picklist |
| `LV26_Role` | Role | Your existing custom picklist |
| `Description` | assembled | Vehicle, service, colour, campaign, page — one readable block |

Plus, for routing and reporting: `audience` (**Retail** or **Trade**),
`inquiry_type`, `hub`, `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `referring_url`, `landing_page`, `submitted_at`, and the
individual raw fields.

**Why the picklists matter.** `Lead_Source`, `LV26_Business_Type`,
`LV26_Monthly_PPF_Volume` and `LV26_Role` are all picklists in Zoho. A value
that is not on the list is silently discarded — the lead saves with the field
blank and nobody notices. So the website dropdowns were rewritten to match
your Zoho options word for word. "Window tint shop" became "Tint Installer",
"1–3 rolls" became "3–5 rolls", and so on. **Do not edit those dropdown labels
without changing the Zoho picklist to match.**

---

## Recommended: Zapier Catch Hook

You already have Zoho CRM connected to Zapier under
`info@luxeprotectionfilms.com`, which makes this the shortest path.

**Why not a native Zoho webform?** Zoho's webform endpoint expects a
traditional browser form POST with its own hidden tokens, and it does not
return the cross-origin headers a JavaScript submission from
`gravitygarage.luxeprotectionfilms.com` needs. The submission would fail in
the browser with a CORS error and the visitor would see an error message.
Zapier's catch hooks are built for exactly this and handle it correctly.

### Steps

1. **zapier.com → Create Zap**
2. **Trigger:** *Webhooks by Zapier* → **Catch Hook**. Copy the webhook URL.
3. Send one test submission from the live site so Zapier learns the field
   shape. All the names above will appear.
4. **Action 1 — Zoho CRM → Create/Update Module Entry**
   - Module: **Leads**
   - Map each Zoho-named field to itself. Because the names already match,
     this is mechanical.
   - Use **Create/Update** rather than plain Create, with Email as the
     duplicate check, so a repeat enquirer updates instead of duplicating.
5. **Action 2 — Email by Zapier → LUXE backup copy**
   - To: your LUXE archive address
   - Subject: `New SoCal hub lead — {{inquiry_type}} — {{First_Name}} {{Last_Name}}`
   - Body: include `Description`, phone, email, and the UTM fields.
   - This is your safety net. If the Zoho step ever errors, you still have
     the lead in an inbox.
6. **Action 3 — Filter → then Email to Gravity Garage**
   - Filter: continue only if **`audience` exactly matches `Retail`**
   - Then email the Gravity Garage contact.
   - This is the important control: Gravity receives the retail installation
     work, and **trade enquiries never reach them.** Installer and dealer
     leads are commercially sensitive — pricing conversations, competitors'
     brands, purchase volumes — and belong with LUXE.
7. **Turn the Zap on**, then paste the URL into
   `assets/js/site-config.js`:

   ```js
   formEndpoint: "https://hooks.zapier.com/hooks/catch/XXXXX/YYYYY/",
   formEncoding: "json",
   ```

   Leave `formEncoding` as `"json"` for Zapier. Only switch it to `"form"` if
   you later move to an endpoint that wants url-encoded fields.

8. Once the Zap's autoresponder or a Zoho workflow sends an acknowledgement
   email to the enquirer, set `autoResponse: true` in the same file. Until
   then the success message deliberately does not promise one.

**Note on cost:** Webhooks by Zapier is a premium trigger on Zapier's paid
tiers. If that is a blocker, Zoho Flow offers the same pattern natively —
a webhook trigger into a Create Lead action — and is included with most Zoho
One / CRM plans. The website works identically with either; only the URL
changes.

---

## Alternative: Zoho Flow

Same shape, stays inside Zoho:

1. Zoho Flow → Create Flow → Trigger: **Webhook**
2. Set the payload type to **JSON**, copy the webhook URL
3. Action: **Zoho CRM → Create Lead**, mapping the fields above
4. Action: **Send Email** for the LUXE backup
5. Decision on `audience = Retail` → **Send Email** to Gravity Garage
6. Paste the URL into `formEndpoint`, keep `formEncoding: "json"`

---

## Suggested assignment rules in Zoho

Once leads are landing, two rules make them self-managing:

- **Assignment rule on Leads:** if `audience` is `Trade` → assign to Heidi.
  If `Retail` → assign to whoever owns Gravity coordination.
- **Workflow on Lead create** where `Lead_Source = Website Leads`: set
  `Lead_Status` to `Not Contacted` and start a follow-up task due same day.
  Speed of first response is the single biggest predictor of whether an
  inbound lead converts.

---

## Testing before you announce anything

Submit one of each and confirm all three arrive:

- [ ] **Vehicle owner** quote form → Zoho Lead created, `audience` = Retail,
      vehicle and colour visible in Description, GG notified
- [ ] **Installer/dealer** form → Zoho Lead created, `audience` = Trade,
      `LV26_Business_Type` / `LV26_Monthly_PPF_Volume` / `LV26_Role`
      populated (not blank — blank means a picklist mismatch), **GG not
      notified**
- [ ] **Availability** form → Zoho Lead created, film line in Description
- [ ] Arrive via `?utm_source=instagram&utm_medium=social` first, browse to
      another section, then submit → campaign still recorded

That fourth test is the one people skip. It is also the one that proves
Heidi's outreach is measurable.

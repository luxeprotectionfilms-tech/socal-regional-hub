/* ============================================================
   site-config.js
   ────────────────────────────────────────────────────────────
   ★ THIS IS THE ONLY FILE YOU NEED TO EDIT TO GO LIVE. ★

   Everything below is applied automatically across the page,
   the footer, the mobile action bar, and the JSON-LD structured
   data. You do not need to touch index.html.
   ============================================================ */

/* CONFIRMED BY RAVI — 5 August 2026
   ────────────────────────────────────────────────────────────
   Phone ......... (818) 826-9695
   Instagram ..... @gravitygarage_
   Business name . Gravity Garage
   Hours ......... Mon–Fri 9:00am–5:00pm, weekends closed

   Still open: a dedicated hub email address (falls back to
   corporate@luxeprotectionfilms.com) and a named hub staff contact
   for lead routing. Neither blocks launch.

   If any value here is blanked out, the site hides that element
   rather than showing a placeholder.
   ============================================================ */

window.SITE_CONFIG = {

  /* ---------- 1 · BUSINESS DETAILS ------------------------ */

  // Displayed exactly as typed.
  address: "27820 Fremont Ct, Ste 1, Valencia, CA 91355",

  // Confirmed. Blank both to hide every phone affordance
  // (footer, Visit block, mobile Call button).
  phone: "(818) 826-9695",
  phoneE164: "+18188269695",

  // Displayed exactly as typed. Use \n for line breaks.
  hours: "Mon–Fri 9:00am – 5:00pm\nSaturday & Sunday closed",

  // Machine-readable hours for Google structured data (JSON-LD).
  // Confirmed by Ravi 5 Aug 2026. Keep in sync with `hours` above and
  // with the Google Business Profile — if these three disagree, Google
  // distrusts all of them.
  openingHoursSpec: [
    { days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "17:00" }
  ],

  // Full Google Maps link for the "Get Directions" buttons.
  // If left blank, the address above is used to build a search URL.
  directionsUrl: "",

  // Confirmed. Leave "" to hide the link entirely.
  instagramUrl: "https://www.instagram.com/gravitygarage_",


  /* ---------- 2 · STRUCTURED DATA (SEO) ------------------- */

  streetAddress: "27820 Fremont Ct, Ste 1",
  addressLocality: "Valencia",   // City
  addressRegion: "CA",
  postalCode: "91355",


  /* ---------- 2b · LOCALLY STOCKED COLORS ----------------- */
  /*
     Featured on the page under "Colors on hand right now".
     LEFT EMPTY DELIBERATELY — the page must not advertise stock that
     has not been confirmed against the inventory manifest.

     Add entries once LUXE confirms what is physically held, e.g.
       { name: "Nardo Circuit Gray", line: "Color Series · Gloss", hex: "#9a9c9b" },
       { name: "Satin Cherry",       line: "Color Series · Satin", hex: "#7d1220" },

     `hex` is an approximate UI swatch for the little colour dot only.
     It is not a colour-accurate representation of the film.
     Empty array => the whole block stays hidden.
  */
  stockedColors: [],


  /* ---------- 3 · FORM DELIVERY --------------------------- */
  /*
     Where form submissions are sent. Any endpoint accepting a POST
     works — Zoho Forms, a Zoho CRM webform, Formspree, a Zapier
     catch hook, or a custom handler.

     PREFERRED — a LUXE-controlled Zoho endpoint, so lead data lands
     directly in the CRM that LUXE owns.

     Zoho and most classic form handlers expect url-encoded fields
     rather than a JSON body. Set formEncoding to "form" for those.
  */
  formEndpoint: "",
  formEncoding: "json",          // "json" or "form"

  // Set to true only once the endpoint's autoresponder is switched on.
  // Controls whether the success message promises a confirmation email.
  autoResponse: false,

  // Zoho CRM's Lead_Source is a PICKLIST. This must be one of its allowed
  // values or Zoho silently drops it. "Website Leads" is the existing option.
  // The descriptive detail rides along in lead_source_detail and Description.
  leadSource: "Website Leads",

  // Used only for the mailto fallback when formEndpoint is blank.
  fallbackEmail: "corporate@luxeprotectionfilms.com",

  // Linked from the consent line beneath both forms.
  privacyUrl: "https://luxeprotectionfilms.com/privacy-policy/",


  /* ---------- 4 · ANALYTICS ------------------------------- */
  /*
     LUXE-owned Google Analytics 4 property.
     Paste the Measurement ID (looks like "G-XXXXXXXXXX").
     Leave blank to disable analytics entirely — nothing loads,
     no third-party requests are made.

     Must be a LUXE-owned property. Grant Gravity Garage Viewer
     access; do not use an analytics property they own.
  */
  analyticsId: ""

};

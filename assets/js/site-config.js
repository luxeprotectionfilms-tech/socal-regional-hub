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
   Phone ......... (661) 241-8001
   Instagram ..... @gravitygarage_
   Business name . Gravity Garage
   Hours ......... Mon–Fri 9:00am–5:00pm, weekends closed

   Still open: a named hub staff contact. Lead routing is NOT set
   here — see the form-delivery note below.

   If any value here is blanked out, the site hides that element
   rather than showing a placeholder.
   ============================================================ */

window.SITE_CONFIG = {

  /* ---------- 1 · BUSINESS DETAILS ------------------------ */

  // Displayed exactly as typed.
  address: "27820 Fremont Ct, Ste 1, Valencia, CA 91355",

  // Confirmed. Blank both to hide every phone affordance
  // (footer, Visit block, mobile Call button).
  phone: "(661) 241-8001",
  phoneE164: "+16612418001",

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

     `hex` is an approximate UI swatch for the little color dot only.
     It is not a color-accurate representation of the film.
     Empty array => the whole block stays hidden.
  */
  stockedColors: [],


  /* ---------- 3 · FORM DELIVERY --------------------------- */
  /*
     THERE IS NOTHING TO CONFIGURE HERE, AND THAT IS DELIBERATE.

     Forms post to the shared LUXE handler at
     forms.luxeprotectionfilms.com. That service decides who receives a
     lead from the request's Origin header — something a web page cannot
     forge — so the recipient never travels through the browser and a
     visitor cannot edit the page to redirect a submission.

     Consequences worth knowing before you go looking for a setting:

       · There is no formEndpoint, formEncoding, fallbackEmail or
         leadSource key any more. They were removed, not renamed. Any
         recipient address reachable from client JavaScript is readable
         and editable by anyone who opens devtools.
       · To change where Gravity Garage's leads go, edit GG_LEAD_EMAIL
         on the DigitalOcean app. It is an environment-variable change,
         not a code change and not a redeploy of this site.
       · Until that variable is set, the handler routes Gravity Garage
         leads to LUXE with the subject prefixed [ROUTING NOT SET].
         Leads are never dropped for want of configuration.

     The client contract lives in assets/js/forms.js and is three keys:
     endpoint, successMessage, errorMessage.
  */

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

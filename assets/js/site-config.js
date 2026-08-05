/* ============================================================
   site-config.js
   ────────────────────────────────────────────────────────────
   ★ THIS IS THE ONLY FILE YOU NEED TO EDIT TO GO LIVE. ★

   Everything below is applied automatically across the page,
   the footer, the mobile action bar, and the JSON-LD structured
   data. You do not need to touch index.html.

   Replace every value marked PENDING.
   ============================================================ */

window.SITE_CONFIG = {

  /* ---------- 1 · BUSINESS DETAILS ------------------------ */

  // Displayed exactly as typed. Example: "12345 Example Ave, Suite 1, Anaheim, CA 92805"
  address: "27820 Fremont Ct, Ste 1, Valencia, CA 91355",

  // Human-readable phone. Example: "(714) 555-0142"
  phone: "(818) 826-9695",

  // Same number in E.164 for tel: links. Digits only, leading +1.
  // Example: "+17145550142"
  phoneE164: "+18188269695",

  // Displayed exactly as typed. Use \n for line breaks if needed.
  // Example: "Mon–Fri 9:00am – 6:00pm · Sat by appointment"
  hours: "Mon–Fri 9:00am – 5:00pm\nSaturday & Sunday closed",

  // Machine-readable hours for Google structured data (JSON-LD).
  // Keep in sync with the `hours` string above. Omit closed days entirely.
  openingHoursSpec: [
    { days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "17:00" }
  ],

  // Full Google Maps link for the "Get Directions" buttons.
  // Easiest method: search the address on Google Maps → Share → Copy link.
  // If left blank, the address above is used to build a search URL.
  directionsUrl: "",

  // Gravity Garage social profiles (leave "" to hide the link)
  instagramUrl: "https://www.instagram.com/gravitygarage_",


  /* ---------- 2 · STRUCTURED DATA (SEO) ------------------- */
  // Used to fill the JSON-LD block. Improves Google Business results.

  streetAddress: "27820 Fremont Ct, Ste 1",
  addressLocality: "Valencia",   // City
  addressRegion: "CA",
  postalCode: "91355",


  /* ---------- 3 · FORM DELIVERY --------------------------- */
  /*
     Where form submissions are sent.

     RECOMMENDED — Formspree (free tier available, 5 min setup):
       1. Create an account at formspree.io using a LUXE-controlled
          email address (this keeps lead data under LUXE control).
       2. Create a new form. Copy the endpoint URL.
       3. Paste it below. Example:
          formEndpoint: "https://formspree.io/f/xldpwkqz"

     ALTERNATIVE — any endpoint that accepts a JSON POST.

     If this is left blank, the forms fall back to opening the
     visitor's email client with the details pre-filled, addressed
     to fallbackEmail below. The site still works either way.
  */
  formEndpoint: "",

  // Used only for the mailto fallback described above.
  fallbackEmail: "info@luxeprotectionfilms.com",


  /* ---------- 4 · ANALYTICS ------------------------------- */
  /*
     LUXE-owned Google Analytics 4 property.
     Paste the Measurement ID (looks like "G-XXXXXXXXXX").
     Leave blank to disable analytics entirely — nothing loads,
     no third-party requests are made.
  */

  /* ────────────────────────────────────────────────
     GRAVITY GARAGE STORY  (optional)
     Leave any value as "" to keep the default wording
     already written into index.html.
     ──────────────────────────────────────────────── */
  storyLede:   "",
  story1Year:  "",   story1Title: "",   story1Body: "",
  story2Year:  "",   story2Title: "",   story2Body: "",
  story3Year:  "",   story3Title: "",   story3Body: "",

  analyticsId: ""

};

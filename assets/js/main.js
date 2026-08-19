/* ============================================================
   main.js
   Config injection · header · nav · reveals · action bar · analytics
   No dependencies. No build step.
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var doc = document;

  // Defined properly in section 6; declared here because the CTA/tab wiring
  // above runs first and calls it.
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  /* ---------- helpers ---------- */
  function all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function one(sel, root) { return (root || doc).querySelector(sel); }
  function set(v) { return typeof v === "string" && v.trim() && v.trim() !== "PENDING"; }

  doc.documentElement.classList.remove("no-js");


  /* ══════════ 1 · APPLY SITE CONFIG ══════════ */

  function directionsHref() {
    if (set(CFG.directionsUrl)) return CFG.directionsUrl;
    if (set(CFG.address)) {
      return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CFG.address);
    }
    return null;
  }

  function applyConfig() {

    // Address
    if (set(CFG.address)) {
      all('[data-site="address"]').forEach(function (el) { el.textContent = CFG.address; });
    }

    // Hours (supports \n line breaks)
    if (set(CFG.hours)) {
      all('[data-site="hours"]').forEach(function (el) {
        el.textContent = "";
        CFG.hours.split("\n").forEach(function (line, i) {
          if (i) el.appendChild(doc.createElement("br"));
          el.appendChild(doc.createTextNode(line));
        });
      });
    }

    // Phone. If no number is configured, every phone affordance is removed
    // rather than left showing a placeholder — a dead "Call" button is worse
    // than no button, and a fake number is worse than both.
    if (set(CFG.phone) && set(CFG.phoneE164)) {
      all('[data-site="phone"]').forEach(function (el) { el.textContent = CFG.phone; });
      all('[data-site="phone-link"]').forEach(function (el) {
        el.setAttribute("href", "tel:" + CFG.phoneE164.replace(/[^\d+]/g, ""));
      });
    } else {
      all('[data-site="phone-link"]').forEach(function (el) {
        var row = el.closest("li") || el.closest("div");
        if (row && row.querySelector("dt")) { row.style.display = "none"; }
        else if (row && row.tagName === "LI") { row.style.display = "none"; }
        else { el.style.display = "none"; }
      });
    }

    // Directions links
    var dir = directionsHref();
    // Instagram (hide the link entirely when no URL is configured)
    all('[data-site="instagram"]').forEach(function (el) {
      var u = CFG.instagramUrl;
      if (u && u.trim() !== '') { el.setAttribute('href', u.trim()); }
      else if (el.parentNode) { el.parentNode.style.display = 'none'; }
    });

    // Privacy policy destination
    if (set(CFG.privacyUrl)) {
      all('[data-site="privacy"]').forEach(function (el) {
        el.setAttribute("href", CFG.privacyUrl);
      });
    }

    all('[data-site="directions"]').forEach(function (el) {
      if (dir) {
        el.setAttribute("href", dir);
      } else {
        // No destination yet — don't offer a dead link.
        el.setAttribute("aria-disabled", "true");
        el.style.opacity = ".55";
        el.style.pointerEvents = "none";
      }
    });

    // JSON-LD structured data
    var ld = one('script[type="application/ld+json"]');
    if (ld) {
      try {
        var data = JSON.parse(ld.textContent);
        if (set(CFG.phoneE164)) data.telephone = CFG.phoneE164;
        if (set(CFG.streetAddress))   data.address.streetAddress = CFG.streetAddress;
        if (set(CFG.addressLocality)) data.address.addressLocality = CFG.addressLocality;
        if (set(CFG.addressRegion))   data.address.addressRegion = CFG.addressRegion;
        if (set(CFG.postalCode))      data.address.postalCode = CFG.postalCode;
        if (dir) data.hasMap = dir;

        // Machine-readable opening hours for Google. Keep this in sync with
        // the human-readable `hours` string above — they are shown in
        // different places and Google reads this one.
        if (Array.isArray(CFG.openingHoursSpec) && CFG.openingHoursSpec.length) {
          data.openingHoursSpecification = CFG.openingHoursSpec.map(function (b) {
            return {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: b.days,
              opens: b.opens,
              closes: b.closes
            };
          });
        }

        ld.textContent = JSON.stringify(data);
      } catch (e) { /* leave original block intact */ }
    }

    // Copyright year
    var yr = one("#year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  applyConfig();


  /* ══════════ 2 · HEADER STATE ON SCROLL ══════════ */

  var header = one("#siteHeader");
  var actionBar = one("#actionBar");
  var lastY = 0;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle("is-stuck", y > 24);

    // Reveal the mobile action bar once the visitor is past the hero,
    // so it never covers the hero CTAs.
    if (actionBar) actionBar.classList.toggle("is-visible", y > window.innerHeight * 0.6);

    lastY = y;
    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  onScroll();


  /* ══════════ 3 · MOBILE NAVIGATION ══════════ */

  var nav = one("#nav");
  var navToggle = one("#navToggle");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function toggleNav() {
    if (!nav || !navToggle) return;
    var open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle) navToggle.addEventListener("click", toggleNav);

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
  }

  // Keep Tab inside the open mobile menu, and close on Escape.
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function navFocusables() {
    if (!nav) return [];
    var list = all(FOCUSABLE, nav).filter(function (el) {
      return el.offsetParent !== null || el === doc.activeElement;
    });
    if (navToggle) list.push(navToggle);

    // The toggle button sits after the nav in the markup, so the array has to
    // be sorted into real document order — otherwise first/last are wrong and
    // the trap leaks on the last Tab.
    list.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return list;
  }

  doc.addEventListener("keydown", function (e) {
    if (!nav || !nav.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeNav();
      if (navToggle) navToggle.focus();
      return;
    }

    if (e.key !== "Tab") return;

    var items = navFocusables();
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (e.shiftKey && doc.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && doc.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Close the menu if the viewport grows past the mobile breakpoint
  var mq = window.matchMedia("(min-width: 961px)");
  function mqHandler(e) { if (e.matches) closeNav(); }
  if (mq.addEventListener) mq.addEventListener("change", mqHandler);
  else if (mq.addListener) mq.addListener(mqHandler);


  /* ══════════ 4 · SCROLL REVEALS ══════════ */

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = all(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });

    // Anything already in view on load shows immediately.
    window.requestAnimationFrame(function () {
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    });
  }


  /* ══════════ 5 · CTA ROUTING + CONTACT TABS ══════════ */
  /*
     Two distinct lead paths. A CTA carrying data-cta="quote" opens the
     vehicle-owner form; data-cta="trade" opens the installer/dealer form;
     data-cta="stock" goes to the availability form in the inventory section.
     Nothing routes to a single generic contact form.
  */

  var TABS = {
    retail: { btn: one("#tab-retail"), panel: one("#panel-retail"), firstField: "#r-name" },
    trade:  { btn: one("#tab-trade"),  panel: one("#panel-trade"),  firstField: "#t-name" }
  };

  function showTab(key, moveFocus) {
    if (!TABS[key] || !TABS[key].btn) return;

    Object.keys(TABS).forEach(function (k) {
      var t = TABS[k];
      if (!t.btn || !t.panel) return;
      var active = (k === key);
      t.btn.classList.toggle("is-active", active);
      t.btn.setAttribute("aria-selected", String(active));
      t.btn.setAttribute("tabindex", active ? "0" : "-1");
      t.panel.classList.toggle("is-hidden", !active);
      if (active) t.panel.removeAttribute("hidden");
      else t.panel.setAttribute("hidden", "");
    });

    if (moveFocus) {
      window.setTimeout(function () {
        var f = one(TABS[key].firstField);
        if (f) f.focus({ preventScroll: true });
      }, 480);
    }
  }

  Object.keys(TABS).forEach(function (k) {
    var t = TABS[k];
    if (!t.btn) return;
    t.btn.addEventListener("click", function () {
      showTab(k, false);
      track("contact_tab", { tab: k });
    });
    // Arrow-key navigation between tabs, per the ARIA tabs pattern.
    t.btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var other = (k === "retail") ? "trade" : "retail";
      showTab(other, false);
      if (TABS[other].btn) TABS[other].btn.focus();
    });
  });

  all("[data-cta]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var kind = link.getAttribute("data-cta");
      track("cta_click", { cta: kind });

      if (kind !== "quote" && kind !== "trade") return;   // #availability handles itself

      showTab(kind === "trade" ? "trade" : "retail", true);

      // Scroll to the tab bar rather than the top of #contact. Anchoring at
      // the section start leaves the two choices below the fold on a laptop,
      // which is the one thing the visitor needs to see.
      var tabs = one(".tabs__bar");
      if (tabs) {
        e.preventDefault();
        tabs.scrollIntoView({ behavior: "smooth", block: "center" });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", kind === "trade" ? "#trade" : "#quote");
        }
      }
    });
  });

  /* ── COLOR DECK ──
     Clicking a finish carries it into the hub's own quote form instead of
     sending the visitor out to the LUXE catalogue. The whole point of the
     regional page is that the enquiry lands here, not back upstream. */

  all("[data-color]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var color = chip.getAttribute("data-color") || "";

      showTab("retail", false);

      var colorField = one("#r-color");
      if (colorField) {
        colorField.value = color;
        colorField.dispatchEvent(new Event("input", { bubbles: true }));
      }
      // Colour change implies Color Series — preselect it, but never
      // overwrite a choice the visitor already made.
      var product = one("#r-product");
      if (product && !product.value) product.value = "Color Series";
      var service = one("#r-service");
      if (service && !service.value) service.value = "Color change PPF";

      var contact = one("#contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(function () {
        var f = one("#r-name");
        if (f) f.focus({ preventScroll: true });
      }, 620);

      track("color_deck_select", { color: color });
    });
  });

  // Outbound clicks to the LUXE catalogue are tracked separately so the
  // leak back upstream stays measurable.
  all(".film__link--out").forEach(function (el) {
    el.addEventListener("click", function () {
      track("outbound_luxe_catalogue", { url: el.getAttribute("href") || "" });
    });
  });


  // Deep links: /#trade or /#quote open the matching form directly, so
  // outreach emails and Instagram links can point at the right lane.
  // ?color=… arrives from the colour deck and pre-fills the finish, so a
  // visitor who picked a colour never has to retype it.
  (function () {
    var h = (window.location.hash || "").toLowerCase();
    var color = null;
    try { color = new URLSearchParams(window.location.search).get("color"); } catch (e) {}

    if (h === "#trade" || h === "#dealers" || h === "#installers") showTab("trade", false);
    else if (h === "#quote") showTab("retail", false);

    if (!color) return;
    color = color.slice(0, 120);

    var rc = one("#r-color");
    if (rc && !rc.value) rc.value = color;

    var rp = one("#r-product");
    if (rp && !rp.value) rp.value = "Color Series";
    var rs = one("#r-service");
    if (rs && !rs.value) rs.value = "Color change PPF";

    // Availability form: drop it into the notes so the hub knows what to check.
    var an = one("#av-notes");
    if (an && !an.value) an.value = "Interested in: " + color;
    var af = one("#av-film");
    if (af && !af.value) af.value = "Color Series — Gloss";

    // Trade form: same, into notes.
    var tn = one("#t-notes");
    if (tn && !tn.value) tn.value = "Interested in: " + color;
    var tp = one("#t-product");
    if (tp && !tp.value) tp.value = "Color Series";

    track("deck_color_carried", { color: color });
  })();


  /* ══════════ 5b · LOCALLY STOCKED COLOURS ══════════ */
  /*
     Driven entirely from site-config.js so the LUXE team can change what is
     featured without touching markup. Empty array => the block stays hidden,
     so the page never advertises stock that has not been confirmed.
  */

  (function renderStockedColors() {
    var list = CFG.stockedColors;
    var wrap = one("#stockedColors");
    var grid = one("#stockedColorGrid");
    if (!wrap || !grid) return;
    if (!Array.isArray(list) || !list.length) return;   // stays hidden

    list.forEach(function (c) {
      if (!c || !c.name) return;
      var el = doc.createElement("div");
      el.className = "swatch";
      var chip = doc.createElement("span");
      chip.className = "swatch__chip";
      if (c.hex) chip.style.background = c.hex;
      var name = doc.createElement("span");
      name.className = "swatch__name";
      name.appendChild(doc.createTextNode(c.name));
      if (c.line) {
        var sub = doc.createElement("span");
        sub.className = "swatch__line";
        sub.textContent = c.line;
        name.appendChild(sub);
      }
      el.appendChild(chip); el.appendChild(name);
      grid.appendChild(el);
    });

    wrap.removeAttribute("hidden");
    wrap.classList.remove("is-hidden");
  })();


  /* ══════════ 6 · ANALYTICS (LUXE-OWNED, OPTIONAL) ══════════ */
  /*
     Loads only when a Measurement ID is present in site-config.js.
     Nothing third-party is requested otherwise.
  */

  function loadAnalytics() {
    if (!set(CFG.analyticsId)) return;

    var s = doc.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.analyticsId);
    doc.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.analyticsId, { anonymize_ip: true });
  }

  window.SITE_TRACK = track; // used by forms.js
  loadAnalytics();


  /* ══════════ 7 · TAP-TO-CALL & DIRECTIONS TRACKING ══════════ */

  all('[data-site="phone-link"]').forEach(function (el) {
    el.addEventListener("click", function () { track("call_click"); });
  });
  all('[data-site="directions"]').forEach(function (el) {
    el.addEventListener("click", function () { track("directions_click"); });
  });
  all('[data-site="instagram"]').forEach(function (el) {
    el.addEventListener("click", function () { track("instagram_click"); });
  });

  // Outbound clicks to the LUXE product catalogue — tells LUXE which lines
  // the regional traffic is actually researching.
  all('.film__link').forEach(function (el) {
    el.addEventListener("click", function () {
      var card = el.closest(".film, .cway, .range__item");
      var heading = card ? card.querySelector("h3, h4") : null;
      track("product_outbound_click", {
        product: heading ? heading.textContent.trim() : "",
        url: el.getAttribute("href") || ""
      });
    });
  });

})();

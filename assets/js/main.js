/* ============================================================
   main.js
   Config injection · header · nav · reveals · action bar · analytics
   No dependencies. No build step.
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var doc = document;

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

    // Phone text
    if (set(CFG.phone)) {
      all('[data-site="phone"]').forEach(function (el) { el.textContent = CFG.phone; });
    }

    // Phone links
    if (set(CFG.phoneE164)) {
      all('[data-site="phone-link"]').forEach(function (el) {
        el.setAttribute("href", "tel:" + CFG.phoneE164.replace(/[^\d+]/g, ""));
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

    // Optional story overrides — only applied when a value is supplied
    ['storyLede','story1Year','story1Title','story1Body',
     'story2Year','story2Title','story2Body',
     'story3Year','story3Title','story3Body'].forEach(function (k) {
      var v = CFG[k];
      if (typeof v === 'string' && v.trim() !== '') {
        all('[data-site="' + k + '"]').forEach(function (el) { el.textContent = v; });
      }
    });

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


  /* ══════════ 5 · CTA → FORM PURPOSE PRE-SELECTION ══════════ */
  /*
     Any link carrying data-purpose pre-selects the matching option
     in the main contact form, so the visitor lands on a form that
     already reflects what they clicked.
  */

  var PURPOSE_MAP = {
    showroom: "Book a showroom visit",
    quote:    "Request an installation quote",
    stock:    "Check local film availability",
    dealer:   "Dealer or installer support"
  };

  var purposeSelect = one("#c-purpose");

  all("[data-purpose]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!purposeSelect) return;
      var value = PURPOSE_MAP[link.getAttribute("data-purpose")];
      if (!value) return;

      purposeSelect.value = value;
      purposeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      // Move focus to the first real input after the jump completes.
      window.setTimeout(function () {
        var firstInput = one("#c-name");
        if (firstInput) firstInput.focus({ preventScroll: true });
      }, 520);

      track("cta_click", { purpose: link.getAttribute("data-purpose") });
    });
  });


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

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
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

})();

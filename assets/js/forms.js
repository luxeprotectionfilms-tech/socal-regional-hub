/* ============================================================
   forms.js
   Accessible validation + submission for both site forms.
   Falls back to a pre-filled email if no endpoint is configured.
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var track = window.SITE_TRACK || function () {};

  function set(v) { return typeof v === "string" && v.trim() && v.trim() !== "PENDING"; }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DIGITS_RE = /\d/g;

  /* ---------- attribution ----------
     UTM values are captured on first page view and held for the session,
     so a visitor who lands from a campaign, browses, and only submits
     three pages later still carries the correct source. Without this the
     UTMs are lost the moment they click an internal link.
     sessionStorage is used deliberately: it is first-party, cleared when
     the tab closes, and holds no personal data. */

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var STORE_KEY = "luxe_hub_attribution";

  function readStore() {
    try { return JSON.parse(window.sessionStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function attribution() {
    var saved = readStore();
    var params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { params = null; }

    var fresh = {};
    if (params) {
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) fresh[k] = v.slice(0, 200);
      });
    }

    // First touch wins unless this visit carries new campaign parameters.
    if (Object.keys(fresh).length) {
      if (!saved.referrer) fresh.referrer = document.referrer || "";
      if (!saved.landing_page) fresh.landing_page = window.location.href;
      try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(fresh)); } catch (e) {}
      return fresh;
    }

    if (!Object.keys(saved).length) {
      saved = { referrer: document.referrer || "", landing_page: window.location.href };
      try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (e) {}
    }
    return saved;
  }

  // Capture on page load, not at submit time. By the time someone fills in a
  // form they have usually clicked through to an internal anchor, and the
  // campaign parameters are no longer in the URL — running this only at
  // submit silently loses every UTM.
  attribution();

  /* ---------- validation ---------- */

  function messageFor(field) {
    var value = (field.value || "").trim();
    var label = field.closest(".field");
    var name = label ? (label.querySelector("label").textContent || "").replace(/\(.*\)/, "").trim() : "This field";

    if (!value) {
      if (field.tagName === "SELECT") return "Please choose an option.";
      return "Please enter your " + name.toLowerCase() + ".";
    }
    if (field.type === "email" && !EMAIL_RE.test(value)) {
      return "Please enter a valid email address.";
    }
    if (field.type === "tel") {
      var digits = value.match(DIGITS_RE);
      if (!digits || digits.length < 10) return "Please enter a phone number we can reach you on.";
    }
    return "";
  }

  function showError(field, message) {
    var slot = document.querySelector('[data-err-for="' + field.id + '"]');
    if (slot) slot.textContent = message;

    if (message) {
      field.setAttribute("aria-invalid", "true");
      // Point at the real element id so assistive tech actually reads the error.
      if (slot && slot.id) field.setAttribute("aria-describedby", slot.id);
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
  }

  function validateField(field) {
    if (!field.hasAttribute("required")) return true;
    var message = messageFor(field);
    showError(field, message);
    return !message;
  }

  function validateForm(form) {
    var fields = all("input[required], select[required], textarea[required]", form);
    var firstBad = null;

    fields.forEach(function (field) {
      if (!validateField(field) && !firstBad) firstBad = field;
    });

    if (firstBad) {
      firstBad.focus();
      return false;
    }
    return true;
  }

  /* ---------- payload ---------- */

  function collect(form, formName) {
    var data = { form: formName };
    all("input, select, textarea", form).forEach(function (field) {
      if (!field.name || field.name === "company") return; // skip honeypot
      var value = (field.value || "").trim();
      if (value) data[field.name] = value;
    });
    /* ---- lead routing + attribution ----
       These field names are what the CRM maps against. Changing them
       means remapping the destination form, so keep them stable. */

    var attr = attribution();

    data.lead_source  = CFG.leadSource || "Gravity Garage Regional Hub Website";
    data.inquiry_type = data.purpose || INQUIRY_BY_FORM[formName] || "General enquiry";
    data.audience     = AUDIENCE_BY_FORM[formName] || "Unknown";
    data.hub          = "Southern California — Santa Clarita / Valencia";

    // Assemble a readable vehicle string for the CRM without losing the
    // individual fields, which are more useful for filtering.
    if (data.vehicle_year || data.vehicle_make || data.vehicle_model) {
      data.vehicle = [data.vehicle_year, data.vehicle_make, data.vehicle_model]
        .filter(Boolean).join(" ");
    }
    data.page_url     = window.location.href;
    data.referring_url = attr.referrer || document.referrer || "";
    data.landing_page = attr.landing_page || "";
    data.utm_source   = attr.utm_source   || "";
    data.utm_medium   = attr.utm_medium   || "";
    data.utm_campaign = attr.utm_campaign || "";
    data.utm_content  = attr.utm_content  || "";
    data.utm_term     = attr.utm_term     || "";
    data.submitted_at = new Date().toISOString();

    // Kept for backwards compatibility with the original payload shape.
    data.page = data.page_url;
    data.submitted = data.submitted_at;

    // Formspree-specific hints: make the notification email readable and
    // let "Reply" go straight back to the enquirer. Harmless on other
    // endpoints, which simply ignore keys they don't recognise.
    data._subject = "LUXE SoCal Hub — " + data.inquiry_type +
                    (data.name ? " — " + data.name : "");
    if (data.email) data._replyto = data.email;

    return data;
  }

  var INQUIRY_BY_FORM = {
    availability: "Local film availability",
    retail:       "Vehicle owner — PPF quote / installation",
    trade:        "Installer / dealer — local supply"
  };

  /* Which side of the business a lead belongs to. Routed on at the CRM,
     so retail installation goes to the Gravity operational contact and
     trade enquiries reach LUXE. */
  var AUDIENCE_BY_FORM = {
    availability: "Trade or retail — availability",
    retail:       "Retail",
    trade:        "Trade"
  };

  /* Some endpoints (Zoho Forms / Zoho CRM webforms, and most classic
     form handlers) expect url-encoded fields rather than a JSON body.
     Set formEncoding: "form" in site-config.js for those. */
  function encodeBody(data) {
    if ((CFG.formEncoding || "json").toLowerCase() === "form") {
      var params = new URLSearchParams();
      Object.keys(data).forEach(function (k) { params.append(k, data[k]); });
      return { body: params.toString(), type: "application/x-www-form-urlencoded" };
    }
    return { body: JSON.stringify(data), type: "application/json" };
  }

  function mailtoFallback(data, formName) {
    var to = set(CFG.fallbackEmail) ? CFG.fallbackEmail : "";
    if (!to) return false;

    var subject = "Website enquiry — " + (data.purpose || formName);
    var lines = Object.keys(data)
      .filter(function (k) { return k.charAt(0) !== "_" && k !== "page" && k !== "submitted"; })
      .map(function (k) {
        var label = k.charAt(0).toUpperCase() + k.slice(1);
        return label + ": " + data[k];
      });
    lines.push("", "Sent from " + data.page);

    window.location.href =
      "mailto:" + to +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));

    return true;
  }

  /* ---------- status ---------- */

  function status(form, message, state) {
    var el = form.querySelector(".form__status");
    if (!el) return;
    el.textContent = message;
    if (state) el.setAttribute("data-state", state);
    else el.removeAttribute("data-state");
  }

  /* ---------- wiring ---------- */

  function wire(form, formName) {
    if (!form) return;

    var loadedAt = Date.now();

    // Clear the error the moment the visitor starts fixing it.
    all("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
      field.addEventListener("blur", function () {
        if ((field.value || "").trim()) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot — silently accept and discard.
      var trap = form.querySelector('input[name="company"]');
      if (trap && trap.value) {
        status(form, "Thanks — your request has been received.", "ok");
        form.reset();
        return;
      }

      // Time trap. A human cannot read these fields and fill them in under
      // two seconds; scripted submissions routinely do it in milliseconds.
      // Silently accepted so bots get no signal about why it failed.
      if (Date.now() - loadedAt < 2000) {
        status(form, "Thanks — your request has been received.", "ok");
        form.reset();
        return;
      }

      status(form, "");
      if (!validateForm(form)) {
        status(form, "Please check the highlighted fields.", "error");
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var originalLabel = button ? button.textContent : "";
      var data = collect(form, formName);

      // No endpoint configured yet → email fallback so leads are never lost.
      if (!set(CFG.formEndpoint)) {
        if (mailtoFallback(data, formName)) {
          status(form, "Opening your email app to send this request…", "ok");
          track("form_submit", { form: formName, method: "mailto", inquiry_type: data.inquiry_type });
        } else {
          status(form, "This form isn't connected yet. Please call us instead.", "error");
        }
        return;
      }

      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      status(form, "Sending your request…");

      var payload = encodeBody(data);

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": payload.type, "Accept": "application/json" },
        body: payload.body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed: " + res.status);
          form.reset();
          // Only promise an acknowledgement email once one actually exists.
          // Set autoResponse: true in site-config.js after the endpoint's
          // autoresponder is switched on.
          status(form, CFG.autoResponse
            ? "Thank you — your request has been received. A confirmation is on its way to " +
              (data.email || "your inbox") + ", and the team will follow up shortly."
            : "Thank you — your request has been received. The team will follow up shortly.", "ok");
          track("form_submit", {
            form: formName,
            method: "endpoint",
            audience: data.audience,
            inquiry_type: data.inquiry_type,
            purpose: data.purpose || ""
          });
          // Distinct event names make these easy to mark as separate
          // conversions in GA4 without custom-dimension work.
          track(formName === "trade" ? "lead_installer_dealer"
              : formName === "retail" ? "lead_ppf_quote"
              : "lead_film_availability",
              { audience: data.audience });
        })
        .catch(function () {
          status(form, "That didn't send. Please try again in a moment, or call the hub and we'll take care of it.", "error");
          track("form_error", { form: formName, inquiry_type: data.inquiry_type });
        })
        .then(function () {
          if (button) { button.disabled = false; button.textContent = originalLabel; }
        });
    });
  }

  wire(document.getElementById("availabilityForm"), "availability");
  wire(document.getElementById("retailForm"), "retail");
  wire(document.getElementById("tradeForm"), "trade");

})();

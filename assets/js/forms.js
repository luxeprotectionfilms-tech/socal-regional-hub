/* ============================================================
   forms.js — Gravity Garage Regional Hub
   ------------------------------------------------------------
   Client side of the shared LUXE form handler.

   THE RULE THIS FILE EXISTS TO OBEY
   ---------------------------------
   The browser never knows, sends, or influences where a lead goes.
   There is no recipient address in this file, in index.html, or in
   site-config.js — not as a config key, not as a payload field, not in
   a data attribute. The handler resolves the destination from the
   request's Origin header, which a page cannot forge, so a visitor
   cannot open devtools and redirect a submission.

   If you are ever tempted to add `to`, `_routeTo`, `_copyTo`, or a lead
   email "just for the subject line" — don't. The handler discards
   unknown keys anyway, so it would achieve nothing except putting an
   address somewhere a stranger can read it.
   ============================================================ */

(function () {
  "use strict";

  /* The entire client-side contract. Three keys. Nothing else belongs here. */
  var LUXE_FORM = {
    endpoint:       "https://forms.luxeprotectionfilms.com/api/quote",
    successMessage: "Thank you — your inquiry has gone to Gravity Garage. They will be in touch shortly.",
    errorMessage:   "Something went wrong sending your request. Please call Gravity Garage directly."
  };

  var track = window.SITE_TRACK || function () {};

  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DIGITS_RE = /\d/g;

  /* The handler reads an allowlist and discards everything else. These are
     those names. Filtering here too means what leaves the browser is
     identical to what the server will actually keep — so a field that
     silently vanishes is visible in devtools, not a mystery. */
  var ALLOWED = [
    "first_name", "last_name", "phone", "email",
    "vehicle_year", "vehicle_make", "vehicle_model",
    "service", "film_interest", "color_interest", "timeframe", "comments",
    "company_name", "city", "business_type", "interest", "volume",
    "company"
  ];

  var REQUIRED = ["first_name", "last_name", "phone", "email"];

  /* Trade enquiries collect more than the shared allowlist carries. Rather
     than drop that context — a shop's website, what they run today, whether
     they would collect locally, all of which shape how the hub replies — it
     is folded into `comments`, which IS on the allowlist. Labelled, so
     whoever reads the email can see what came from where. */
  var FOLD_INTO_COMMENTS = [
    ["role",                  "Role"],
    ["website_or_social",     "Website / social"],
    ["state",                 "State"],
    ["current_brands",        "Currently runs"],
    ["local_pickup_interest", "Local pickup"]
  ];

  var LANE = {
    availabilityForm: "Film availability check",
    retailForm:       "Vehicle owner — quote / installation",
    tradeForm:        "Installer / dealer — local supply"
  };

  /* ---------- field-level validation ---------- */

  function messageFor(field) {
    var value = (field.value || "").trim();
    var wrap = field.closest(".field");
    var label = wrap && wrap.querySelector("label");
    var name = label ? (label.textContent || "").replace(/\(.*\)/, "").trim() : "This field";

    if (!value) {
      if (field.tagName === "SELECT") return "Please choose an option.";
      return "Please enter your " + name.toLowerCase() + ".";
    }
    if (field.type === "email" && !EMAIL_RE.test(value)) {
      return "That email address doesn't look right — please check it.";
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
    var firstBad = null;
    all("input[required], select[required], textarea[required]", form).forEach(function (field) {
      if (!validateField(field) && !firstBad) firstBad = field;
    });
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  /* ---------- the confirmation panel ----------
     A bordered card, not a line of text. These forms sit near the bottom of
     a long page; a small grey sentence under the button is exactly what
     someone scrolls past before submitting a second time because they could
     not tell whether the first one worked. */

  var PANEL = {
    ok:   { icon: "✓", title: "Request sent" },
    err:  { icon: "!",      title: "Not sent" },
    busy: { icon: "·", title: "Sending" }
  };

  function say(form, message, state) {
    var el = form.querySelector(".formstatus");
    if (!el) return;

    if (!message) { el.className = "formstatus"; return; }

    var look = PANEL[state] || PANEL.busy;
    el.querySelector(".formstatus__ico").textContent = look.icon;
    el.querySelector(".formstatus__t").textContent = look.title;
    el.querySelector(".formstatus__m").textContent = message;
    el.className = "formstatus is-on formstatus--" + (state || "busy");

    if (state !== "busy") {
      try { el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      catch (e) { el.scrollIntoView(); }
    }
  }

  /* ---------- payload ---------- */

  function collect(form) {
    var raw = {};
    all("input, select, textarea", form).forEach(function (field) {
      if (!field.name) return;
      var value = (field.value || "").trim();
      if (value) raw[field.name] = value;
    });

    var extra = [];
    FOLD_INTO_COMMENTS.forEach(function (pair) {
      if (raw[pair[0]]) extra.push(pair[1] + ": " + raw[pair[0]]);
    });

    var lane = LANE[form.id];
    var note = raw.comments || "";
    var block = (lane ? ["Enquiry: " + lane] : []).concat(extra);
    if (block.length) note = (note ? note + "\n\n" : "") + block.join("\n");
    if (note) raw.comments = note;

    var payload = {};
    ALLOWED.forEach(function (key) { if (raw[key]) payload[key] = raw[key]; });
    return payload;
  }

  /* ---------- wiring ---------- */

  function wire(form) {
    if (!form) return;

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

      /* Honeypot. The server accepts and silently discards, so the page does
         the same and shows success. A human whose password manager helpfully
         filled a hidden field called Company would otherwise click submit
         and get nothing at all — no error, no confirmation, a dead button. */
      var trap = form.company;
      if (trap && trap.value) {
        form.reset();
        say(form, LUXE_FORM.successMessage, "ok");
        return;
      }

      var missing = REQUIRED.filter(function (n) {
        return !form[n] || !form[n].value.trim();
      });
      if (missing.length) {
        validateForm(form);
        say(form, "Please complete your name, phone and email.", "err");
        if (form[missing[0]]) form[missing[0]].focus();
        return;
      }
      if (!EMAIL_RE.test(form.email.value.trim())) {
        showError(form.email, "That email address doesn't look right — please check it.");
        say(form, "That email address doesn't look right — please check it.", "err");
        form.email.focus();
        return;
      }
      if (!validateForm(form)) {
        say(form, "Please check the highlighted fields.", "err");
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : "";
      var payload = collect(form);

      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      say(form, "Sending your request…", "busy");

      fetch(LUXE_FORM.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) { var er = new Error(res.status); er.status = res.status; throw er; }
          form.reset();
          say(form, LUXE_FORM.successMessage, "ok");
          track("form_submit", { form: form.id, lane: LANE[form.id] || "" });
          track(form.id === "tradeForm" ? "lead_installer_dealer"
              : form.id === "retailForm" ? "lead_ppf_quote"
              : "lead_film_availability", {});
        })
        .catch(function (err) {
          /* One case deserves its own wording. Telling someone who has just
             submitted twice that "something went wrong" sends them to the
             phone over a problem that isn't one. */
          say(form, err && err.status === 429
            ? "We have already received several requests from this connection. Give it a few minutes, or call Gravity Garage and they will take the details over the phone."
            : LUXE_FORM.errorMessage, "err");
          track("form_error", { form: form.id, status: (err && err.status) || 0 });
        })
        .then(function () {
          if (button) { button.disabled = false; button.textContent = label; }
        });
    });
  }

  wire(document.getElementById("availabilityForm"));
  wire(document.getElementById("retailForm"));
  wire(document.getElementById("tradeForm"));

})();

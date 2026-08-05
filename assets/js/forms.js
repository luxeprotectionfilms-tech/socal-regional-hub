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
    data.page = window.location.href;
    data.submitted = new Date().toISOString();

    // Formspree-specific hints: make the notification email readable and
    // let "Reply" go straight back to the enquirer. Harmless on other
    // endpoints, which simply ignore keys they don't recognise.
    data._subject = "LUXE SoCal Hub — " + (data.purpose || formName) +
                    (data.name ? " — " + data.name : "");
    if (data.email) data._replyto = data.email;

    return data;
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
          track("form_submit", { form: formName, method: "mailto" });
        } else {
          status(form, "This form isn't connected yet. Please call us instead.", "error");
        }
        return;
      }

      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      status(form, "Sending your request…");

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed: " + res.status);
          form.reset();
          status(form, "Thank you — your request has been sent. We'll be in touch shortly.", "ok");
          track("form_submit", { form: formName, method: "endpoint", purpose: data.purpose || "" });
        })
        .catch(function () {
          status(form, "Something went wrong sending that. Please call us and we'll take care of it.", "error");
          track("form_error", { form: formName });
        })
        .then(function () {
          if (button) { button.disabled = false; button.textContent = originalLabel; }
        });
    });
  }

  wire(document.getElementById("availabilityForm"), "availability");
  wire(document.getElementById("mainForm"), "contact");

})();

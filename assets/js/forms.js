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
    successMessage: "Got it. Your request is in with the LUXE SoCal hub — the Gravity Garage team will be in touch shortly.",
    errorMessage:   "That didn't go through. Try once more in a moment, or call the hub and the team will take your details over the phone."
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
    "form_type",
    "company"
  ];

  /* Email is the required channel; phone is offered but not demanded.
     Worth knowing why, because the trade-off is real: an address can be
     mistyped and still pass a format test, and a lead has already come in
     where the phone number was the only reachable detail. Asking for less
     wins more submissions than it loses — but it puts the whole weight of
     reply-ability on one field, which is why the email format check below
     is enforced before anything is sent rather than left to the server. */
  var REQUIRED = ["first_name", "last_name", "email"];

  /* Trade inquiries collect more than the shared allowlist carries. Rather
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

  /* The handler turns this into the email's subject line, so a stocking
     question and an installation booking are separable in the inbox
     without opening either. Labelling only — it can never reach routing. */
  var FORM_TYPE = {
    availabilityForm: "availability",
    retailForm:       "quote",
    tradeForm:        "trade"
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

  /* An optional field is not an unchecked one. Leaving phone blank is fine;
     typing six digits into it is not, and silently accepting that would
     hand the hub a number it cannot call. So: skip when empty and optional,
     check the format whenever there is something to check. */
  function validateField(field) {
    var filled = !!(field.value || "").trim();
    if (!field.hasAttribute("required") && !filled) { showError(field, ""); return true; }
    var message = messageFor(field);
    showError(field, message);
    return !message;
  }

  function validateForm(form) {
    var firstBad = null;
    all("input, select, textarea", form).forEach(function (field) {
      if (field.type === "file" || !field.name) return;
      if (!field.hasAttribute("required") && !(field.value || "").trim()) return;
      if (!validateField(field) && !firstBad) firstBad = field;
    });
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  /* ---------- vehicle photos ----------
     Downscaled in the browser before they ever leave it. A 6 MB phone
     photo becomes roughly 300 KB, which is the difference between a
     submission that sends from a kerbside 4G connection and one that
     stalls. The handler caps each photo at 2 MB decoded and the whole
     request at 9 MB, so the page keeps itself comfortably inside both
     rather than finding out at the 413.

     EXIF orientation is the detail that bites: a portrait phone photo
     records its rotation as a flag, not in the pixels, and a canvas reads
     pixels. Decoding through createImageBitmap with imageOrientation
     "from-image" is what stops cars arriving on their side. */

  var PHOTO = {
    max:      3,
    perPhoto: 1900000,                        // decoded; the handler's cap is 2,000,000
    total:    7600000,                        // base64 across the set; body cap is 9,000,000
    steps:    [[1600, 0.72], [1280, 0.66], [1024, 0.58], [800, 0.5]]
  };

  var PHOTOS = {};      // form id → array of data URLs, read at submit
  var CLEAR  = {};      // form id → reset, called after a successful send

  function decode(file) {
    function viaImage() {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload  = function () { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
        img.src = url;
      });
    }
    if (window.createImageBitmap) {
      try { return createImageBitmap(file, { imageOrientation: "from-image" }).catch(viaImage); }
      catch (e) { /* older Safari rejects the options bag outright */ }
    }
    return viaImage();
  }

  function bytesOf(dataUrl) {
    var b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    return Math.floor(b64.length * 3 / 4);
  }

  function draw(source, edge, quality) {
    var w = source.width, h = source.height;
    var scale = Math.min(1, edge / Math.max(w, h));
    var canvas = document.createElement("canvas");
    canvas.width  = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  }

  /* Step down until it fits. Everything leaves as JPEG, which is on the
     handler's type allowlist and passes its signature check. */
  function shrink(source) {
    for (var i = 0; i < PHOTO.steps.length; i++) {
      var url = draw(source, PHOTO.steps[i][0], PHOTO.steps[i][1]);
      if (bytesOf(url) <= PHOTO.perPhoto) return url;
    }
    return null;
  }

  function photoField(form, inputId, listId, slotId) {
    var input = document.getElementById(inputId);
    var list  = document.getElementById(listId);
    var slot  = document.getElementById(slotId);
    if (!input || !list) return;

    var shots = [];

    function note(text) { if (slot) slot.textContent = text || ""; }

    function weight() {
      return shots.reduce(function (sum, shot) { return sum + shot.url.length; }, 0);
    }

    function paint() {
      list.textContent = "";
      shots.forEach(function (shot, index) {
        var li = document.createElement("li");
        li.className = "photo";

        var img = document.createElement("img");
        img.src = shot.url;
        img.alt = "";                                    // the filename beside it is the label
        img.width = 44; img.height = 44;

        var name = document.createElement("span");
        name.className = "photo__n";
        name.textContent = shot.name;

        var kill = document.createElement("button");
        kill.type = "button";
        kill.className = "photo__x";
        kill.setAttribute("aria-label", "Remove " + shot.name);
        kill.textContent = "×";
        kill.addEventListener("click", function () {
          shots.splice(index, 1);
          paint();
          note("");
        });

        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(kill);
        list.appendChild(li);
      });
      PHOTOS[form.id] = shots.map(function (shot) { return shot.url; });
    }

    CLEAR[form.id] = function () { shots.length = 0; paint(); note(""); };
    paint();

    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files || []);
      input.value = "";                       // so re-picking the same file still fires
      if (!files.length) return;

      var room = PHOTO.max - shots.length;
      if (room <= 0) { note("That's the limit — " + PHOTO.max + " photos. Remove one to swap it out."); return; }

      var overflow = Math.max(0, files.length - room);
      files = files.slice(0, room);

      var rejected = 0;
      var chain = Promise.resolve();
      note("Preparing…");

      files.forEach(function (file) {
        chain = chain.then(function () {
          /* Trust the decoder, not the label. Android browsers sometimes
             report an empty type and iOS hands over HEIC, both of which a
             strict allowlist would wrongly refuse — and everything leaves
             here re-encoded as JPEG regardless, so the only question that
             matters is whether it decodes as an image at all. */
          if (file.type && file.type.indexOf("image/") !== 0) { rejected++; return; }
          return decode(file).then(function (source) {
            var url = shrink(source);
            if (source.close) source.close();
            if (!url) { rejected++; return; }
            shots.push({ url: url, name: file.name || "photo.jpg" });
          }).catch(function () { rejected++; });
        });
      });

      chain.then(function () {
        /* Trim from the end until the set clears the handler's body cap. */
        var trimmed = 0;
        while (shots.length && weight() > PHOTO.total) { shots.pop(); trimmed++; }
        paint();

        var said = [];
        if (rejected) said.push(rejected === 1 ? "One file couldn't be read as a photo" : rejected + " files couldn't be read as photos");
        if (overflow) said.push(overflow === 1 ? "one skipped — " + PHOTO.max + " photos max" : overflow + " skipped — " + PHOTO.max + " photos max");
        if (trimmed)  said.push(trimmed === 1 ? "one dropped to keep the upload small enough" : trimmed + " dropped to keep the upload small enough");
        note(said.length ? said.join(". ") + "." : "");
      });
    });
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
      if (!field.name || field.type === "file") return;
      var value = (field.value || "").trim();
      if (value) raw[field.name] = value;
    });

    var extra = [];
    FOLD_INTO_COMMENTS.forEach(function (pair) {
      if (raw[pair[0]]) extra.push(pair[1] + ": " + raw[pair[0]]);
    });

    var lane = LANE[form.id];
    var note = raw.comments || "";
    var block = (lane ? ["Inquiry: " + lane] : []).concat(extra);
    if (block.length) note = (note ? note + "\n\n" : "") + block.join("\n");
    if (note) raw.comments = note;
    if (FORM_TYPE[form.id]) raw.form_type = FORM_TYPE[form.id];

    var payload = {};
    ALLOWED.forEach(function (key) { if (raw[key]) payload[key] = raw[key]; });

    var shots = PHOTOS[form.id] || [];
    if (shots.length) payload.photos = shots;

    return payload;
  }

  /* ---------- wiring ---------- */

  function wire(form) {
    if (!form) return;

    all("input, select, textarea", form).forEach(function (field) {
      if (field.type === "file") return;
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
        say(form, "We need your name and email to get back to you.", "err");
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
        say(form, "Almost — just check the highlighted fields.", "err");
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : "";
      var payload = collect(form);

      if (button) { button.disabled = true; button.textContent = "Sending…"; }
      say(form, payload.photos ? "Sending your request and photos…" : "Sending your request…", "busy");

      fetch(LUXE_FORM.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) { var er = new Error(res.status); er.status = res.status; throw er; }
          form.reset();
          if (CLEAR[form.id]) CLEAR[form.id]();
          say(form, LUXE_FORM.successMessage, "ok");
          track("form_submit", { form: form.id, lane: LANE[form.id] || "", photos: (payload.photos || []).length });
          track(form.id === "tradeForm" ? "lead_installer_dealer"
              : form.id === "retailForm" ? "lead_ppf_quote"
              : "lead_film_availability", {});
        })
        .catch(function (err) {
          /* Two cases deserve their own wording. Telling someone who has just
             submitted twice that "something went wrong" sends them to the
             phone over a problem that isn't one — and a rejected upload is a
             fixable mistake, not a failure. */
          say(form, err && err.status === 429
            ? "We've already had several requests from this connection. Give it a few minutes, or call the hub and the team will take the details over the phone."
            : err && err.status === 413
            ? "Those photos were too large to send. Remove one and try again — or send the request without them and the team will ask."
            : LUXE_FORM.errorMessage, "err");
          track("form_error", { form: form.id, status: (err && err.status) || 0 });
        })
        .then(function () {
          if (button) { button.disabled = false; button.textContent = label; }
        });
    });
  }

  var retail = document.getElementById("retailForm");

  wire(document.getElementById("availabilityForm"));
  wire(retail);
  wire(document.getElementById("tradeForm"));

  if (retail) photoField(retail, "r-photos", "r-photos-list", "r-photos-note");

})();

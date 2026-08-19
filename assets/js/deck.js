/* ============================================================
   deck.js — LUXE Color Deck, Southern California hub edition
   ------------------------------------------------------------
   Same 175-film catalogue as the LUXE digital deck, but every
   action routes into THIS hub's forms. That is the whole point:
   a visitor who finds a finish here should become a Gravity
   Garage enquiry, not a click back into the national store.
   ============================================================ */

(function () {
  "use strict";

  var track = window.SITE_TRACK || function () {};
  var doc = document;
  var COLS = 6;

  var grid   = doc.getElementById("deckGrid");
  var count  = doc.getElementById("deckCount");
  var empty  = doc.getElementById("deckEmpty");
  var search = doc.getElementById("deckSearch");
  var secRow = doc.getElementById("deckSections");
  var hueRow = doc.getElementById("deckHues");
  var modal  = doc.getElementById("deckModal");
  if (!grid) return;

  var DATA = null, sec = "All", hue = "All hues", q = "";
  var lastFocused = null;

  /* ---------- sprite positioning ----------
     The swatch art is one sprite sheet per 36 finishes. If a sheet fails to
     load — CDN moved, offline, blocked — the tile would otherwise be a blank
     square with no clue what it is. So each sheet is probed once, and on
     failure the deck switches to a labelled fallback that still reads
     correctly. Degraded, but never broken. */

  var sheetOk = {};

  function probeSheets() {
    DATA.sheets.forEach(function (src, i) {
      var img = new Image();
      img.onload  = function () { sheetOk[i] = true; };
      img.onerror = function () {
        sheetOk[i] = false;
        doc.documentElement.classList.add("deck-noart");
      };
      img.src = src;
    });
  }

  function paint(el, card) {
    el.style.backgroundImage = "url('" + DATA.sheets[card[4]] + "')";
    el.style.backgroundSize = (COLS * 100) + "% " + (COLS * 100) + "%";
    el.style.backgroundPosition =
      (card[5] / (COLS - 1) * 100) + "% " + (card[6] / (COLS - 1) * 100) + "%";
    // Readable even with no artwork.
    el.setAttribute("data-fallback", card[1]);
  }

  /* ---------- filtering ---------- */
  function matches(c) {
    if (sec !== "All" && c[2] !== sec) return false;
    if (hue !== "All hues" && c[3] !== hue) return false;
    if (!q) return true;
    return c[0].toLowerCase().indexOf(q) > -1 || c[1].toLowerCase().indexOf(q) > -1;
  }

  function chipRow(host, items, current, onPick) {
    host.innerHTML = "";
    items.forEach(function (v) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "deck__fchip";
      b.textContent = v;
      b.setAttribute("aria-pressed", String(current === v));
      b.addEventListener("click", function () { onPick(v); render(); });
      host.appendChild(b);
    });
  }

  function render() {
    chipRow(secRow, DATA.sections, sec, function (v) { sec = v; track("deck_filter", { type: "finish", value: v }); });
    chipRow(hueRow, DATA.hues, hue, function (v) { hue = v; track("deck_filter", { type: "hue", value: v }); });

    var list = DATA.cards.filter(matches);
    count.textContent = list.length + " of " + DATA.cards.length + " finishes";
    grid.innerHTML = "";
    empty.hidden = list.length > 0;

    var frag = doc.createDocumentFragment();
    list.forEach(function (c) {
      var t = doc.createElement("button");
      t.type = "button";
      t.className = "dtile";
      t.setAttribute("aria-label", c[0] + ", " + c[1] + ", " + c[2]);

      var sw = doc.createElement("div");
      sw.className = "dtile__sw";
      paint(sw, c);
      if (DATA.new2026.indexOf(c[1]) > -1) {
        var n = doc.createElement("span");
        n.className = "dtile__new";
        n.textContent = "New 2026";
        sw.appendChild(n);
      }

      var info = doc.createElement("div");
      info.className = "dtile__info";
      info.innerHTML = '<span class="dtile__n"></span><span class="dtile__c"></span><span class="dtile__s"></span>';
      info.querySelector(".dtile__n").textContent = c[0];
      info.querySelector(".dtile__c").textContent = c[1];
      info.querySelector(".dtile__s").textContent = c[2];

      t.appendChild(sw); t.appendChild(info);
      t.addEventListener("click", function () { openModal(c, t); });
      frag.appendChild(t);
    });
    grid.appendChild(frag);
  }

  /* ---------- detail modal ---------- */
  function openModal(c, source) {
    lastFocused = source || doc.activeElement;

    paint(doc.getElementById("deckmSwatch"), c);
    doc.getElementById("deckmSec").textContent = c[2];
    doc.getElementById("deckmName").textContent = c[0];
    doc.getElementById("deckmCode").textContent = c[1];
    doc.getElementById("deckmBadge").hidden = DATA.new2026.indexOf(c[1]) === -1;

    var rows = doc.getElementById("deckmRows");
    rows.innerHTML = "";
    [["Finish", c[2]], ["Hue family", c[3]], ["Material", "TPU Color PPF"], ["TPU code", c[1]]]
      .forEach(function (pair) {
        var wrap = doc.createElement("div");
        var dt = doc.createElement("dt"); dt.textContent = pair[0];
        var dd = doc.createElement("dd"); dd.textContent = pair[1];
        wrap.appendChild(dt); wrap.appendChild(dd); rows.appendChild(wrap);
      });

    // On-car render. Hidden unless the image actually loads — a broken
    // frame is worse than no frame.
    var rWrap = doc.getElementById("deckmRender");
    var rImg  = doc.getElementById("deckmImg");
    rWrap.hidden = true;
    rImg.onload  = function () { rWrap.hidden = false; };
    rImg.onerror = function () { rWrap.hidden = true; };
    rImg.alt = c[0] + " (" + c[1] + ") shown on a vehicle";
    rImg.src = DATA.renderBase + c[1].toLowerCase() + ".jpg";

    // The CTAs. Colour travels to the hub's own quote form as a query
    // parameter, so the enquiry arrives with the finish already attached.
    var enc = encodeURIComponent(c[0] + " (" + c[1] + ")");
    doc.getElementById("deckmQuote").href = "../?color=" + enc + "#quote";
    doc.getElementById("deckmStock").href = "../?color=" + enc + "#availability";
    doc.getElementById("deckmTrade").href = "../?color=" + enc + "#trade";

    modal.hidden = false;
    doc.body.style.overflow = "hidden";
    doc.getElementById("deckmClose").focus();
    track("deck_open_color", { color: c[0], code: c[1], finish: c[2] });
  }

  function closeModal() {
    modal.hidden = true;
    doc.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  doc.getElementById("deckmClose").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  var t = null;
  search.addEventListener("input", function () {
    window.clearTimeout(t);
    t = window.setTimeout(function () {
      q = search.value.trim().toLowerCase();
      render();
      if (q) track("deck_search", { term: q });
    }, 160);
  });

  /* ---------- load ---------- */
  (function boot() {
    var d = window.LUXE_DECK;
    if (!d || !d.cards) {
      count.textContent = "";
      empty.hidden = false;
      empty.textContent = "The color deck could not load. Please call the hub and we'll walk you through the range.";
      return;
    }
    try {
      DATA = d;
      var seen = {};
      d.cards.forEach(function (c) { seen[c[3]] = 1; });
      DATA.hues = ["All hues"].concat(Object.keys(seen).sort());
      probeSheets();
      render();

      // Deep link: /color-deck/?code=TPU-5008 opens that finish directly,
      // so outreach can point at one specific colour.
      try {
        var code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          var hit = d.cards.filter(function (c) { return c[1].toLowerCase() === code.toLowerCase(); })[0];
          if (hit) openModal(hit, null);
        }
      } catch (e) {}
    } catch (err) {
      count.textContent = "";
      empty.hidden = false;
      empty.textContent = "The color deck could not load. Please call the hub and we'll walk you through the range.";
    }
  })();
})();

#!/usr/bin/env python3
"""
build-deck.py — pre-render the colour deck into the HTML.

WHY THIS EXISTS
---------------
The deck's entire value to search is 175 finish names and TPU codes. Built
purely in JavaScript, none of that is in the HTML: a crawler that does not
run scripts reads 296 words and not one colour name. Google does render
JavaScript, but rendering is a queued second pass, and it is the only pass
that would ever see this page's actual content.

So the tiles are generated into `color-deck/index.html` at build time,
between the two GENERATED markers. deck.js then *hydrates* those tiles
rather than rebuilding them (see the boot function), so there is exactly one
set of tiles in the DOM, no flash, and no duplicated markup.

Re-run this whenever assets/js/color-deck-data.js changes:

    python3 tools/build-deck.py

It rewrites only the block between the markers and reports what changed.
"""

import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_JS = ROOT / "assets/js/color-deck-data.js"
DECK_HTML = ROOT / "color-deck/index.html"

START = "<!-- GENERATED:deck-tiles — built by tools/build-deck.py, do not hand-edit -->"
END = "<!-- /GENERATED:deck-tiles -->"


def load_cards():
    src = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"window\.LUXE_DECK\s*=\s*(\{.*\});?\s*$", src, re.S)
    if not m:
        sys.exit("build-deck: could not find window.LUXE_DECK in color-deck-data.js")
    blob = m.group(1).rstrip().rstrip(";")
    data = json.loads(blob)
    return data


def tile(card, new2026):
    name, code, finish, hue = card[0], card[1], card[2], card[3]
    e = html.escape
    label = e("%s, %s, %s" % (name, code, finish), quote=True)
    badge = ""
    if code in new2026:
        badge = '<span class="dtile__new">New 2026</span>'
    return (
        '<button type="button" class="dtile" aria-label="{label}" '
        'data-code="{code}">'
        '<div class="dtile__sw" data-fallback="{code}">{badge}</div>'
        '<div class="dtile__info">'
        '<span class="dtile__n">{name}</span>'
        '<span class="dtile__c">{code}</span>'
        '<span class="dtile__s">{finish}</span>'
        "</div></button>"
    ).format(
        label=label,
        code=e(code, quote=True),
        name=e(name),
        finish=e(finish),
        badge=badge,
    )


def main():
    data = load_cards()
    cards = data["cards"]
    new2026 = set(data.get("new2026", []))

    tiles = "\n".join(tile(c, new2026) for c in cards)
    block = "%s\n%s\n%s" % (START, tiles, END)

    page = DECK_HTML.read_text(encoding="utf-8")

    if START in page:
        page_new = re.sub(
            re.escape(START) + r".*?" + re.escape(END), lambda _: block, page, flags=re.S
        )
    else:
        # First run: seed the markers inside the empty grid container.
        anchor = '<div class="deck__grid" id="deckGrid">'
        if anchor not in page:
            sys.exit("build-deck: could not find the #deckGrid container")
        page_new = page.replace(anchor, anchor + "\n" + block + "\n", 1)

    if page_new == page:
        print("build-deck: no change (%d finishes)" % len(cards))
        return

    DECK_HTML.write_text(page_new, encoding="utf-8")
    print(
        "build-deck: wrote %d finishes into %s (%d -> %d bytes)"
        % (len(cards), DECK_HTML.name, len(page), len(page_new))
    )


if __name__ == "__main__":
    main()

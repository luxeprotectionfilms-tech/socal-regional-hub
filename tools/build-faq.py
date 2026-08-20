#!/usr/bin/env python3
"""
build-faq.py — generate the FAQPage JSON-LD from the FAQ section itself.

WHY THIS EXISTS
---------------
Hand-written FAQ schema drifts. Someone edits an answer in the markup, the
JSON-LD keeps the old wording, and the page now tells Google something it
does not say to visitors — which is exactly the kind of mismatch structured
data guidelines treat as a violation.

So the schema is derived from the markup rather than maintained alongside
it. Edit the copy in index.html, re-run this, and the two cannot disagree:

    python3 tools/build-faq.py

Note on expectations: Google narrowed FAQ rich results in 2023 to a small
set of authoritative sites, so this is very unlikely to produce the
expandable results in Google search. It is here because it is still read by
other engines and by the AI assistants people increasingly ask "where can I
buy LUXE film near me" — and because correct machine-readable answers are
cheap when they are generated rather than typed.
"""

import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"

START = "<!-- GENERATED:faq-schema — built by tools/build-faq.py, do not hand-edit -->"
END = "<!-- /GENERATED:faq-schema -->"


def strip_tags(fragment):
    # Drop the decorative arrow glyph before flattening.
    fragment = re.sub(r'<span aria-hidden="true">.*?</span>', "", fragment, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def main():
    page = PAGE.read_text(encoding="utf-8")

    items = re.findall(
        r'<summary>\s*<h3 class="faq__q">(.*?)</h3>\s*</summary>\s*'
        r'<div class="faq__a">(.*?)</div>',
        page,
        re.S,
    )
    if not items:
        sys.exit("build-faq: found no FAQ items — has the markup changed?")

    doc = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://gravitygarage.luxeprotectionfilms.com/#faq",
        "isPartOf": {"@id": "https://gravitygarage.luxeprotectionfilms.com/#website"},
        "mainEntity": [
            {
                "@type": "Question",
                "name": strip_tags(q),
                "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)},
            }
            for q, a in items
        ],
    }

    block = "%s\n<script type=\"application/ld+json\">\n%s\n</script>\n%s" % (
        START,
        json.dumps(doc, indent=2, ensure_ascii=False),
        END,
    )

    if START in page:
        new = re.sub(re.escape(START) + r".*?" + re.escape(END), lambda _: block, page, flags=re.S)
    else:
        anchor = "</head>"
        new = page.replace(anchor, block + "\n" + anchor, 1)

    if new == page:
        print("build-faq: no change (%d questions)" % len(items))
        return

    PAGE.write_text(new, encoding="utf-8")
    print("build-faq: wrote %d questions into index.html" % len(items))


if __name__ == "__main__":
    main()

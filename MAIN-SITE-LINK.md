# The internal link — what I suggest

**Problem:** `gravitygarage.luxeprotectionfilms.com` is an orphan. Nothing on
the web links to it, so Google has no path to discover it. It was still
unindexed as of 19 August.

**The installer locator will not solve this.** I checked
`luxeprotectionfilms.com/installer-locator/`: it loads results via JavaScript
and currently reports "Number Of Shops: 0". A listing there would very likely
not produce a crawlable HTML link, which is the entire point. Still worth
adding for customers — just don't expect it to help discovery.

---

## Recommendation: one line in the main site footer

Least disruptive, sitewide, crawlable, no navigation restructure. Add to the
existing **Company** or **Resources** column in the WordPress footer:

```html
<a href="https://gravitygarage.luxeprotectionfilms.com/">
  Southern California Regional Hub
</a>
```

That is the whole change. Plain anchor, real href, no JavaScript.

Why the footer specifically: it appears on every page of luxeprotectionfilms.com,
so the hub picks up a link from the strongest and most-crawled part of the site,
and Google finds it on the next crawl of any page. A link buried on one interior
page gets crawled far less often.

**Anchor text matters.** Use "Southern California Regional Hub", not "click
here" or "Gravity Garage". The words in the link are a ranking signal for the
page it points to, and "Southern California" is exactly what we want that page
to rank for. Avoid "distributor" or "dealer" — those carry the commercial
implications we spent this project removing.

---

## Second, higher-converting placement

On **`/become-a-dealer/`**, add a short block. Everyone reading that page is
the trade audience, so this converts as well as it crawls:

> ### Buying in Southern California?
>
> LUXE film is stocked locally at our Southern California regional hub in
> Santa Clarita / Valencia, operated by Gravity Garage. Check local
> availability, arrange pickup, or talk to the hub about installer and dealer
> supply.
>
> [Contact the Southern California hub →](https://gravitygarage.luxeprotectionfilms.com/#trade)

Note the `#trade` anchor — it opens the installer/dealer form directly rather
than making them find it.

---

## If more hubs are coming

If Southern California is the first of several, a `/regional-hubs/` page on
the main site is the durable structure: one page listing each hub, linked
from the footer once. Then adding a hub is adding a row, not a navigation
decision. That is a bigger change and I would want your approval on the
navigation before touching it.

---

## After the link goes live

1. Confirm it is a real `<a href>` in the page source, not JavaScript-rendered.
2. In Search Console, run **URL Inspection** on the hub and
   **Request Indexing**.
3. Submit `https://gravitygarage.luxeprotectionfilms.com/sitemap.xml`
   (two URLs: homepage and `/color-deck/`).

Requesting indexing before an inbound link exists is largely wasted — Google
treats an orphaned page as low priority regardless. Link first, then request.

---

**I have not touched the WordPress site.** Tell me which placement you want
and I will write the exact block; the footer one-liner is my recommendation
and takes about a minute in WordPress.

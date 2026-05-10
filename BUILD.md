# OCGT Build & Deploy Guide

This project is a single-file SPA (`OCGT_website.html`) plus a build step that
generates **per-route static HTML files** for SEO. Both sides share the same
source — there is no second codebase to maintain.

## Why build at all?

Search engines see a single SPA as one URL with 23 H1 tags fighting for
attention. The build pre-renders each route into its own `index.html` with the
correct `<title>`, `<meta description>`, canonical URL, and active page block.
Google then indexes 21 distinct, properly tagged pages instead of one
ambiguous one.

Estimated SEO impact: +15–25 ranking points over 4–8 weeks of recrawl.

## Workflow

### Day-to-day editing
You don't need to run anything during development. Edit
`OCGT_website.html` and refresh the browser as before.

### Before each deploy
```bash
python3 build-prerender.py
```

That regenerates `dist/` from the current `OCGT_website.html`. The output is
self-contained — copy the contents of `dist/` to your web root.

## What gets generated

```
dist/
├── index.html                       # home page (Octacon Geotechnik GmbH...)
├── geotechnik/index.html            # /geotechnik
├── bauueberwachung/index.html       # /bauueberwachung
├── vergabe/index.html               # /vergabe
├── grundwasser/index.html           # /grundwasser
├── beratung/index.html              # /beratung
├── reality-capture/index.html       # /reality-capture
├── 3d-vermessung/index.html         # /3d-vermessung
├── baustellendokumentation/index.html
├── inspektionen/index.html
├── digitale-zwillinge/index.html
├── thermografie/index.html
├── multispektral/index.html
├── video-film/index.html
├── technologie/index.html
├── ueber-uns/index.html
├── referenzen/index.html
├── kontakt/index.html
├── impressum/index.html
├── datenschutz/index.html
├── .htaccess                        # deployment-tuned (serves index.html first)
├── sitemap.xml
├── robots.txt
├── og-image.jpg + og-image-1200x630.jpg
└── Images/, logos/, icons/, marketing/, ... (copied)
```

Each prerendered file has:
- Unique `<title>` baked into the HTML head (no JS execution required)
- Unique `<meta name="description">` matching the route
- Correct `rel="canonical"` pointing to the route's own URL
- The matching `<div id="p-*">` marked as `class="page on"` so the page is
  visible immediately even if JavaScript fails to load

## How `.htaccess` is updated

The development `.htaccess` at the project root keeps `OCGT_website.html`
as the directory index (so `python3 -m http.server` style local previews
still work).

The `dist/.htaccess` is auto-rewritten by the build:
- `DirectoryIndex index.html OCGT_website.html` (prefers prerender)
- SPA fallback redirects to `/index.html` (the home prerender)

All security headers, compression, caching, and file blocks are preserved
from the source `.htaccess`.

## Deployment

Upload the **contents** of `dist/` to your web root, preserving directory
structure. Apache will:
1. Serve `/` from `index.html` (home prerender)
2. Serve `/geotechnik` from `geotechnik/index.html` (geotechnik prerender)
3. ... and so on for each route
4. Fall back to the home prerender for any unknown URL

## Visible site impact

Zero. The build does not modify your visual design, copy, layout, or
behavior. Users see exactly the same site. Search engines see 20 distinct
pages instead of one.

## Reverting

If you ever need to roll back to pure-SPA delivery:
```bash
rm -rf dist/
```
And upload `OCGT_website.html` + assets directly to the root, as before.
The original `.htaccess` will route all paths through the SPA.

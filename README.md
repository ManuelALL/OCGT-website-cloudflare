# OCGT Website

Marketing site for **Octacon Geotechnik GmbH** — Geotechnik & Reality Capture, Berlin.

Live: **https://ocgt.de** (hosted on Strato AG, Berlin)

---

## Stack

Pure static site — **no build step, no Node, no database**:

- Single HTML file: [`OCGT_website.html`](./OCGT_website.html) — contains all CSS (inline `<style>`) + all JS (inline `<script>`).
- Three.js is self-hosted (`three.min.js`, not in repo — see below).
- Fonts: Geist (Google Fonts) + Source Sans 3, Fraunces, JetBrains Mono (Bunny Fonts, GDPR-safe).
- Bilingual DE/EN via `data-de`/`data-en` attributes + `.de-only`/`.en-only` classes.
- SPA hash-routing (`#/geotechnik`, `#/kontakt`, etc.) — 20 unique URLs, all crawlable.

---

## Project Structure

```
├─ OCGT_website.html         ← THE site (single file, ~14 000 lines)
├─ index.html                ← Minimal redirect to OCGT_website.html
├─ .htaccess                 ← Apache config: HTTPS, HSTS, CSP, caching, file blocks
├─ sitemap.xml               ← 20 URLs for Google Search Console
├─ robots.txt                ← Crawler directives
├─ manifest.webmanifest      ← PWA install metadata
├─ Images/                   ← Logos + small hero images (full raws excluded via .gitignore)
├─ logos/                    ← Icon system (Streamline Kameleon SVG+PNG)
├─ 04 Videos/                ← Only hero-compact video + poster in git
├─ marketing/                ← Selected marketing photos used in bento + tiles
├─ OCGT_Website_Audit_Report.md   ← 70-item audit from 2026-04-12
├─ OCGT_Fix_Report.md        ← Changelog: what we fixed, what remains
└─ OCGT_Website_Reference.md ← Design-system + tokens reference
```

---

## Getting Started (for teammates)

### 1. Clone
```bash
git clone https://github.com/humayun-sajjad/OCGT-Website.git
cd OCGT-Website
```

### 2. Download the heavy assets (excluded from git)
The following files live on shared cloud storage, not in git (too large for GitHub):

- `three.min.js` — Three.js r160 build (~670 KB) — put at project root
- `04 Videos/Hero-web-compact.mp4` and `.webm` — hero fallback videos
- `04 Videos/hero-poster.jpg` and `hero-poster-1600.jpg` — poster images
- Raw marketing photos — see Google Drive / shared folder

**Get these from:** [link to shared storage — fill in with real URL]

If you skip them, the site still renders — just with a missing hero video fallback + missing gallery images.

### 3. Run locally
No build needed. Two options:

**Option A — VS Code Live Server** (easiest):
Install the "Live Server" extension → right-click `OCGT_website.html` → "Open with Live Server".

**Option B — Python built-in server:**
```bash
python3 -m http.server 8080
# visit http://localhost:8080/OCGT_website.html
```

**Option C — VS Code launch config** (included in `.vscode/launch.json`):
```bash
code OCGT_website.code-workspace
# Press F5 to start Python server + open browser
```

---

## Development Workflow

### Editing content (copy, translations)
All content is bilingual via DE/EN markup:
```html
<span data-de="Bauüberwachung" data-en="Supervision">Bauüberwachung</span>
```
or
```html
<span class="de-only">Nur Deutsch</span>
<span class="en-only">English only</span>
```

Keep both variants in sync. The language toggle (top-right `DE | EN`) flips visibility via CSS — no reload.

### Editing styles / design tokens
Design system lives in the `:root, [data-theme="dark"]` + `[data-theme="light"]` blocks at the top of `OCGT_website.html`. Current palette is "Graphite & Cream" (see `OCGT_Fix_Report.md` for the full token map).

**Core rule:** mint `#5DEF95` is THE OCGT color (every H1, CTA, active state). Blue `#2684E9` for measurement/precision. The 3-stop gradient is reserved for 4 places only (hero `MESSEN.` letters, pull-quote italic core, exit-modal `Bereit?`, CTA-mega word). Don't use the gradient casually.

### Editing routing
Every page is a `<div id="p-slug" class="page">` block. To add a new page:
1. Add the `<div>` near the other `page` divs.
2. Register in the `ROUTES` map (~line 11245 of `OCGT_website.html`).
3. Register in the `META` object (~line 11205) for title + description.
4. Add the URL to `sitemap.xml`.

### Testing locally
- Desktop: 1440×900 is the design target
- Mobile: test at 390×844 (iPhone 14 Pro) and 375×812 (older iPhone)
- Nav collapse: 1024 px hamburger breakpoint
- Test both `DE` and `EN` language
- Test both dark and light theme (`<button class="theme-tog">`)
- Test with `prefers-reduced-motion: reduce` in DevTools (Emulate CSS media feature)

---

## Deployment (Strato)

The site deploys to Strato shared hosting as static files. See `OCGT_Fix_Report.md` → "Strato Compatibility Analysis" section for the full checklist.

**Quick version:**
1. Upload via SFTP to the hosting doc root:
   - `OCGT_website.html` (or the full dir if `index.html` isn't redirecting yet)
   - `.htaccess`
   - `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
   - `Images/`, `logos/`, `marketing/`, `04 Videos/` (compressed subset only!)
   - `three.min.js`
2. Verify `.htaccess` uploaded (hidden file — enable "show hidden" in FTP client).
3. In Strato control panel: activate Let's Encrypt SSL for `ocgt.de` + `www.ocgt.de`.
4. Ensure `info@ocgt.de` mailbox exists (contact-form mailto fallback sends there).

**DO NOT upload:**
- `.git/`
- `.claude/` (local editor artifacts)
- Any `.las`, `.mov`, `.docx`, `.md` files (blocked by `.htaccess` but shouldn't be uploaded anyway)
- `ocgt-*` dev artifacts

---

## Branching Strategy

Suggested workflow for the team:

```
main                  ← production; auto-deploys to Strato (once CI is set up)
├─ feature/xyz        ← new features / sections
├─ fix/abc            ← bug fixes
└─ content/de-updates ← copy/translation changes only
```

- **Never force-push to `main`**.
- **PRs required** for merges into `main` (enable Branch Protection on GitHub).
- **Squash merge** preferred — keeps `main` history clean.
- **Commit message convention** (optional but recommended):
  - `feat:` new capability
  - `fix:` bug fix
  - `content:` copy/translation change
  - `style:` CSS / visual change, no behavior
  - `perf:` performance
  - `docs:` documentation
  - `chore:` tooling / config

---

## Active Issue Trackers

- **`OCGT_Website_Audit_Report.md`** — 70-item audit from 2026-04-12.
- **`OCGT_Fix_Report.md`** — changelog of what we shipped and what's still open.
- For new bugs / tasks, use **GitHub Issues**.

---

## Still-Open Human Actions

These require real-world action from team leads:

1. **Register Formspree.io** → paste form ID into `FORMSPREE_ENDPOINT` in `OCGT_website.html` (~line 11572).
2. **Create 1200×630 OG share image** → save as `Images/og-image.jpg` + update `og:image` meta.
3. **Register with Google Search Console** → verify domain, submit `sitemap.xml`.
4. **Set up Google Business Profile** → critical for Berlin local SEO.
5. **Collect named testimonials** with photo-release consent (current cards use role-only placeholders).
6. **Add team / founder photos** to the About page.

---

## License

Proprietary. © Octacon Geotechnik GmbH, Berlin.
All content, copy, images, and code are the property of OCGT and may not be used, copied, or distributed without written permission.

---

## Contact

- **Company:** info@ocgt.de · +49 179 7537535
- **Tech questions:** open a GitHub Issue.
- **Content / marketing:** contact OCGT directly.

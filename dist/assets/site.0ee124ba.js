(function(){
  function initKinetic(){
    document.querySelectorAll('.disc-kinetic').forEach(el=>{
      if (el.dataset.kInit) return; el.dataset.kInit='1';
      const words = (el.getAttribute('data-words')||'').split('|').filter(Boolean);
      if (words.length < 2) return;
      let idx = 0;
      const build = (w, active) => {
        const s = document.createElement('span');
        s.className = 'dk-word' + (active?' is-active':'');
        s.textContent = w;
        return s;
      };
      el.innerHTML = '';
      el.appendChild(build(words[0], true));
      // Lock width to the widest word so the line never reflows
      const measureMaxWidth = () => {
        const ghost = document.createElement('span');
        ghost.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit;letter-spacing:inherit;';
        el.appendChild(ghost);
        let max = 0;
        words.forEach(w => { ghost.textContent = w; max = Math.max(max, ghost.offsetWidth); });
        ghost.remove();
        if (max) el.style.minWidth = Math.ceil(max) + 'px';
      };
      measureMaxWidth();
      // Remeasure once webfonts resolve — prevents width shift when Source Sans 3 swaps in
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { el.style.minWidth=''; measureMaxWidth(); });
      }
      window.addEventListener('resize', () => { el.style.minWidth=''; measureMaxWidth(); }, { passive:true });
      setInterval(()=>{
        if (document.hidden) return;
        const cur = el.querySelector('.dk-word.is-active');
        idx = (idx + 1) % words.length;
        const next = build(words[idx], false);
        el.appendChild(next);
        requestAnimationFrame(()=>{
          if (cur) { cur.classList.remove('is-active'); cur.classList.add('is-exit'); }
          next.classList.add('is-active');
          setTimeout(()=>{ if (cur && cur.parentNode) cur.remove(); }, 650);
        });
      }, 3200);
    });
  }

  function initSpotlight(){
    document.querySelectorAll('.disc-bento-card').forEach(card=>{
      if (card.dataset.spotInit) return; card.dataset.spotInit='1';
      card.addEventListener('pointermove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
        const tx = ((e.clientX - r.left) / r.width - .5) * 6;
        const ty = ((e.clientY - r.top) / r.height - .5) * -6;
        card.style.transform = `perspective(1000px) rotateX(${ty}deg) rotateY(${tx}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', ()=>{
        card.style.setProperty('--mx','50%');
        card.style.setProperty('--my','50%');
        card.style.transform = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{ initKinetic(); initSpotlight(); });
  } else { initKinetic(); initSpotlight(); }
})();

/* ── boundary ── */

(function(){
  window.refsToggleYear = function(btn){
    var grp = btn.closest('.refs-yrgroup');
    if (!grp) return;
    var open = grp.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var icon = btn.querySelector('.refs-yrhead-icon');
    if (icon) icon.textContent = open ? '–' : '+';
  };
  window.refsFilter = function(btn, cat){
    var bar = btn.parentElement;
    if (bar) {
      bar.querySelectorAll('.refs-filter-chip').forEach(function(b){
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    var rows = document.querySelectorAll('#p-refs #refs-chrono .refs-row');
    rows.forEach(function(r){
      var c = (r.getAttribute('data-category') || '').split(/\s+/);
      var show = (cat === 'all') || c.indexOf(cat) !== -1;
      r.style.display = show ? '' : 'none';
    });
    // Auto-open all year groups when filtering so matches are visible
    if (cat !== 'all') {
      document.querySelectorAll('#p-refs .refs-yrgroup').forEach(function(g){
        g.classList.add('is-open');
        var h = g.querySelector('.refs-yrhead'); if (h) h.setAttribute('aria-expanded','true');
        var ic = g.querySelector('.refs-yrhead-icon'); if (ic) ic.textContent = '–';
      });
    }
  };
})();

/* ── boundary ── */

'use strict';

/* ── PAGE META ── */
const META = {
  home:        { de:{t:'Octacon Geotechnik GmbH – Geotechnik & Reality Capture Berlin',d:'Geotechnik & Reality Capture aus einer Hand in Berlin. Bauüberwachung Spezialtiefbau, Grundwasserschutz, 3D-Drohnenvermessung. ±cm Genauigkeit · 48h Lieferzeit.'}, en:{t:'Octacon Geotechnik GmbH – Geotechnics & Reality Capture Berlin',d:'Geotechnics & Reality Capture from a single source in Berlin. Construction supervision, groundwater monitoring, 3D drone surveying. ±cm accuracy · 48h delivery.'} },
  geotechnik:  { de:{t:'Geotechnik Berlin – Octacon Geotechnik GmbH',d:'Geotechnik in Berlin: Bauüberwachung Spezialtiefbau, Vergabe & Ausschreibungen, Grundwasserbeauftragter und unabhängige Beratung — VOB-konform und LPH 8.'}, en:{t:'Geotechnics Berlin – Octacon Geotechnik GmbH',d:'Geotechnics in Berlin: construction supervision in specialist foundation engineering, tendering, groundwater officer and independent consulting — VOB-compliant.'} },
  a1:          { de:{t:'Bauüberwachung Spezialtiefbau Berlin – Octacon Geotechnik',d:'Unabhängige Bauüberwachung im Spezialtiefbau in Berlin: Bohrpfähle, Schlitzwände, Düsenstrahl und Anker. VOB-konform, LPH 8, im Auftrag des Bauherrn.'}, en:{t:'Construction Supervision Berlin – Octacon Geotechnik',d:'Independent construction supervision in specialist foundation engineering in Berlin: piles, diaphragm walls, jet grouting, anchors. VOB-compliant, LPH 8.'} },
  a2:          { de:{t:'Vergabe & Ausschreibungen Berlin – Octacon Geotechnik',d:'Ausschreibungsunterstützung und Vergabe für geotechnische Projekte in Berlin: Massenermittlung, Leistungsverzeichnis, Bauverhandlung — VOB-konform und transparent.'}, en:{t:'Tendering Berlin – Octacon Geotechnik',d:'Tendering and procurement support for geotechnical projects in Berlin: quantity surveying, bills of quantity and contract negotiation — VOB-compliant.'} },
  a3:          { de:{t:'Betriebsbeauftragter Grundwasser Berlin – Octacon Geotechnik',d:'Unabhängiger Betriebsbeauftragter für das Grundwasser in Berlin: Wasserhaltung, Monitoring und Behördenkommunikation nach WHG und Berliner Wasserrecht.'}, en:{t:'Groundwater Officer Berlin – Octacon Geotechnik',d:'Independent operational groundwater officer in Berlin: dewatering, monitoring and authority liaison under WHG and Berlin water law — neutral and certified.'} },
  a4:          { de:{t:'Geotechnische Beratung Berlin – Octacon Geotechnik',d:'Fundierte geotechnische Beratung und Gutachten in Berlin: Baugrunduntersuchung, Risikobewertung und Begleitüberwachung — unabhängig und ingenieurgeprüft.'}, en:{t:'Geotechnical Consulting Berlin – Octacon Geotechnik',d:'Independent geotechnical consulting and expert reports in Berlin: site investigation, risk assessment and ongoing monitoring — engineer-reviewed.'} },
  rc:          { de:{t:'Reality Capture Berlin – Octacon Geotechnik GmbH',d:'Reality Capture in Berlin: 3D-Drohnenvermessung, Photogrammetrie, LiDAR, GNSS-RTK und 3D Gaussian Splatting — ±cm Genauigkeit, 48h Lieferzeit, VOB-konform.'}, en:{t:'Reality Capture Berlin – Octacon Geotechnik GmbH',d:'Reality Capture in Berlin: 3D drone surveying, photogrammetry, LiDAR, GNSS-RTK and 3D Gaussian Splatting — ±cm accuracy, 48h delivery, EU drone-licensed.'} },
  b1:          { de:{t:'3D-Vermessung & Photogrammetrie Berlin – Octacon Geotechnik',d:'Präzise 3D-Vermessung mit Drohnen und LiDAR. ±cm Genauigkeit, 48h Lieferzeit.'}, en:{t:'3D Surveying & Photogrammetry Berlin – Octacon Geotechnik',d:'Precise 3D surveying with drones and LiDAR. ±cm accuracy, 48h delivery.'} },
  b2:          { de:{t:'Baustellendokumentation Berlin – Octacon Geotechnik',d:'4D-Baustellendokumentation in Berlin: Baufortschrittskontrolle und Soll-Ist-Vergleich per Drohne. Lückenlose Beweissicherung und transparente Reports für Bauherren.'}, en:{t:'Site Documentation Berlin – Octacon Geotechnik',d:'4D site documentation in Berlin: progress tracking and planned-vs-actual comparison via drone. Seamless evidence and transparent reports for clients.'} },
  b3:          { de:{t:'Inspektionen & Wartung Berlin – Octacon Geotechnik',d:'Berührungslose Inspektion von Brücken, Fassaden und Industrieanlagen per Drohne in Berlin.'}, en:{t:'Inspections & Maintenance Berlin – Octacon Geotechnik',d:'Non-contact inspection of bridges, facades, and industrial plants by drone in Berlin.'} },
  b4:          { de:{t:'Digitale Zwillinge & Scan-to-BIM Berlin – Octacon Geotechnik',d:'Vom 3D-Scan zum intelligenten BIM-Modell. Digitale Zwillinge und Scan-to-BIM in Berlin.'}, en:{t:'Digital Twins & Scan-to-BIM Berlin – Octacon Geotechnik',d:'From 3D scan to intelligent BIM model. Digital twins and Scan-to-BIM in Berlin.'} },
  b5:          { de:{t:'Thermografie & Wärmebildanalysen Berlin – Octacon Geotechnik',d:'Drohnen-Thermografie für Gebäude, PV-Anlagen und Industrieanlagen in Berlin.'}, en:{t:'Thermography & Thermal Imaging Berlin – Octacon Geotechnik',d:'Drone thermography for buildings, PV systems, and industrial plants in Berlin.'} },
  b6:          { de:{t:'Multispektralanalysen & Umweltmonitoring Berlin – Octacon Geotechnik',d:'Vegetationsanalysen, NDVI und Umweltmonitoring per Drohne in Berlin.'}, en:{t:'Multispectral Analysis & Environmental Monitoring Berlin – Octacon Geotechnik',d:'Vegetation analysis, NDVI, and environmental monitoring by drone in Berlin.'} },
  b7:          { de:{t:'Video- & Filmaufnahmen Berlin – Octacon Geotechnik',d:'Hochauflösende Luftbildaufnahmen und Imagefilme per Drohne in Berlin.'}, en:{t:'Video & Film Production Berlin – Octacon Geotechnik',d:'High-resolution aerial footage and image films by drone in Berlin.'} },
  tech:        { de:{t:'Unsere Technologien – LiDAR, Photogrammetrie, GNSS-RTK | Octacon',d:'Transparente Erklärung unserer Technologien: Drohnenphotogrammetrie, LiDAR, GNSS-RTK, 3DGS.'}, en:{t:'Our Technologies – LiDAR, Photogrammetry, GNSS-RTK | Octacon',d:'Transparent explanation of our technologies: drone photogrammetry, LiDAR, GNSS-RTK, 3DGS.'} },
  about:       { de:{t:'Über uns – Octacon Geotechnik GmbH Berlin | Seit 2019',d:'Octacon Geotechnik GmbH – Ihr Partner für Geotechnik &amp; Reality Capture in Berlin.'}, en:{t:'About Us – Octacon Geotechnik GmbH Berlin | Since 2019',d:'Octacon Geotechnik GmbH – your partner for geotechnics and reality capture in Berlin.'} },
  refs:        { de:{t:'Referenzprojekte – Octacon Geotechnik GmbH Berlin',d:'Über 50 Referenzprojekte aus Geotechnik & Reality Capture in Berlin und Brandenburg: Spezialtiefbau, Bauüberwachung, Drohnenvermessung und 3D-Modellierung.'}, en:{t:'Reference Projects – Octacon Geotechnik GmbH Berlin',d:'Over 50 reference projects in geotechnics and reality capture from Berlin and Brandenburg: specialist foundation work, construction supervision and 3D surveying.'} },
  contact:     { de:{t:'Kontakt – Octacon Geotechnik GmbH Berlin',d:'Kontakt zu Octacon Geotechnik GmbH in Berlin: Erstberatung kostenlos, Antwort meist in 1–2 Werktagen. Geotechnik & Reality Capture aus einer Hand seit 2019.'}, en:{t:'Contact – Octacon Geotechnik GmbH Berlin',d:'Contact Octacon Geotechnik GmbH in Berlin: free initial consultation, reply usually in 1–2 business days. Geotechnics & Reality Capture from one source since 2019.'} },
  impressum:   { de:{t:'Impressum – Octacon Geotechnik GmbH',d:'Impressum der Octacon Geotechnik GmbH, Markgrafendamm 16, 10245 Berlin: Anbieterkennzeichnung gemäß § 5 TMG, Registereintrag und Kontaktangaben.'}, en:{t:'Legal Notice – Octacon Geotechnik GmbH',d:'Legal notice for Octacon Geotechnik GmbH, Markgrafendamm 16, 10245 Berlin: provider identification under § 5 TMG, register entry and contact information.'} },
  datenschutz: { de:{t:'Datenschutz – Octacon Geotechnik GmbH',d:'Datenschutzerklärung der Octacon Geotechnik GmbH.'}, en:{t:'Privacy Policy – Octacon Geotechnik GmbH',d:'Privacy policy of Octacon Geotechnik GmbH.'} },
};

/* ── STATE ── */
let curPage = 'home';
let lang = 'de';
let cookies = null;
let curTheme = 'dark';

/* ── THEME TOGGLE ── */
function setTheme(t) {
  curTheme = t;
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('ocgt_theme', t); } catch (e) {}
}
function toggleTheme() {
  setTheme(curTheme === 'dark' ? 'light' : 'dark');
}

/* ── ROUTING — hash-based SPA routing so every page gets a unique crawlable URL
   (Audit G1-01 / G1-03). Route map: slug ↔ page id. */
const ROUTES = {
  '':                        'home',
  'geotechnik':              'geotechnik',
  'bauueberwachung':         'a1',
  'vergabe':                 'a2',
  'grundwasser':             'a3',
  'beratung':                'a4',
  'reality-capture':         'rc',
  '3d-vermessung':           'b1',
  'baustellendokumentation': 'b2',
  'inspektionen':            'b3',
  'digitale-zwillinge':      'b4',
  'thermografie':            'b5',
  'multispektral':           'b6',
  'video-film':              'b7',
  'technologie':             'tech',
  'ueber-uns':               'about',
  'referenzen':              'refs',
  'kontakt':                 'contact',
  'impressum':               'impressum',
  'datenschutz':             'datenschutz'
};
const PAGE_TO_SLUG = Object.fromEntries(Object.entries(ROUTES).map(([s,id]) => [id, s]));
/* Path-based SPA routing: every page gets a real URL like /geotechnik
   so Google indexes them as distinct pages. Apache rewrites all paths
   back to OCGT_website.html (see .htaccess). Hash URLs (#/x) still work
   for back-compat with old bookmarks/inbound links. */
function pageToHref(id) {
  const slug = PAGE_TO_SLUG[id];
  if (slug === undefined) return '/';
  return slug ? '/' + slug : '/';
}
function canonicalURL(id) {
  const slug = PAGE_TO_SLUG[id] || '';
  return 'https://ocgt.de/' + slug;
}

/* ── NAVIGATE ── */
function go(id, skipUrl) {
  const safe = /^[a-z0-9-]+$/.test(id) ? id : 'home';
  const el = document.getElementById('p-' + safe);
  if (!el) { if (safe !== 'home') go('home'); return; }

  // Update URL via pushState so browser shows a clean, indexable path like /geotechnik.
  // (When responding to popstate/hashchange, skip this to avoid a loop.)
  if (!skipUrl) {
    const newPath = pageToHref(safe);
    if (window.location.pathname !== newPath) {
      try { history.pushState(null, '', newPath); } catch(e) { window.location.href = newPath; }
    }
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  curPage = safe;
  // Scroll to top of target page (service pages sit below persistent home sections)
  const scrollTop = (safe === 'home') ? 0 : (el.getBoundingClientRect().top + window.scrollY);
  window.scrollTo({top: scrollTop, behavior: 'instant'});
  // close mobile menu
  closeMob();

  // update meta (title + description + canonical + OG url/title)
  const m = META[safe];
  if (m) {
    const v = m[lang] || m.de;
    const titleEl = document.getElementById('pg-title');
    if (titleEl) titleEl.textContent = v.t;
    const descEl = document.getElementById('pg-desc');
    if (descEl) descEl.setAttribute('content', v.d);
    const url = canonicalURL(safe);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', v.t);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', v.d);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', v.t);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', v.d);
  }

  // highlight active nav button
  document.querySelectorAll('.nv-btn').forEach(b => b.classList.remove('nv-active'));
  const navMap = {geotechnik:'geotechnik',a1:'geotechnik',a2:'geotechnik',a3:'geotechnik',a4:'geotechnik',rc:'rc',b1:'rc',b2:'rc',b3:'rc',b4:'rc',b5:'rc',b6:'rc',b7:'rc'};
  const group = navMap[safe];
  if(group){
    document.querySelectorAll('.nv-btn').forEach(b => {
      if(b.textContent.trim().toLowerCase().includes(group === 'geotechnik' ? 'geotechnik' : 'reality')) b.classList.add('nv-active');
    });
  } else {
    document.querySelectorAll('.nv-btn').forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if((safe==='tech' && t.includes('technologie')) || (safe==='about' && t.includes('ber uns')) || (safe==='refs' && t.includes('referenz'))) b.classList.add('nv-active');
    });
  }
  // setup reveals
  setTimeout(() => {
    document.querySelectorAll('#p-'+safe+' .rv').forEach(r => observer.observe(r));
  }, 50);
  // update B1 embeds if cookies accepted
  if (cookies && safe === 'b1') loadB1Embeds();
}

/* Respond to browser back/forward or deep-link loads.
   Reads location.pathname first (real URL like /geotechnik), then falls
   back to location.hash for legacy /#/geotechnik bookmarks. */
function routeFromUrl() {
  // Prefer pathname (post-htaccess-rewrite, this is the real route)
  let slug = (window.location.pathname || '/').replace(/^\//, '').replace(/\/$/, '');
  // Strip filename (OCGT_website.html on local dev) so we don't think it's a route
  if (slug === 'OCGT_website.html' || slug === 'index.html') slug = '';
  // Legacy hash support: #/geotechnik → geotechnik
  if (!slug && window.location.hash) {
    slug = (window.location.hash || '').replace(/^#\/?/, '').replace(/^#/, '');
    slug = slug.split('?')[0].split('/').pop();
  }
  const pageId = ROUTES[slug] !== undefined ? ROUTES[slug] : 'home';
  go(pageId, /*skipUrl*/ true);
}
const routeFromHash = routeFromUrl; // alias kept for back-compat
window.addEventListener('hashchange', routeFromUrl);
window.addEventListener('popstate', routeFromUrl);
/* Run once on initial load so deep-links like /kontakt or /#/geotechnik
   resolve to the correct page instead of defaulting to home. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', routeFromUrl);
} else {
  routeFromUrl();
}

/* Delegated click handler — handles both new path-style links (/geotechnik)
   and legacy hash links (#/geotechnik). Calls go() and updates URL via
   pushState so the browser shows a clean, indexable URL. */
document.addEventListener('click', function(e) {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  let slug = null;
  if (href.startsWith('#/')) {
    slug = href.replace(/^#\/?/, '');
  } else if (href.startsWith('/') && !href.startsWith('//')) {
    // Internal path link — match against ROUTES
    slug = href.replace(/^\//, '').replace(/\/$/, '');
  } else {
    return;
  }
  const pageId = ROUTES[slug];
  if (pageId === undefined) return;
  e.preventDefault();
  go(pageId);
});

/* ── RUNTIME HREF INJECTION ──
   For every element that has `onclick="go('X')"` (inline CTAs, cards,
   breadcrumbs, etc.) AND every legacy `<a href="#/slug">` link, rewrite to
   real `href="/slug"` so right-click / middle-click / keyboard / screen-reader
   semantics all work, and so crawlers see real, indexable URLs. */
function enhanceNavElements() {
  // 1) Convert legacy hash hrefs (#/slug) to clean path hrefs (/slug)
  document.querySelectorAll('a[href^="#/"]').forEach(a => {
    const slug = a.getAttribute('href').replace(/^#\/?/, '');
    if (ROUTES[slug] === undefined) return;
    a.setAttribute('href', slug ? '/' + slug : '/');
  });
  // 2) Inject real hrefs onto onclick="go('X')" elements
  const rx = /go\(['"]([a-z0-9-]+)['"]\)/;
  document.querySelectorAll('[onclick*="go("]').forEach(el => {
    const m = (el.getAttribute('onclick') || '').match(rx);
    if (!m) return;
    const pageId = m[1];
    const slug = PAGE_TO_SLUG[pageId];
    if (slug === undefined) return;
    const href = slug ? '/' + slug : '/';
    /* For <a> — set the real href */
    if (el.tagName === 'A') {
      el.setAttribute('href', href);
      return;
    }
    /* For <button> or <div> — add accessible affordances */
    if (!el.hasAttribute('role'))     el.setAttribute('role', 'link');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    el.setAttribute('data-href', href);
    /* Keyboard Enter/Space support */
    if (!el.__ocgtKbd) {
      el.addEventListener('keydown', function(ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          el.click();
        }
      });
      el.__ocgtKbd = true;
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceNavElements);
} else {
  enhanceNavElements();
}

/* ── RELATED SERVICES — internal linking matrix.
   For each service page, surface 3 thematically related services so visitors
   (and crawlers) traverse a denser internal graph. Boosts dwell time, link
   equity flow and topical clustering for SEO. */
const RELATED_SERVICES = {
  geotechnik: ['a1','a2','a3','a4'],
  a1:         ['a3','a4','b2'],          /* Bauüberwachung → Grundwasser, Beratung, Doku */
  a2:         ['a1','a4','geotechnik'],   /* Vergabe → Bauüberwachung, Beratung, Geotechnik */
  a3:         ['a1','a4','b2'],           /* Grundwasser → Bauüberwachung, Beratung, Doku */
  a4:         ['geotechnik','a1','b4'],   /* Beratung → Geotechnik, Bauüberwachung, BIM */
  rc:         ['b1','b2','b3','b4'],
  b1:         ['rc','b2','b4'],           /* 3D-Vermessung → RC, Doku, BIM */
  b2:         ['b1','a1','b3'],           /* Doku → 3D, Bauüberwachung, Inspektion */
  b3:         ['b2','b5','rc'],           /* Inspektion → Doku, Thermografie, RC */
  b4:         ['b1','rc','a4'],           /* BIM → 3D, RC, Beratung */
  b5:         ['b3','b6','rc'],           /* Thermografie → Inspektion, Multispektral, RC */
  b6:         ['b5','b3','rc'],           /* Multispektral → Thermografie, Inspektion, RC */
  b7:         ['rc','b1','b2']            /* Video → RC, 3D, Doku */
};
const SERVICE_META = {
  geotechnik:  { icon:'lucide:layers', cat:'Geotechnik', de: { t:'Geotechnik', d:'Bauüberwachung, Vergabe, Grundwasser & Beratung' }, en: { t:'Geotechnics', d:'Supervision, tendering, groundwater & consulting' } },
  a1:          { icon:'lucide:hard-hat', cat:'Geotechnik', de: { t:'Bauüberwachung', d:'Spezialtiefbau-Überwachung im Auftrag des Bauherrn' }, en: { t:'Construction Supervision', d:'Specialist deep-foundation supervision for clients' } },
  a2:          { icon:'lucide:clipboard-list', cat:'Geotechnik', de: { t:'Vergabe', d:'VOB-konforme Ausschreibung & Bauverhandlung' }, en: { t:'Tendering', d:'VOB-compliant tendering & negotiation' } },
  a3:          { icon:'lucide:droplet', cat:'Geotechnik', de: { t:'Grundwasser', d:'Betriebsbeauftragter für das Grundwasser (WHG Berlin)' }, en: { t:'Groundwater Officer', d:'Operational groundwater officer (WHG Berlin)' } },
  a4:          { icon:'lucide:message-square', cat:'Geotechnik', de: { t:'Beratung', d:'Unabhängige geotechnische Beratung' }, en: { t:'Consulting', d:'Independent geotechnical consulting' } },
  rc:          { icon:'lucide:scan-eye', cat:'Reality Capture', de: { t:'Reality Capture', d:'3D-Drohnenvermessung & digitale Zwillinge' }, en: { t:'Reality Capture', d:'3D drone surveying & digital twins' } },
  b1:          { icon:'lucide:ruler', cat:'Reality Capture', de: { t:'3D-Vermessung', d:'Zentimeter-genaue 3D-Bestandsaufnahme aus der Luft' }, en: { t:'3D Surveying', d:'Centimeter-accurate aerial as-built capture' } },
  b2:          { icon:'lucide:camera', cat:'Reality Capture', de: { t:'Baustellendokumentation', d:'Baufortschritt mit periodischen Drohnenflügen' }, en: { t:'Site Documentation', d:'Progress tracking via repeat drone flights' } },
  b3:          { icon:'lucide:search', cat:'Reality Capture', de: { t:'Inspektionen', d:'Sichere Drohnen-Inspektion von Bauwerken' }, en: { t:'Inspections', d:'Safe drone inspection of structures' } },
  b4:          { icon:'lucide:boxes', cat:'Reality Capture', de: { t:'Digitale Zwillinge', d:'Punktwolken-zu-BIM & 3D Gaussian Splatting' }, en: { t:'Digital Twins', d:'Point-cloud-to-BIM & 3D Gaussian Splatting' } },
  b5:          { icon:'lucide:flame', cat:'Reality Capture', de: { t:'Thermografie', d:'Drohnenthermografie für Hülle & PV' }, en: { t:'Thermography', d:'Drone thermography for envelope & PV' } },
  b6:          { icon:'lucide:palette', cat:'Reality Capture', de: { t:'Multispektral', d:'Multispektrale Befliegung für Umweltgutachten' }, en: { t:'Multispectral', d:'Multispectral flights for environmental analysis' } },
  b7:          { icon:'lucide:video', cat:'Reality Capture', de: { t:'Video & Film', d:'Cinematische Drohnenvideos für Bau & Marketing' }, en: { t:'Video & Film', d:'Cinematic drone video for construction & marketing' } }
};
function injectRelatedServices() {
  Object.entries(RELATED_SERVICES).forEach(([pageId, related]) => {
    const page = document.getElementById('p-' + pageId);
    if (!page) return;
    if (page.querySelector('.related-services')) return; /* already injected */
    const block = document.createElement('section');
    block.className = 'related-services sec';
    block.setAttribute('aria-labelledby', 'rel-' + pageId);
    const cards = related.map(rid => {
      const m = SERVICE_META[rid]; if (!m) return '';
      const slug = PAGE_TO_SLUG[rid] || '';
      const href = slug ? '/' + slug : '/';
      const icon = m.icon || 'lucide:arrow-right';
      const cat = m.cat || '';
      return `
        <a class="rel-card" href="${href}" onclick="event.preventDefault();go('${rid}')">
          <span class="rel-card-ico" aria-hidden="true"><iconify-icon icon="${icon}"></iconify-icon></span>
          <span class="rel-card-cat">${cat}</span>
          <h3>
            <span class="de-only" data-de="${m.de.t}">${m.de.t}</span><span class="en-only" data-en="${m.en.t}">${m.en.t}</span>
          </h3>
          <p>
            <span class="de-only" data-de="${m.de.d}">${m.de.d}</span><span class="en-only" data-en="${m.en.d}">${m.en.d}</span>
          </p>
          <span class="rel-card-cta" aria-hidden="true">
            <span class="rel-card-cta-line"></span>
            <iconify-icon icon="lucide:arrow-up-right"></iconify-icon>
          </span>
        </a>`;
    }).join('');
    block.innerHTML = `
      <div class="lbl"><span class="de-only" data-de="Verwandte Leistungen">Verwandte Leistungen</span><span class="en-only" data-en="Related services">Related services</span></div>
      <h2 class="ttl" id="rel-${pageId}"><span class="de-only" data-de="Das könnte Sie auch interessieren">Das könnte Sie auch interessieren</span><span class="en-only" data-en="You might also be interested in">You might also be interested in</span></h2>
      <div class="rel-grid">${cards}</div>
    `;
    page.appendChild(block);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectRelatedServices);
} else {
  injectRelatedServices();
}

/* ── IMAGE PERFORMANCE — apply native lazy-loading and async decoding to every
   non-critical image. The first image (typically the logo or hero poster) and
   anything explicitly marked data-eager are kept eager so LCP isn't deferred.
   Browsers ignore loading="lazy" on images that are already in the viewport,
   so this is a safe blanket pass with a per-element opt-out. */
function enhanceImagePerformance() {
  const imgs = document.querySelectorAll('img');
  imgs.forEach((img, i) => {
    if (img.dataset.eager === 'true') return;
    if (i === 0) return; /* keep first paint candidate eager */
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    /* Add fetchpriority=low to clearly below-fold images — Chrome optimization */
    if (!img.hasAttribute('fetchpriority') && img.getAttribute('loading') === 'lazy') {
      img.setAttribute('fetchpriority', 'low');
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceImagePerformance);
} else {
  enhanceImagePerformance();
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-NAV SLIDING CAPSULE (Direction A — Apple segmented control)
   - Injects a <span class="sub-nav-indicator"> into every .sub-nav-inner
   - Position + width track the .act tab with a spring transition
   - Keyboard: ← → Home End cycle tabs (standard tablist pattern)
   - Auto-scrolls active tab into view on mobile
   - Updates on: load, go() navigation, window resize, language change
═══════════════════════════════════════════════════════════════════ */
(function initSubNavCapsule(){
  function setupContainer(container) {
    if (container.__ocgtSubNavInit) return;
    container.__ocgtSubNavInit = true;

    /* Inject sliding capsule if not already present */
    let indicator = container.querySelector('.sub-nav-indicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'sub-nav-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      container.insertBefore(indicator, container.firstChild);
    }

    /* A11y: make the container a proper tablist */
    container.setAttribute('role', 'tablist');

    const tabs = container.querySelectorAll('.sub-nav-lnk');
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('act') ? 'true' : 'false');

      /* Hover: preview-glide the capsule to the hovered tab */
      tab.addEventListener('mouseenter', () => moveIndicatorTo(container, tab));
      /* Mouse leave back to the active one */
      tab.addEventListener('mouseleave', () => moveIndicatorToActive(container));

      /* Keyboard arrow navigation */
      tab.addEventListener('keydown', (e) => {
        const list = [...container.querySelectorAll('.sub-nav-lnk')];
        const idx  = list.indexOf(e.currentTarget);
        let next = idx;
        if (e.key === 'ArrowRight') next = (idx + 1) % list.length;
        else if (e.key === 'ArrowLeft') next = (idx - 1 + list.length) % list.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = list.length - 1;
        else return;
        e.preventDefault();
        list[next].focus();
      });
    });
  }

  function moveIndicatorTo(container, tab) {
    const indicator = container.querySelector('.sub-nav-indicator');
    if (!indicator || !tab) return;
    const cRect = container.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    /* Account for horizontal scroll position inside the container */
    const scrollLeft = container.scrollLeft || 0;
    const left  = tRect.left - cRect.left + scrollLeft;
    const width = tRect.width;
    if (width === 0) return; /* container not visible yet */
    indicator.style.left  = left + 'px';
    indicator.style.width = width + 'px';
    indicator.classList.add('is-ready');
  }

  function moveIndicatorToActive(container) {
    const active = container.querySelector('.sub-nav-lnk.act');
    if (active) moveIndicatorTo(container, active);
  }

  /* Scan and set up every .sub-nav-inner on the page */
  function setupAll() {
    document.querySelectorAll('.sub-nav-inner').forEach(setupContainer);
    document.querySelectorAll('.sub-nav').forEach(setupChevrons);
  }

  /* Chevron scroll buttons (Linear/Framer-style) — inject once per .sub-nav */
  function setupChevrons(outer) {
    if (outer.__ocgtChevronsInit) return;
    outer.__ocgtChevronsInit = true;
    const inner = outer.querySelector('.sub-nav-inner');
    if (!inner) return;

    const chevL = document.createElement('button');
    chevL.type = 'button';
    chevL.className = 'sub-nav-chev sub-nav-chev-left';
    chevL.setAttribute('aria-label', 'Zurück scrollen');
    chevL.setAttribute('tabindex', '-1');  /* not keyboard-navigable — keyboard users already have arrow keys */
    chevL.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

    const chevR = document.createElement('button');
    chevR.type = 'button';
    chevR.className = 'sub-nav-chev sub-nav-chev-right';
    chevR.setAttribute('aria-label', 'Weiter scrollen');
    chevR.setAttribute('tabindex', '-1');
    chevR.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    outer.appendChild(chevL);
    outer.appendChild(chevR);

    /* Scroll by one tab-width per click */
    function scrollBy(dir) {
      const firstTab = inner.querySelector('.sub-nav-lnk');
      const step = firstTab ? firstTab.getBoundingClientRect().width + 4 : 140;
      inner.scrollBy({ left: step * dir * 2, behavior: 'smooth' });
    }
    chevL.addEventListener('click', (e) => { e.preventDefault(); scrollBy(-1); });
    chevR.addEventListener('click', (e) => { e.preventDefault(); scrollBy( 1); });

    /* Show only when there's actually overflow, and reflect scroll position.
       Also toggles `.is-overflowing` on the inner — which is what activates the fade mask
       (prevents the visible-strip artifact when all tabs fit). */
    function syncChevrons() {
      const overflow = inner.scrollWidth > inner.clientWidth + 1;
      inner.classList.toggle('is-overflowing', overflow);
      chevL.classList.toggle('is-shown', overflow);
      chevR.classList.toggle('is-shown', overflow);
      if (!overflow) return;
      chevL.classList.toggle('is-disabled', inner.scrollLeft <= 2);
      chevR.classList.toggle('is-disabled', inner.scrollLeft >= inner.scrollWidth - inner.clientWidth - 2);
      /* Position chevrons right at the edges of the inner pill */
      const rect = inner.getBoundingClientRect();
      const outerRect = outer.getBoundingClientRect();
      chevL.style.left  = (rect.left  - outerRect.left - 16) + 'px';
      chevR.style.left  = '';
      chevR.style.right = (outerRect.right - rect.right - 16) + 'px';
    }
    inner.addEventListener('scroll', syncChevrons, { passive: true });
    window.addEventListener('resize', syncChevrons);
    /* Initial + re-sync on visibility (page change) */
    outer.__ocgtSyncChevrons = syncChevrons;
    setTimeout(syncChevrons, 50);
    setTimeout(syncChevrons, 200);
  }

  /* Update indicator on every currently visible sub-nav */
  function updateAllVisible() {
    document.querySelectorAll('.page.on .sub-nav-inner').forEach(container => {
      moveIndicatorToActive(container);
      /* Auto-scroll active tab into view on horizontal-scroll nav */
      const active = container.querySelector('.sub-nav-lnk.act');
      if (active && container.scrollWidth > container.clientWidth) {
        active.scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
      }
    });
    /* Re-sync chevron visibility + enabled-state */
    document.querySelectorAll('.page.on .sub-nav').forEach(outer => {
      if (typeof outer.__ocgtSyncChevrons === 'function') outer.__ocgtSyncChevrons();
    });
  }

  /* Hook into page navigation: wrap the global go() so we refresh the indicator.
     Uses setTimeout (not rAF) so it still fires in background tabs / iframes where
     rAF is throttled. Double-tick: 0 for layout, 60 for post-paint safety. */
  function hookIntoGo() {
    const originalGo = window.go;
    if (typeof originalGo !== 'function' || originalGo.__ocgtSubNavWrapped) return;
    window.go = function wrappedGo() {
      const result = originalGo.apply(this, arguments);
      setTimeout(updateAllVisible, 0);
      setTimeout(updateAllVisible, 60);  /* belt-and-suspenders after paint */
      return result;
    };
    window.go.__ocgtSubNavWrapped = true;
  }

  function boot() {
    setupAll();
    hookIntoGo();
    /* First positioning after layout settles */
    setTimeout(updateAllVisible, 0);
    setTimeout(updateAllVisible, 120);
    /* Font loading can shift widths — refresh after Geist loads */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateAllVisible);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── Sector tiles: seamless infinite marquee ──
     Wraps tiles in a track, clones once; CSS animates translateX 0 → -50% */
  (function initSectorMarquee(){
    const wrap = document.querySelector('.sector-scroll');
    if (!wrap) return;
    if (wrap.querySelector('.sector-track')) return; /* already initialised */
    const tiles = Array.from(wrap.children).filter(n => n.nodeType === 1);
    if (!tiles.length) return;
    const track = document.createElement('div');
    track.className = 'sector-track';
    tiles.forEach(t => track.appendChild(t));
    tiles.forEach(t => {
      const clone = t.cloneNode(true);
      clone.setAttribute('aria-hidden','true');
      /* strip interactive IDs inside clones to avoid duplicates */
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      track.appendChild(clone);
    });
    wrap.appendChild(track);
  })();

  /* Keep indicator aligned on resize (container reflows) */
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(updateAllVisible);
  }, { passive: true });

  /* Re-sync after language switch (tab widths change in DE vs EN) */
  document.addEventListener('ocgt:langchange', updateAllVisible);

  /* Expose for manual refresh if needed */
  window.__ocgtUpdateSubNav = updateAllVisible;
})();

/* ── COOKIE DIALOG — focus trap + aria-modal (Audit E2-02 / H2-02 / I1-05) ── */
(function initCookieA11y(){
  const modal = document.getElementById('cookie');
  if (!modal) return;
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  let lastFocus = null;
  function focusables() {
    return Array.from(modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);
  }
  function trap(e) {
    if (!modal.classList.contains('show')) return;
    if (e.key === 'Escape') {
      const btn = modal.querySelector('[onclick*="declineCookies"]') ||
                  modal.querySelector('button');
      if (btn) btn.click();
      return;
    }
    if (e.key !== 'Tab') return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
  document.addEventListener('keydown', trap);
  /* When dialog shown, move focus in; when hidden, restore */
  const mo = new MutationObserver(() => {
    if (modal.classList.contains('show')) {
      lastFocus = document.activeElement;
      setTimeout(() => { const l = focusables(); if (l.length) l[0].focus(); }, 100);
    } else if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  });
  mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
})();

/* ── PAUSE Three.js + heavy animations when tab is hidden (Audit F2-01 / E2-03) ── */
document.addEventListener('visibilitychange', function() {
  const hero = document.querySelector('.hero-x');
  if (!hero) return;
  if (document.visibilityState === 'hidden') {
    hero.classList.add('is-paused');
  } else {
    hero.classList.remove('is-paused');
  }
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('vis'); observer.unobserve(e.target); } });
}, { threshold:.1 });
document.querySelectorAll('.rv').forEach(el => observer.observe(el));

/* ── PREMIUM (#p-geotechnik + #p-rc) — staggered reveal, count-up, parallax, scroll-CTA ── */
(function(){
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAGE_SEL = '#p-geotechnik, #p-rc';

  /* Stagger reveal for geo-feat-grid + opt-in .premium-stagger containers */
  const grids = document.querySelectorAll(
    '#p-geotechnik .geo-feat-grid, #p-rc .geo-feat-grid, ' +
    '#p-geotechnik .premium-stagger, #p-rc .premium-stagger'
  );
  if (grids.length && 'IntersectionObserver' in window) {
    const gridObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); gridObs.unobserve(e.target); }
      });
    }, { threshold:.18 });
    grids.forEach(g => gridObs.observe(g));
  } else {
    grids.forEach(g => g.classList.add('is-revealed'));
  }

  /* Count-up for proof-bar numbers (50+, 100%, 7+, 4)
     Skips elements that contain child element nodes or carry data-de/data-en
     attributes — overwriting textContent on those would wipe bilingual spans
     or trample the language toggle's data-attribute output. */
  const animateCount = (el) => {
    if (el.children.length > 0) return;
    if (el.hasAttribute('data-de') || el.hasAttribute('data-en')) return;
    const txt = el.textContent.trim();
    const m = txt.match(/^(\d+)(.*)$/);
    if (!m) return;
    const target = parseInt(m[1], 10);
    const suffix = m[2];
    if (target < 4 || target > 200) return;
    const duration = 900;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const v = Math.round(target * ease(p));
      el.textContent = v + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduced && 'IntersectionObserver' in window) {
    const metas = document.querySelectorAll('#p-geotechnik .svc-hero-meta, #p-rc .svc-hero-meta');
    metas.forEach(meta => {
      const numObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            meta.querySelectorAll('strong').forEach(animateCount);
            numObs.unobserve(e.target);
          }
        });
      }, { threshold:.4 });
      numObs.observe(meta);
    });
  }

  /* Cursor-follow micro-parallax on hero media (img or video) */
  if (!reduced) {
    const heroSecs = document.querySelectorAll('#p-geotechnik .svc-hero--media, #p-rc .svc-hero--media');
    heroSecs.forEach(heroSec => {
      const heroEl = heroSec.querySelector('.svc-hero-media img, .svc-hero-media video');
      if (!heroEl) return;
      let raf = 0;
      heroSec.addEventListener('mousemove', (ev) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = heroSec.getBoundingClientRect();
          const dx = ((ev.clientX - r.left) / r.width  - .5) * 2;
          const dy = ((ev.clientY - r.top)  / r.height - .5) * 2;
          heroEl.style.transform = `scale(1.10) translate(${(-dx*1.2).toFixed(2)}px, ${(-dy*1.2).toFixed(2)}px)`;
          raf = 0;
        });
      });
      heroSec.addEventListener('mouseleave', () => {
        heroEl.style.transform = '';
      });
    });
  }

  /* Floating CTA — show after 18% page scroll (deferred until DOM ready
     because #consult-float is rendered at the end of <body>) */
  const wireCTA = () => {
    const cta = document.getElementById('consult-float');
    if (!cta) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      if (pct > 0.18) cta.classList.add('is-visible');
      else cta.classList.remove('is-visible');
    };
    window.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update, { passive:true });
    update();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireCTA);
  else wireCTA();
})();

/* ── MOBILE MENU ── */
function toggleMob() {
  const m = document.getElementById('mob-menu');
  const b = document.getElementById('mob-btn');
  const bd = document.getElementById('mob-backdrop');
  const open = m.classList.toggle('open');
  if(bd) bd.style.display = open ? 'block' : 'none';
  document.body.classList.toggle('mob-open', open);
  b.setAttribute('aria-expanded', String(open));
  b.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
}
function closeMob() {
  const m = document.getElementById('mob-menu');
  const b = document.getElementById('mob-btn');
  const bd = document.getElementById('mob-backdrop');
  m.classList.remove('open');
  if(bd) bd.style.display = 'none';
  document.body.classList.remove('mob-open');
  b.setAttribute('aria-expanded','false');
  b.setAttribute('aria-label','Menü öffnen');
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeMob();
});

/* ── DYNAMIC ISLAND SCROLL BEHAVIOUR ── */
(function(){
  const nav = document.getElementById('nav');
  let lastY = 0;
  let ticking = false;
  let locked = false;
  let cooldown = false;       // prevents rapid toggle flickering
  const DEAD_ZONE = 14;       // px of scroll movement to ignore (prevents jitter)
  const COLLAPSE_ZONE = 100;  // don't collapse until scrolled past this point

  let dropTimer = null;
  function onScroll(){
    if(locked){ ticking = false; return; }

    /* ── Close dropdowns on any scroll ── */
    nav.classList.add('drop-lock');
    // Blur any focused nav button so focus-within can't keep dropdown open
    const focused = nav.querySelector('.nv-btn:focus, .drop-lnk:focus');
    if(focused) focused.blur();
    if(dropTimer) clearTimeout(dropTimer);
    dropTimer = setTimeout(() => { nav.classList.remove('drop-lock'); }, 200);

    ticking = false;
  }

  function setCooldown(){
    cooldown = true;
    setTimeout(() => { cooldown = false; }, 300);
  }

  window.addEventListener('scroll', () => {
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });

  // click mini island to expand — lock scroll for 600ms so it stays open
  nav.addEventListener('click', e => {
    if(nav.classList.contains('nav-mini')){
      nav.classList.remove('nav-mini');
      lastY = window.scrollY;
      locked = true;
      setTimeout(() => { locked = false; lastY = window.scrollY; }, 600);
    }
  });
})();

/* ── CLOSE MOBILE MENU ON OUTSIDE CLICK ── */
document.addEventListener('click', e => {
  const mob = document.getElementById('mob-menu');
  const btn = document.getElementById('mob-btn');
  if(mob.classList.contains('open') && !mob.contains(e.target) && !btn.contains(e.target)){
    closeMob();
  }
});

/* ── CLOSE DROPDOWN AFTER LINK CLICK ── */
document.querySelectorAll('.drop-lnk').forEach(lnk => {
  lnk.addEventListener('click', () => {
    const drop = lnk.closest('.nv');
    if(drop) drop.blur();
  });
});

/* ── MAGNETIC CURSOR-REACTIVE NAV ── */
(function initMagneticNav(){
  const nav = document.getElementById('nav');
  if(!nav) return;
  const links = nav.querySelector('.nav-links');
  if(!links) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Create sliding indicator */
  const indicator = document.createElement('span');
  indicator.className = 'nav-indicator';
  links.appendChild(indicator);

  const items = links.querySelectorAll('.nv-btn');

  function moveIndicator(btn){
    const linksRect = links.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    indicator.style.left = (btnRect.left - linksRect.left) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  items.forEach(btn => {
    /* Enter: mark hovered, move indicator */
    btn.addEventListener('mouseenter', () => {
      items.forEach(b => b.classList.remove('is-hovered'));
      btn.classList.add('is-hovered');
      moveIndicator(btn);
    });

    /* Magnetic pull via mousemove */
    btn.addEventListener('mousemove', e => {
      if(reducedMotion) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.18;
      const dy = (e.clientY - cy) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.classList.remove('is-hovered');
    });
  });

  /* Clear indicator when leaving the whole nav-links */
  links.addEventListener('mouseleave', () => {
    indicator.style.opacity = '0';
    setTimeout(() => {
      if(!links.matches(':hover')) indicator.style.width = '0';
    }, 400);
  });
  links.addEventListener('mouseenter', () => {
    indicator.style.opacity = '';
  });

  /* Aurora sweep on scroll */
  let auroraTimer;
  window.addEventListener('scroll', () => {
    nav.classList.add('aurora-on');
    clearTimeout(auroraTimer);
    auroraTimer = setTimeout(() => nav.classList.remove('aurora-on'), 2000);
  }, { passive: true });
})();

/* ── LANGUAGE ── */
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.classList.remove('lang-de','lang-en');
  document.documentElement.classList.add('lang-'+l);
  document.getElementById('btn-de').classList.toggle('act', l==='de');
  document.getElementById('btn-en').classList.toggle('act', l==='en');
  document.getElementById('btn-de').setAttribute('aria-pressed', String(l==='de'));
  document.getElementById('btn-en').setAttribute('aria-pressed', String(l==='en'));
  var mbd=document.getElementById('mob-btn-de'), mbe=document.getElementById('mob-btn-en');
  if(mbd){mbd.classList.toggle('act',l==='de');} if(mbe){mbe.classList.toggle('act',l==='en');}
  document.querySelectorAll('[data-de]').forEach(el => {
    const txt = el.getAttribute('data-'+l);
    if(txt) el.textContent = txt;
  });
  /* Bilingual placeholders (inputs / textareas) */
  document.querySelectorAll('[data-ph-de]').forEach(el => {
    const txt = el.getAttribute('data-ph-'+l);
    if(txt != null) el.setAttribute('placeholder', txt);
  });
  /* Bilingual optgroup labels */
  document.querySelectorAll('optgroup[data-label-de]').forEach(el => {
    const txt = el.getAttribute('data-label-'+l);
    if(txt) el.setAttribute('label', txt);
  });
  const m = META[curPage];
  if(m) { const v = m[l]||m.de; document.getElementById('pg-title').textContent=v.t; document.getElementById('pg-desc').setAttribute('content',v.d); }
  // Switch aria-label on sections with language-aware data attributes
  document.querySelectorAll('[data-aria-label-'+l+']').forEach(function(el){
    el.setAttribute('aria-label', el.getAttribute('data-aria-label-'+l));
  });
  if (typeof rerenderBilingual === 'function') rerenderBilingual();
  /* Tech-comparison tables: copy <th> text to each <td> data-label so the
     mobile stacked-card layout shows column labels in the active language. */
  document.querySelectorAll('.tech-table').forEach(function(tbl){
    const heads = Array.from(tbl.querySelectorAll('thead th')).map(th => th.textContent.trim());
    tbl.querySelectorAll('tbody tr').forEach(function(tr){
      Array.from(tr.children).forEach(function(td, i){
        if (heads[i]) td.setAttribute('data-label', heads[i]);
      });
    });
  });
  try { localStorage.setItem('ocgt_lang',l); } catch(e){}
  /* Notify listeners (sub-nav capsule, other i18n-aware components) so they can re-measure */
  document.dispatchEvent(new CustomEvent('ocgt:langchange', { detail: { lang: l } }));
}

/* ── COOKIE CONSENT ── */
const PIX4D_2D = `<iframe class="embed-frame" src="https://cloud.pix4d.com/embed/pro/map/2094917?shareToken=e8a47faf-6737-490c-90f3-7b465425252e" allowfullscreen loading="lazy" title="PIX4D 2D Orthofoto" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
const PIX4D_3D = `<iframe class="embed-frame" src="https://cloud.pix4d.com/embed/pro/mesh/2094917?shareToken=e8a47faf6737490c90f37b465425252e" allowfullscreen loading="lazy" title="PIX4D 3D Mesh" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
const PIX4D_REF = `<iframe class="embed-frame" style="height:280px" src="https://cloud.pix4d.com/embed/pro/map/2094917?shareToken=e8a47faf-6737-490c-90f3-7b465425252e" allowfullscreen loading="lazy" title="PIX4D Referenzprojekt" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
/* Live demo embeds — Ortho & Point Cloud share dataset 2647627; Mesh & Gaussian Splatting
   each have their own dedicated dataset so the embed loads only that layer. Annotations
   set on each PIX4D dataset are visible in the embed via the share token. */
const EMBED_ORTHO      = '<iframe class="embed-frame" src="https://cloud.pix4d.com/dataset/2652881/model?shareToken=401b653a-96cc-4d63-9461-0a8373f14620" allowfullscreen loading="lazy" title="PIX4D Orthofoto"          sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
const EMBED_POINTCLOUD = '<iframe class="embed-frame" src="https://cloud.pix4d.com/dataset/2652837/model?shareToken=e659e1b0-f204-47d8-86d3-153cc5ee7994" allowfullscreen loading="lazy" title="PIX4D Punktwolke"         sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
const EMBED_MESH       = '<iframe class="embed-frame" src="https://cloud.pix4d.com/dataset/2649807/model?shareToken=4174ceda-5d40-43e1-baaa-329e7553985a" allowfullscreen loading="lazy" title="PIX4D 3D Mesh"           sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
const EMBED_SPLAT      = '<iframe class="embed-frame" src="https://cloud.pix4d.com/dataset/2649803/model?shareToken=9e5a8015-e691-4ca4-9322-6acf1be5ba0c" allowfullscreen loading="lazy" title="PIX4D Gaussian Splatting" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
function pendingViewerHTML(deTitle, enTitle){
  return '<div class="live-blocked"><div class="live-blocked-icon live-blocked-icon--spin"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="1.6" opacity=".25"/><path d="M22 8a14 14 0 0 1 14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><h3 class="live-blocked-title"><span class="de-only">' + deTitle + ' wird vorbereitet</span><span class="en-only">' + enTitle + ' being prepared</span></h3><p class="live-blocked-desc"><span class="de-only">Dieser Viewer wird in Kürze freigeschaltet. Schauen Sie bald wieder vorbei – oder kontaktieren Sie uns für einen direkten Zugriff.</span><span class="en-only">This viewer is being unlocked shortly. Check back soon — or contact us for direct access.</span></p></div>';
}

function acceptCookies() {
  cookies = true;
  try { localStorage.setItem('ocgt_cookies','1'); } catch(e){}
  document.getElementById('cookie').classList.remove('show');
  loadAllEmbeds();
}
function declineCookies() {
  cookies = false;
  try { localStorage.setItem('ocgt_cookies','0'); } catch(e){}
  document.getElementById('cookie').classList.remove('show');
}
function resetCookies() {
  try { localStorage.removeItem('ocgt_cookies'); } catch(e){}
  cookies = null;
  document.getElementById('cookie').classList.add('show');
}
function openYT(id, el) {
  if (el) { event && event.stopPropagation && event.stopPropagation(); }
  const lb = document.getElementById('vid-lb');
  const fr = document.getElementById('vid-lb-frame');
  fr.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  lb.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeYT() {
  const lb = document.getElementById('vid-lb');
  const fr = document.getElementById('vid-lb-frame');
  lb.classList.remove('is-open');
  fr.innerHTML = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeYT(); });
/* Ambient-preview loader — lazy-inject muted autoplay-loop iframes only for the most visible tiles.
   Bounded concurrency (MAX_ACTIVE) prevents many parallel YouTube streams from hurting perf. */
(function(){
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MAX_ACTIVE = 2;
  const visibility = new Map();
  function activate(tile){
    const frame = tile.querySelector('.vid-ambient-frame');
    if (!frame || frame.querySelector('iframe')) return;
    const id = tile.getAttribute('data-vid'); if (!id) return;
    const src = 'https://www.youtube-nocookie.com/embed/' + id
      + '?autoplay=1&mute=1&loop=1&playlist=' + id
      + '&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&fs=0';
    frame.innerHTML = '<iframe src="' + src + '" title="" tabindex="-1" aria-hidden="true" allow="autoplay; encrypted-media" loading="lazy"></iframe>';
    requestAnimationFrame(() => frame.classList.add('is-live'));
  }
  function deactivate(tile){
    const frame = tile.querySelector('.vid-ambient-frame'); if (!frame) return;
    frame.classList.remove('is-live');
    frame.innerHTML = '';
  }
  function reconcile(){
    const ranked = [...visibility.entries()]
      .filter(([,r]) => r > 0)
      .sort((a,b) => b[1] - a[1]);
    const active = new Set(ranked.slice(0, MAX_ACTIVE).map(([t]) => t));
    visibility.forEach((_, tile) => { active.has(tile) ? activate(tile) : deactivate(tile); });
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => visibility.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
    reconcile();
  }, { rootMargin: '100px 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
  document.querySelectorAll('.vid-ambient').forEach(t => { visibility.set(t, 0); io.observe(t); });
})();
function loadAllEmbeds() {
  const eo=document.getElementById('e-ortho');      if(eo&&!eo.querySelector('iframe')) eo.innerHTML = EMBED_ORTHO || pendingViewerHTML('Orthofoto-Viewer','Orthomap viewer');
  const ep=document.getElementById('e-pointcloud'); if(ep&&!ep.querySelector('iframe')) ep.innerHTML = EMBED_POINTCLOUD || pendingViewerHTML('Punktwolken-Viewer','Point cloud viewer');
  const em=document.getElementById('e-mesh');       if(em&&!em.querySelector('iframe')) em.innerHTML = EMBED_MESH || pendingViewerHTML('3D Mesh-Viewer','3D mesh viewer');
  const es=document.getElementById('e-splat');      if(es&&!es.querySelector('iframe')) es.innerHTML = EMBED_SPLAT || pendingViewerHTML('Gaussian Splatting Viewer','Gaussian Splatting viewer');
  ['b1-2d'].forEach(id => { const el=document.getElementById(id); if(el&&!el.querySelector('iframe')) el.innerHTML=PIX4D_2D; });
  ['b1-3d'].forEach(id => { const el=document.getElementById(id); if(el&&!el.querySelector('iframe')) el.innerHTML=PIX4D_3D; });
  const rp=document.getElementById('refs-pix4d'); if(rp&&!rp.querySelector('iframe')) rp.innerHTML=PIX4D_REF;
}
function loadB1Embeds() {
  const e2=document.getElementById('b1-2d'); if(e2&&!e2.querySelector('iframe')) e2.innerHTML=PIX4D_2D;
  const e3=document.getElementById('b1-3d'); if(e3&&!e3.querySelector('iframe')) e3.innerHTML=PIX4D_3D;
}
function scrollToDemo() {
  document.getElementById('demo-anchor').scrollIntoView({behavior:'smooth'});
}

/* ── REFERENCES BENTO FILTER ── */
(function initRefsFilter(){
  const filter = document.querySelector('.refs-filter');
  const bento  = document.querySelector('.refs-bento');
  if(!filter || !bento) return;
  const chips  = filter.querySelectorAll('.refs-filter-chip');
  const cards  = bento.querySelectorAll('.ref-card');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      const f = chip.dataset.filter;
      cards.forEach(card => {
        const cats = (card.dataset.cat || '').split(/\s+/);
        const show = f === 'all' || cats.includes(f);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });
})();

/* ── CONTACT SERVICE PICKER CHIPS ── */
(function initContactSvcPicker(){
  const picker = document.querySelector('.contact-svc-picker');
  if(!picker) return;
  const select = document.querySelector('#p-contact select[name="leistung"]');
  const chips = picker.querySelectorAll('.contact-svc-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      const v = chip.dataset.svc;
      if(select && v){
        for(const opt of select.options){
          if(opt.value === v){ select.value = opt.value; break; }
        }
      }
    });
  });
})();



/* Legacy hero-video autoplay removed — the video is now a fallback only,
   revealed by showVideoFallback() in initSplat when Three.js is unavailable. */

/* ── FORM ──
   Critical rules:
   1. If FORMSPREE endpoint is not configured, fall back to mailto: so leads are
      never silently lost (Audit C1-01).
   2. Route sanitized values to the network payload (Audit C1-02).
   3. Honeypot check: hidden field `.hp input` AND explicit `website_url` input.
   4. Submission state: disable button, show progress text; re-enable on error.
   5. Specific success message with name + email echoed back.
*/
function san(s){if(typeof s!=='string')return'';return s.replace(/[<>"'&/]/g,c=>({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','&':'&amp;','/':'&#x2F;'}[c]||c)).trim().slice(0,2000);}
function validEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);}
function showFErr(fid,eid,show){const f=document.getElementById(fid),e=document.getElementById(eid);if(f)f.classList.toggle('err',show);if(e)e.classList.toggle('show',show);}

/* ⚠️ ACTION REQUIRED: Set FORMSPREE_ENDPOINT before launch.
   1. Sign up free at https://formspree.io
   2. Create a new form → copy the endpoint ID
   3. Paste it below, e.g. 'https://formspree.io/f/xyzabc123'
   While this stays empty, the form falls back to the user's mail client
   (mailto:) so leads are not lost — but the UX is worse and bots can scrape
   the email. Replacing this is the single most important pre-launch task. */
const FORMSPREE_ENDPOINT = '';  // e.g. 'https://formspree.io/f/xyzabc123'

async function submitForm(ev) {
  ev.preventDefault();
  const form = ev.target;
  /* Dual honeypot — legacy `.hp input` + WCAG-friendly off-screen `website_url` */
  const hp1 = form.querySelector('.hp input');
  const hp2 = form.querySelector('[name="website_url"]');
  if ((hp1 && hp1.value.trim()) || (hp2 && hp2.value.trim())) {
    /* Bot detected — fake success, silently drop */
    document.getElementById('form').style.display = 'none';
    document.getElementById('f-ok').style.display = 'block';
    return;
  }

  document.getElementById('f-err-global').style.display = 'none';
  showFErr('f-fn','e-fn',false); showFErr('f-ln','e-ln',false);
  showFErr('f-em','e-em',false); showFErr('f-msg','e-msg',false);

  /* Sanitize all user-controlled strings — payload uses these values, not raw */
  const fn  = san(document.getElementById('f-fn').value);
  const ln  = san(document.getElementById('f-ln').value);
  const rawEm = document.getElementById('f-em').value.trim();
  const em  = san(rawEm);
  const msg = san(document.getElementById('f-msg').value);
  const co  = san((form.querySelector('[name="firma"]')||{}).value || '');
  const sv  = san((form.querySelector('[name="leistung"]')||{}).value || '');
  const gdpr = document.getElementById('gdpr').checked;

  const isEN = (typeof lang !== 'undefined' && lang === 'en');

  let ok = true;
  if (!fn)               { showFErr('f-fn','e-fn',true);  ok = false; }
  if (!ln)               { showFErr('f-ln','e-ln',true);  ok = false; }
  if (!validEmail(rawEm)){ showFErr('f-em','e-em',true);  ok = false; }
  if (!msg)              { showFErr('f-msg','e-msg',true); ok = false; }
  if (!gdpr) {
    const g = document.getElementById('f-err-global');
    g.textContent = isEN
      ? 'Please accept the privacy policy.'
      : 'Bitte stimmen Sie der Datenschutzerklärung zu.';
    g.style.display = 'block';
    ok = false;
  }
  if (!ok) return;

  const btn = document.getElementById('sub-btn');
  const txt = document.getElementById('sub-txt');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  const originalTxt = txt.textContent;
  txt.textContent = isEN ? 'Sending…' : 'Wird gesendet…';

  /* ---- Submission strategy ---- */
  async function viaFetch() {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);  // 15s timeout
    try {
      const r = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: fn, nachname: ln, email: em, firma: co,
          leistung: sv, nachricht: msg,
          _subject: isEN ? 'New enquiry — OCGT Website' : 'Neue Anfrage — OCGT Website',
          _replyto: em,
          /* Cloudflare Turnstile token. Empty if widget hasn't been
             configured yet (placeholder site key) — server still rejects
             when TURNSTILE_SECRET is set, otherwise allows for backwards
             compatibility during initial rollout. */
          cfTurnstileToken: (form.querySelector('[name="cf-turnstile-response"]')||{}).value || ''
        }),
        signal: ctrl.signal
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error('server ' + r.status);
      return true;
    } catch (err) {
      clearTimeout(timeout);
      return false;
    }
  }

  function viaMailto() {
    const subject = encodeURIComponent(
      (isEN ? 'New enquiry via ocgt.de' : 'Neue Anfrage via ocgt.de') + (sv ? ' — ' + sv : '')
    );
    const body = encodeURIComponent(isEN ? [
      'First name: ' + fn,
      'Last name: ' + ln,
      'E-Mail: ' + em,
      'Company: ' + co,
      'Service: ' + sv,
      '',
      'Message:',
      msg,
      '',
      '--',
      'Sent via ocgt.de on ' + new Date().toISOString()
    ].join('\n') : [
      'Vorname: ' + fn,
      'Nachname: ' + ln,
      'E-Mail: ' + em,
      'Unternehmen: ' + co,
      'Leistung: ' + sv,
      '',
      'Nachricht:',
      msg,
      '',
      '--',
      'Gesendet über ocgt.de am ' + new Date().toISOString()
    ].join('\n'));
    window.location.href = 'mailto:info@ocgt.de?subject=' + subject + '&body=' + body;
  }

  let delivered = false;
  if (FORMSPREE_ENDPOINT) {
    delivered = await viaFetch();
    if (!delivered) viaMailto();
  } else {
    viaMailto();
    delivered = true;  // mail client opened; treat as user-delivered
  }

  /* Specific success message echoing the user's own name + email */
  const okPanel = document.getElementById('f-ok');
  const okTitle = okPanel && okPanel.querySelector('h3');
  const okDesc  = okPanel && okPanel.querySelector('p');
  if (okTitle && okDesc) {
    okTitle.textContent = isEN
      ? `Thank you, ${fn}!`
      : `Vielen Dank, ${fn}!`;
    okDesc.textContent = isEN
      ? `Your message has been sent. We'll get back to you within 1–2 business days at ${em}.`
      : `Ihre Nachricht wurde gesendet. Wir melden uns innerhalb von 1–2 Werktagen unter ${em} bei Ihnen.`;
  }

  document.getElementById('form').style.display = 'none';
  if (okPanel) okPanel.style.display = 'block';

  btn.disabled = false;
  btn.removeAttribute('aria-busy');
  txt.textContent = originalTxt;
}

/* ── INIT ── */
(function init() {
  /* Restore theme preference */
  try { const st=localStorage.getItem('ocgt_theme'); if(st==='light'||st==='dark') curTheme=st; } catch(e){}
  setTheme(curTheme);
  /* Restore language preference */
  try { const sl=localStorage.getItem('ocgt_lang'); if(sl==='de'||sl==='en') lang=sl; } catch(e){}
  /* Restore cookie consent */
  try {
    const sc=localStorage.getItem('ocgt_cookies');
    if(sc==='1'){cookies=true;}
    else if(sc==='0'){cookies=false;}
    else{setTimeout(()=>document.getElementById('cookie').classList.add('show'),900);}
  } catch(e){}
  setLang(lang);
  if(cookies)loadAllEmbeds();
  go('home');
})();

/* ── FAQ ACCORDION ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  // close all others
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded','false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded','true');
  }
}

/* ── COUNTER ANIMATION ── (counter section replaced by data-strip marquee — no JS needed) */

/* ── ANNOUNCEMENT BAR ── (removed — function kept as no-op for any legacy onclick handlers) */
function closeAnnounce() {
  document.body.classList.remove('has-announce');
  try { localStorage.setItem('ocgt_announce_closed','1'); } catch(e){}
}
/* Ensure body never has stale has-announce class from previous sessions */
document.body.classList.remove('has-announce');

/* ── SCROLL EFFECTS ENGINE ── */
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  let scrollY = 0, lastScrollY = 0, ticking = false;

  function onScroll(){
    lastScrollY = scrollY;
    scrollY = window.scrollY;
    if(!ticking){ requestAnimationFrame(updateAll); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  /* Hero Cinema — scroll-morphing frames */
  const _heroWrap   = document.querySelector('.hero-cinema-wrap');
  const _heroSticky = document.querySelector('.hero-cinema');
  const _heroFrames = _heroWrap ? _heroWrap.querySelectorAll('.hero-frame') : [];
  const _heroDots   = _heroWrap ? _heroWrap.querySelectorAll('.hero-cinema-dot') : [];
  let _prevHeroFrame = 0;

  function updateHeroCinema(){
    if(!_heroWrap || !_heroFrames.length) return;
    const rect = _heroWrap.getBoundingClientRect();
    const totalScroll = _heroWrap.offsetHeight - window.innerHeight;
    if(totalScroll <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
    const count = _heroFrames.length;
    const frameIdx = Math.min(Math.floor(progress * count), count - 1);

    if(frameIdx !== _prevHeroFrame){
      _heroFrames.forEach((f, i) => {
        f.classList.remove('active', 'exit-up');
        if(i === frameIdx) f.classList.add('active');
        else if(i < frameIdx) f.classList.add('exit-up');
      });
      _heroDots.forEach((d, i) => d.classList.toggle('active', i === frameIdx));
      if(_heroSticky){
        _heroSticky.classList.remove('f1', 'f2', 'f3');
        _heroSticky.classList.add('f' + (frameIdx + 1));
      }
      _prevHeroFrame = frameIdx;
    }
  }

  /* Hero dot click — jump to frame */
  _heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if(!_heroWrap) return;
      const totalScroll = _heroWrap.offsetHeight - window.innerHeight;
      const targetY = _heroWrap.offsetTop + (i / _heroFrames.length) * totalScroll + 20;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* How-It-Works Cinema — scroll-driven frame switcher */
  const _howCinema = document.querySelector('.how-cinema');
  const _howSticky = _howCinema ? _howCinema.querySelector('.how-cinema-sticky') : null;
  const _howFrames = _howCinema ? _howCinema.querySelectorAll('.how-frame') : [];
  const _howDots   = _howCinema ? _howCinema.querySelectorAll('.how-cinema-dot') : [];
  const _howFill   = _howCinema ? _howCinema.querySelector('.hcp-fill') : null;
  const _howSteps  = _howCinema ? _howCinema.querySelectorAll('.hcp-step') : [];
  let _prevHowFrame = 0;

  function updateHowCinema(){
    if(!_howCinema || !_howFrames.length) return;
    const rect = _howCinema.getBoundingClientRect();
    const totalScroll = _howCinema.offsetHeight - window.innerHeight;
    if(totalScroll <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
    const count = _howFrames.length;
    const frameIdx = Math.min(Math.floor(progress * count), count - 1);

    /* Smooth scroll-linked progress fill, SYNCED with card boundaries.
       Cards flip at progress 0, .25, .5, .75. Fill must sit on dot N at those exact moments.
       Dots: 12.5 / 37.5 / 62.5 / 87.5%. So fill travels 12.5→87.5 across progress 0→0.75,
       then dwells at 87.5 while frame 4 holds (0.75→1). */
    if(_howFill && _howSteps.length){
      const first = 12.5, last = 87.5;
      const travel = Math.min(progress / 0.75, 1);   /* 0..1 over first 75% of scroll */
      const fillPct = first + travel * (last - first);
      _howFill.style.width = fillPct + '%';
      _howSteps.forEach((step, i) => {
        const dotPct = first + (i / (count - 1)) * (last - first);
        const dist = Math.abs(fillPct - dotPct);
        const nearness = Math.max(0, 1 - dist / 12);
        const reached = fillPct >= dotPct - 1;
        step.style.setProperty('--near', nearness.toFixed(3));
        step.classList.toggle('is-active', i === frameIdx);
        step.classList.toggle('is-done', reached && i !== frameIdx);
      });
    }

    if(frameIdx !== _prevHowFrame){
      _howFrames.forEach((f, i) => {
        f.classList.remove('active', 'exit-up');
        if(i === frameIdx) f.classList.add('active');
        else if(i < frameIdx) f.classList.add('exit-up');
      });
      _howDots.forEach((d, i) => d.classList.toggle('active', i === frameIdx));
      if(_howSticky){
        _howSticky.classList.remove('hf1', 'hf2', 'hf3', 'hf4');
        _howSticky.classList.add('hf' + (frameIdx + 1));
      }
      _prevHowFrame = frameIdx;
    }
  }

  /* How dot click — jump to frame */
  _howDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if(!_howCinema) return;
      const totalScroll = _howCinema.offsetHeight - window.innerHeight;
      const targetY = _howCinema.offsetTop + (i / _howFrames.length) * totalScroll + 20;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* USP Cinema — converted to static 2x2 bento grid.
     The old scroll-driven switcher is retired; updateUspCinema is a no-op
     retained only so updateAll() keeps its original call shape. */
  function updateUspCinema(){ /* no-op: grid layout, all slides always visible */ }

  function updateAll(){
    ticking = false;
    updateHeroCinema();
    updateUspCinema();
    updateHowCinema();
    if(reducedMotion) return;
    updateProgressBar();
    updateBackToTop();
    updateScrollIndicator();
  }

  /* Progress bar */
  function updateProgressBar(){
    const bar = document.getElementById('scroll-progress');
    if(!bar) return;
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const pct = docH > winH ? (scrollY / (docH - winH)) * 100 : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
    bar.style.opacity = scrollY > 100 ? '1' : '0';
  }

  /* Back to top */
  function updateBackToTop(){
    const btn = document.getElementById('back-to-top');
    if(!btn) return;
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const pct = docH > winH ? scrollY / (docH - winH) : 0;
    if(pct > 0.25) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }
  const bttBtn = document.getElementById('back-to-top');
  if(bttBtn) bttBtn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  /* Scroll indicator — legacy .scroll-indicator removed; .hero-x-hud-br handles it now */
  function updateScrollIndicator(){}

  /* Legacy hero-inner parallax removed — .hero-x handles its own animation */
})();

/* ── DISCIPLINES STICKY SHOWCASE — scroll-linked cross-fade + parallax + tilt ── */
(function(){
  const sec = document.querySelector('.disc-sec');
  const wrap = document.querySelector('.disc-scroll-wrap');
  const slides = document.querySelectorAll('.disc-slide');
  if(!sec || !wrap || slides.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const total = slides.length;
  let activeIdx = -1;
  let rafPending = false;
  let transitionTimer = null;

  // Smoothstep interpolation: (edge0, edge1, x) → smooth 0 to 1 between edges
  function smoothstep(edge0, edge1, x){
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  function clamp01(x){ return Math.max(0, Math.min(1, x)); }

  // Pagination dots
  const dots = sec.querySelectorAll('.disc-dot');

  function activate(idx){
    if(idx === activeIdx) return;
    activeIdx = idx;
    slides.forEach(function(s, i){
      if(i === idx){
        s.classList.remove('is-leaving');
        s.classList.add('is-active');
      } else if(i < idx){
        s.classList.remove('is-active');
        s.classList.add('is-leaving');
      } else {
        s.classList.remove('is-active', 'is-leaving');
      }
    });
    // Sync pagination dots
    dots.forEach(function(d, i){
      d.classList.toggle('is-active', i === idx);
    });
    sec.setAttribute('data-active', String(idx));
    // Brief "pop" pulse on the panel during the transition
    sec.setAttribute('data-transitioning', '1');
    if(transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function(){
      sec.removeAttribute('data-transitioning');
    }, 2500);
  }

  function update(){
    rafPending = false;
    // Disable sticky logic on mobile (≤ 960px)
    if(window.innerWidth <= 960){
      slides.forEach(function(s){
        s.classList.remove('is-active','is-leaving');
        s.style.opacity = '';
        s.style.transform = '';
        const img = s.querySelector('.disc-slide-bg img');
        if(img) img.style.transform = '';
      });
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalScroll = rect.height - vh;
    if(totalScroll <= 0){ if(activeIdx !== 0) activate(0); return; }

    const scrolled = -rect.top;
    const progress = clamp01(scrolled / totalScroll);

    // ── SCROLL-LINKED CROSS-FADE — each slide's opacity follows scroll position directly ──
    // For 2 slides: cross-fade zone is 0.40 → 0.60
    // For N slides: each slide's "peak" is at (i + 0.5) / N
    const segSize = 1 / total;

    // Cross-fade window — overlaps around each segment boundary so slides cross-fade smoothly
    const fadeHalf = segSize * 0.3; // 30% of a segment's width, centered on each boundary

    slides.forEach(function(s, i){
      const segStart = i * segSize;
      const segEnd = (i + 1) * segSize;

      let opacity;
      if(i === 0){
        // First slide: fades out around its right boundary
        opacity = 1 - smoothstep(segEnd - fadeHalf, segEnd + fadeHalf, progress);
      } else if(i === total - 1){
        // Last slide: fades in around its left boundary
        opacity = smoothstep(segStart - fadeHalf, segStart + fadeHalf, progress);
      } else {
        // Middle: fade in at left boundary, out at right boundary
        const fadeIn = smoothstep(segStart - fadeHalf, segStart + fadeHalf, progress);
        const fadeOut = 1 - smoothstep(segEnd - fadeHalf, segEnd + fadeHalf, progress);
        opacity = Math.min(fadeIn, fadeOut);
      }

      // Only opacity on the slide wrapper — transform is off (no jerk, no scale)
      s.style.opacity = opacity.toFixed(3);
      s.style.transform = '';

      // ── BACKGROUND IMAGE PARALLAX — the image drifts with scroll, creating depth ──
      if(!reducedMotion){
        const img = s.querySelector('.disc-slide-bg img');
        if(img){
          // Use progress directly (not segment progress) so the parallax is continuous
          const segProgress = clamp01((progress - segStart) / segSize);
          // Zoom from 1.04 → 1.0 as slide reaches its segment center, then 1.0 → 1.04 as it exits
          const zoom = 1.02 + Math.abs(segProgress - 0.5) * 0.06;
          // Vertical drift: moves from +20 → 0 → -20 across the segment
          const imgTy = (segProgress - 0.5) * -30;
          img.style.transform = 'scale(' + zoom.toFixed(3) + ') translateY(' + imgTy.toFixed(1) + 'px)';
        }
      }
    });

    // Determine active slide (for content cascade class)
    // Use the slide whose segment contains the progress, with midpoint snap
    let next = Math.min(total - 1, Math.floor(progress * total + 0.02));
    const withinSeg = (progress - next * segSize) / segSize;
    if(withinSeg < -0.04 && next > 0) next -= 1;
    activate(next);
  }

  function onScroll(){
    if(rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }

  // Initial state
  sec.setAttribute('data-active', '0');
  activate(0);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ── HOVER 3D TILT on the active card (desktop only) ──
  if(!reducedMotion && !('ontouchstart' in window)){
    const MAX_TILT = 4; // degrees
    function handleTilt(e){
      if(window.innerWidth <= 960) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * MAX_TILT;
      const ry = (px - 0.5) * MAX_TILT;
      card.style.transform = 'perspective(1200px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-2px)';
    }
    function resetTilt(e){
      e.currentTarget.style.transform = '';
    }
    slides.forEach(function(s){
      const content = s.querySelector('.disc-slide-content');
      if(!content) return;
      content.addEventListener('mousemove', handleTilt);
      content.addEventListener('mouseleave', resetTilt);
    });
  }

  // ── ENTRANCE ANIMATION — reveal header/heading/dots/panel on first scroll into view ──
  if('IntersectionObserver' in window){
    var discObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          sec.classList.add('is-revealed');
          discObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    discObserver.observe(sec);
  } else {
    // Fallback: reveal immediately
    sec.classList.add('is-revealed');
  }
})();

/* ── HOW IT WORKS — scroll-linked slideshow (butter-smooth cross-fade) ── */
(function(){
  const sec = document.querySelector('.how-sec');
  const wrap = document.querySelector('.how-scroll-wrap');
  if(!sec || !wrap) return;
  const tabs = sec.querySelectorAll('.how-tab');
  const steps = sec.querySelectorAll('.how-step');
  // Rail removed — progress tracked via tab highlights only
  if(tabs.length === 0 || steps.length === 0) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const total = steps.length;
  let activeIdx = -1;
  let mobileActiveIdx = 0;  // tracks tab-click state on mobile separately
  let rafPending = false;

  function smoothstep(edge0, edge1, x){
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  function clamp01(x){ return Math.max(0, Math.min(1, x)); }

  function activate(idx){
    if(idx === activeIdx) return;
    activeIdx = idx;
    tabs.forEach(function(t, i){
      t.classList.toggle('is-active', i === idx);
      t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    steps.forEach(function(s, i){ s.classList.toggle('is-active', i === idx); });
    sec.setAttribute('data-active', String(idx));
  }

  /* Scroll-triggered entrance — one-shot IntersectionObserver */
  if('IntersectionObserver' in window && !reducedMotion){
    var revealObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          sec.classList.add('is-revealed');
          revealObs.disconnect();
        }
      });
    }, { threshold: 0.08 });
    revealObs.observe(sec);
  } else {
    sec.classList.add('is-revealed'); // fallback: show immediately
  }

  function update(){
    rafPending = false;

    // Mobile: clear inline styles (from desktop scroll logic) but PRESERVE the active tab-click state
    if(window.innerWidth <= 960){
      steps.forEach(function(s){
        s.style.opacity = '';
        s.style.transform = '';
        var img = s.querySelector('.how-step-media img');
        if(img) img.style.transform = '';
      });
      // (rail removed)
      // Ensure the mobile-selected step stays active (don't clear is-active on scroll)
      activate(mobileActiveIdx);
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalScroll = rect.height - vh;
    if(totalScroll <= 0){ activate(0); return; }

    const scrolled = -rect.top;
    const progress = clamp01(scrolled / totalScroll);

    // Cross-fade windows overlap around each segment boundary so steps fade smoothly
    const segSize = 1 / total;
    const fadeHalf = segSize * 0.28;

    steps.forEach(function(s, i){
      const segStart = i * segSize;
      const segEnd = (i + 1) * segSize;

      let opacity;
      if(i === 0){
        opacity = 1 - smoothstep(segEnd - fadeHalf, segEnd + fadeHalf, progress);
      } else if(i === total - 1){
        opacity = smoothstep(segStart - fadeHalf, segStart + fadeHalf, progress);
      } else {
        const fadeIn = smoothstep(segStart - fadeHalf, segStart + fadeHalf, progress);
        const fadeOut = 1 - smoothstep(segEnd - fadeHalf, segEnd + fadeHalf, progress);
        opacity = Math.min(fadeIn, fadeOut);
      }

      s.style.opacity = opacity.toFixed(3);

      // Subtle ken-burns scale + drift within each segment
      if(!reducedMotion){
        const img = s.querySelector('.how-step-media img');
        if(img){
          const segProgress = clamp01((progress - segStart) / segSize);
          const zoom = 1.04 + segProgress * 0.04;             // 1.04 → 1.08 through the segment
          const imgTy = (segProgress - 0.5) * -30;            // +15 → -15 drift
          img.style.transform = 'scale(' + zoom.toFixed(3) + ') translateY(' + imgTy.toFixed(1) + 'px)';
        }
      }
    });

    // (rail removed — progress visual handled by active tab highlight)

    // Update active tab (for content cascade class triggers)
    let next = Math.min(total - 1, Math.floor(progress * total + 0.02));
    const withinSeg = (progress - next * segSize) / segSize;
    if(withinSeg < -0.04 && next > 0) next -= 1;
    activate(next);
  }

  function onScroll(){
    if(rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }

  // Tab click →
  //   Desktop: smooth-scroll the page to the target step's segment in the sticky wrap
  //   Mobile: directly activate the step (no scroll)
  function goToStep(idx){
    mobileActiveIdx = idx;  // always track for mobile state preservation
    if(window.innerWidth <= 960){
      activate(idx);
      return;
    }
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalScroll = rect.height - vh;
    if(totalScroll <= 0) return;
    const segSize = 1 / total;
    const targetProgress = (idx + 0.5) * segSize;
    const targetPageY = (window.pageYOffset + rect.top) + targetProgress * totalScroll;
    window.scrollTo({ top: targetPageY, behavior: 'smooth' });
  }

  tabs.forEach(function(tab, i){
    tab.addEventListener('click', function(){ goToStep(i); });
    tab.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goToStep(i); }
      else if(e.key === 'ArrowDown' || e.key === 'ArrowRight'){
        e.preventDefault();
        const n = Math.min(tabs.length - 1, i + 1);
        goToStep(n); tabs[n].focus();
      } else if(e.key === 'ArrowUp' || e.key === 'ArrowLeft'){
        e.preventDefault();
        const p = Math.max(0, i - 1);
        goToStep(p); tabs[p].focus();
      }
    });
  });

  sec.setAttribute('data-active', '0');
  activate(0);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── BEFORE/AFTER SLIDER — draggable, syncs with active step ── */
  const slider = sec.querySelector('.ba-slider');
  if(!slider) return;
  const handle = slider.querySelector('.ba-handle');
  // Step 1 (capture) = mostly show raw data (before) = slider far right
  // Step 2 (photogrammetry) = mid transformation
  // Step 3 (delivery) = mostly show 3D (after) = slider far left
  const stepPositions = [82, 50, 18];
  let isDragging = false;

  function setSliderPosition(pct, animate){
    pct = Math.max(0, Math.min(100, pct));
    if(!animate) slider.classList.add('is-dragging');
    slider.style.setProperty('--ba-pos', pct + '%');
    handle.setAttribute('aria-valuenow', Math.round(pct));
    if(!animate){
      requestAnimationFrame(() => slider.classList.remove('is-dragging'));
    }
  }

  /* Sync slider when active step changes — observe class changes on steps */
  const syncObserver = new MutationObserver(() => {
    if(isDragging) return;
    const activeStep = sec.querySelector('.how-step.is-active');
    if(!activeStep) return;
    const idx = parseInt(activeStep.getAttribute('data-step'), 10) || 0;
    setSliderPosition(stepPositions[idx] || 50, true);
  });
  steps.forEach(s => syncObserver.observe(s, { attributes: true, attributeFilter: ['class'] }));

  /* Initial position */
  setSliderPosition(stepPositions[0], true);

  /* Pointer drag handling */
  function pointerToPct(clientX){
    const rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onPointerDown(e){
    isDragging = true;
    slider.classList.add('is-dragging');
    setSliderPosition(pointerToPct(e.clientX), false);
    e.preventDefault();
  }

  function onPointerMove(e){
    if(!isDragging) return;
    setSliderPosition(pointerToPct(e.clientX), false);
  }

  function onPointerUp(){
    if(!isDragging) return;
    isDragging = false;
    slider.classList.remove('is-dragging');
  }

  slider.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  /* Keyboard support */
  handle.addEventListener('keydown', function(e){
    const current = parseInt(slider.style.getPropertyValue('--ba-pos'), 10) || 50;
    if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){
      e.preventDefault();
      setSliderPosition(current - 5, true);
    } else if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){
      e.preventDefault();
      setSliderPosition(current + 5, true);
    } else if(e.key === 'Home'){
      e.preventDefault();
      setSliderPosition(0, true);
    } else if(e.key === 'End'){
      e.preventDefault();
      setSliderPosition(100, true);
    }
  });
})();

/* Hero cursor parallax disabled — hero stays static after LiDAR reveal.
   CSS vars --hx-mx / --hx-my fall back to 0, so all calc() parallax becomes 0px. */

/* ── HERO VIDEO BOOTSTRAP ──
   The 3D point-cloud Three.js system has been retired — this hero now plays
   an optimized 11 MB cinematic MP4 (Website_hero-1080.mp4) with a 4 MB 720p
   variant picked by the <source media> query on mobile. Zero buffering.

   Responsibilities:
   - Pause playback when tab is hidden (saves battery + network)
   - Respect prefers-reduced-motion → keep paused, show poster only
   - Respect save-data / low-memory → keep paused, show poster only
   - Fade the video in once the first frame is ready (`.is-ready` class)
   - Keep lightweight cursor parallax for subtle depth
*/
(function initHeroVideo(){
  const video  = document.getElementById('hv-new');
  const heroEl = document.querySelector('.hero-x');
  if(!video || !heroEl) return;

  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const conn    = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = conn && (conn.saveData || /2g|slow-2g/.test(conn.effectiveType || ''));
  const lowMem   = navigator.deviceMemory && navigator.deviceMemory < 3;

  /* Low-power device → keep video paused, poster remains visible */
  if(reduced || saveData || lowMem){
    video.pause?.();
    video.removeAttribute('autoplay');
    video.setAttribute('preload', 'none');
    video.classList.add('is-ready');
    heroEl.classList.add('has-video');
    return;
  }

  /* Robust play helper — never throws, resolves to true if playing */
  function tryPlay(){
    const p = video.play?.();
    if (p && typeof p.then === 'function') return p.then(() => true).catch(() => false);
    return Promise.resolve(!video.paused);
  }

  /* Fade the video in once the first frame paints AND trigger playback then */
  function ready(){
    if (video.__ocgtReady) return;
    video.__ocgtReady = true;
    video.classList.add('is-ready');
    heroEl.classList.add('has-video');
    /* Critical: start playback HERE, once frame data is actually available.
       Calling play() before loadeddata can succeed silently but leave the video on frame 0. */
    tryPlay();
  }
  if(video.readyState >= 2){ ready(); }
  else {
    video.addEventListener('loadeddata', ready, { once:true });
    video.addEventListener('canplay',    ready, { once:true });
    video.addEventListener('loadedmetadata', () => { if (video.readyState >= 2) ready(); }, { once:true });
  }

  /* Safety net: poll for the first 4 seconds — if something silently blocked autoplay,
     retry every 400 ms. Stops as soon as playback is confirmed. */
  let pollTries = 0;
  const poll = setInterval(async () => {
    pollTries++;
    if (!video.paused && video.currentTime > 0) { clearInterval(poll); return; }
    if (pollTries > 10) { clearInterval(poll); return; }
    if (video.readyState >= 2) await tryPlay();
  }, 400);

  /* Retry on ANY user interaction — not `once:true` so each retry can attempt play again
     if earlier ones were blocked. Stops retrying once playback is confirmed. */
  const events = ['pointerdown','click','touchstart','keydown','scroll'];
  function onInteract() {
    if (video.paused) tryPlay();
    else events.forEach(ev => window.removeEventListener(ev, onInteract, true));
  }
  events.forEach(ev => window.addEventListener(ev, onInteract, { passive:true, capture:true }));

  /* Pause when tab hidden; resume when visible */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { video.pause?.(); }
    else { tryPlay(); }
  });

  /* Recovery handlers — DO NOT call video.load() (it resets to paused at frame 0).
     Just re-attempt play; the browser will resume buffering automatically. */
  video.addEventListener('stalled',  () => { tryPlay(); });
  video.addEventListener('waiting',  () => { /* browser is buffering — no action needed */ });
  video.addEventListener('pause',    () => {
    /* If something pauses us unexpectedly (not from our visibilitychange handler while hidden),
       and the tab IS visible, resume. */
    if (document.visibilityState === 'visible' && !video.ended) {
      /* Small defer so browser's own pause logic settles */
      setTimeout(() => { if (video.paused && document.visibilityState === 'visible') tryPlay(); }, 150);
    }
  });
  video.addEventListener('error',   () => { /* silent: poster image already shows */ });
})();

/* ── EXIT-INTENT MODAL — email capture before user leaves ── */
(function initExitModal(){
  const modal = document.getElementById('exit-modal');
  if(!modal) return;
  const card = modal.querySelector('.exit-modal-card');
  const form = document.getElementById('exit-modal-form');
  const input = document.getElementById('exit-modal-email');
  const success = document.getElementById('exit-modal-success');
  const STORAGE_KEY = 'ocgt_exit_seen';
  const MIN_TIME_ON_PAGE = 15000; /* 15s minimum before showing */
  const pageStartTime = Date.now();
  let shown = false;
  let lastFocused = null;

  /* Don't show if user already saw/dismissed it (persists across sessions) */
  try {
    if(localStorage.getItem(STORAGE_KEY)) return;
  } catch(e) { /* storage blocked — still show */ }

  /* Don't show if user already at contact section */
  function isAtContact(){
    const hash = location.hash;
    return hash === '#contact' || hash === '#p-contact';
  }

  function show(){
    if(shown || isAtContact()) return;
    if(Date.now() - pageStartTime < MIN_TIME_ON_PAGE) return;
    shown = true;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    /* Focus email input after animation */
    setTimeout(() => input?.focus(), 350);
    /* Lock scroll */
    document.body.style.overflow = 'hidden';
  }

  function close(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e){}
    if(lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* Close triggers — use .closest() so SVG children of the × button still resolve to data-close */
  modal.addEventListener('click', (e) => {
    if(e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
  /* Focus trap: keep tab within modal */
  modal.addEventListener('keydown', (e) => {
    if(e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    const focusables = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
    else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
  });

  /* Form submission */
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    /* Simulate submit — replace with real API/mailto */
    window.location.href = 'mailto:info@ocgt.de?subject=' +
      encodeURIComponent('Projekt-Anfrage') +
      '&body=' + encodeURIComponent('Hallo OCGT,\n\nBitte nehmen Sie Kontakt mit mir auf.\n\nE-Mail: ' + email + '\n');
    success.classList.add('is-visible');
    form.style.display = 'none';
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch(e){}
    setTimeout(close, 2500);
  });

  /* EXIT INTENT DETECTION */
  /* Desktop: mouse leaves top of viewport */
  document.addEventListener('mouseleave', (e) => {
    if(e.clientY <= 0 && !shown) show();
  });

  /* Mobile: rapid scroll-up near top OR browser back attempt */
  let lastScrollY = window.scrollY;
  let fastScrollUp = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if(lastScrollY - y > 40){  /* scrolled up quickly */
      fastScrollUp++;
      if(fastScrollUp >= 2 && y < 300 && !shown) show();
    } else {
      fastScrollUp = 0;
    }
    lastScrollY = y;
  }, { passive:true });

  /* Fallback: show after 45s of engagement */
  setTimeout(() => {
    if(!shown && document.hasFocus()) show();
  }, 45000);
})();

/* ── FAQ CATEGORY TABS — filter questions by category ── */
(function(){
  const tabs = document.querySelectorAll('.faq-tab');
  const items = document.querySelectorAll('.faq-item[data-cat]');
  if(!tabs.length || !items.length) return;

  function filterByCategory(cat){
    tabs.forEach(t => {
      const isActive = t.dataset.cat === cat;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    items.forEach(item => {
      const matches = cat === 'all' || item.dataset.cat === cat;
      if(matches){
        /* Restart animation for smooth entrance */
        item.classList.remove('is-shown');
        void item.offsetWidth; /* trigger reflow */
        item.classList.add('is-shown');
      } else {
        item.classList.remove('is-shown');
        /* Close any open FAQ items when hiding */
        item.classList.remove('open');
        const btn = item.querySelector('.faq-q');
        if(btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => filterByCategory(tab.dataset.cat));
    tab.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        filterByCategory(tab.dataset.cat);
      } else if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        const arr = [...tabs];
        const idx = arr.indexOf(tab);
        const next = e.key === 'ArrowRight'
          ? arr[(idx + 1) % arr.length]
          : arr[(idx - 1 + arr.length) % arr.length];
        next.focus();
        filterByCategory(next.dataset.cat);
      }
    });
  });
})();

/* ── LIVE DEMO — 2D/3D tab switcher with cross-fade (iOS segmented control) ── */
(function(){
  const sec = document.querySelector('.live-sec');
  if(!sec) return;
  const tabsContainer = sec.querySelector('.live-tabs');
  const tabs = sec.querySelectorAll('.live-tab');
  const views = sec.querySelectorAll('.live-view');
  if(tabs.length === 0 || views.length === 0) return;

  function activate(view){
    tabs.forEach(function(t){
      const isActive = t.dataset.view === view;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    views.forEach(function(v){
      v.classList.toggle('is-active', v.dataset.view === view);
    });
    if(tabsContainer) tabsContainer.setAttribute('data-active', view);
  }

  const tabOrder = Array.from(tabs).map(function(t){ return t.dataset.view; });
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){ activate(tab.dataset.view); });
    tab.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        activate(tab.dataset.view);
      } else if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        const idx = tabOrder.indexOf(tab.dataset.view);
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = tabOrder[(idx + dir + tabOrder.length) % tabOrder.length];
        activate(next);
        const nextTab = sec.querySelector('.live-tab[data-view="' + next + '"]');
        if(nextTab) nextTab.focus();
      }
    });
  });

})();

/* Legacy hero interactions (magnetic CTA, 3D tilt, particle canvas, scroll-indicator click)
   removed — .hero-x has its own Three.js-driven interactions. */
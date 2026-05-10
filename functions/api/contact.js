/**
 * Cloudflare Pages Function — POST /api/contact
 * Receives the OCGT contact form (JSON), validates + sanitizes, and forwards
 * the lead to info@ocgt.de via the Brevo (ex-Sendinblue) Transactional API.
 *
 * Required Cloudflare Pages env vars (Settings → Environment variables):
 *   BREVO_API_KEY     — your Brevo API key (xkeysib-...)
 *   CONTACT_TO_EMAIL  — recipient, e.g. info@ocgt.de
 *   CONTACT_FROM_EMAIL— verified sender in Brevo, e.g. no-reply@ocgt.de
 *   CONTACT_FROM_NAME — optional display name, default: "OCGT Website"
 *
 * Optional Cloudflare Pages env vars:
 *   TURNSTILE_SECRET  — Cloudflare Turnstile secret key (server-side).
 *                       When set, every submission MUST include a valid
 *                       cfTurnstileToken. When unset, Turnstile is bypassed
 *                       (used during initial rollout before keys are issued).
 */

const MAX_LEN = 2000;
const ALLOWED_ORIGINS = [
  'https://ocgt.de',
  'https://www.ocgt.de',
];

function sanitize(v) {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c]))
    .trim()
    .slice(0, MAX_LEN);
}

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin') || '') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400, cors);
  }

  const vorname  = sanitize(body.vorname);
  const nachname = sanitize(body.nachname);
  const emailRaw = (body.email || '').trim();
  const email    = sanitize(emailRaw);
  const firma    = sanitize(body.firma);
  const leistung = sanitize(body.leistung);
  const nachricht = sanitize(body.nachricht);
  const subject  = sanitize(body._subject) || 'Neue Anfrage — OCGT Website';

  if (!vorname || !nachname || !nachricht || !isEmail(emailRaw)) {
    return json({ error: 'validation_failed' }, 400, cors);
  }

  // ── Cloudflare Turnstile verification ───────────────────────────────
  // Only enforced when TURNSTILE_SECRET env var is set. Until you finish
  // configuring Turnstile, the form keeps working without it. After you
  // add TURNSTILE_SECRET in Cloudflare → Pages → Settings → Environment
  // variables, every submission must carry a valid token.
  if (env.TURNSTILE_SECRET) {
    const token = (body.cfTurnstileToken || '').trim();
    if (!token) {
      return json({ error: 'captcha_missing' }, 400, cors);
    }
    try {
      const verifyParams = new URLSearchParams();
      verifyParams.append('secret', env.TURNSTILE_SECRET);
      verifyParams.append('response', token);
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip) verifyParams.append('remoteip', ip);

      const verifyRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        { method: 'POST', body: verifyParams }
      );
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyData.success) {
        console.warn('turnstile_failed', verifyData['error-codes']);
        return json({ error: 'captcha_failed' }, 403, cors);
      }
    } catch (err) {
      console.error('turnstile_verify_error', err);
      return json({ error: 'captcha_unavailable' }, 503, cors);
    }
  }

  const apiKey = env.BREVO_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL || 'info@ocgt.de';
  const fromEmail = env.CONTACT_FROM_EMAIL || 'no-reply@ocgt.de';
  const fromName = env.CONTACT_FROM_NAME || 'OCGT Website';

  if (!apiKey) {
    return json({ error: 'server_misconfigured' }, 500, cors);
  }

  const html = `
    <h2>${subject}</h2>
    <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td><b>Vorname</b></td><td>${vorname}</td></tr>
      <tr><td><b>Nachname</b></td><td>${nachname}</td></tr>
      <tr><td><b>E-Mail</b></td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td><b>Unternehmen</b></td><td>${firma || '—'}</td></tr>
      <tr><td><b>Leistung</b></td><td>${leistung || '—'}</td></tr>
      <tr><td valign="top"><b>Nachricht</b></td><td>${nachricht.replace(/\n/g, '<br>')}</td></tr>
    </table>
    <hr><p style="font-size:12px;color:#666">Gesendet via ocgt.de — ${new Date().toISOString()}</p>
  `;

  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      replyTo: { email, name: `${vorname} ${nachname}` },
      subject,
      htmlContent: html,
    }),
  });

  if (!brevoRes.ok) {
    const detail = await brevoRes.text().catch(() => '');
    console.error('brevo_failed', brevoRes.status, detail);
    return json({ error: 'send_failed' }, 502, cors);
  }

  return json({ ok: true }, 200, cors);
}

function json(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

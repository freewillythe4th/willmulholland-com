import { verifiedSignup } from './_signup-security.js';
import { safeAttribution } from './_attribution.js';

// Bounded syntax checks preserve the previous Unicode/quoted local-part
// acceptance. Syntax does not prove ownership or distinguish bots from people.
function validEmail(email) {
  if (!email || email.length > 254 || /[\u0000-\u001F\u007F]/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || /[\s<>]/.test(local)) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const labels = domain.split('.');
  return labels.length > 1 && labels.every(label =>
    label.length <= 63 && /^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u.test(label));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await verifiedSignup(req, res, 'subscribe');
  if (!body) return;
  // Optional trap for form clients. Direct API callers can simply omit it.
  if (body.honeypot !== undefined && body.honeypot !== '') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  // Bound input before trimming or validation, while allowing normal padding.
  const email = typeof body.email === 'string' && body.email.length <= 320
    ? body.email.trim() : '';
  if (!validEmail(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Optional lead source, e.g. "team-brain-starter" or "team-brain-waitlist".
  // Normalised to a safe slug so it can drive a segmented beehiiv welcome series.
  const source = typeof body.source === 'string'
    ? body.source.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100)
    : '';

  // Optional one-question answer from an interest form, e.g. the /brain cohort
  // asking which marketing job the visitor most wants their brain to take on.
  //
  // This goes to ig_focus, NOT build_vote. api/workshop-register.js already
  // writes build_vote from its own `job` input, and beehiiv custom fields are
  // scalar, so sharing the field would have one answer overwrite the other for
  // anyone who does both the workshop and the cohort.
  //
  // Leading =, +, - and @ are stripped because this value gets exported to
  // spreadsheets, where those prefixes are read as formulas. Control characters
  // and angle brackets go too, since the value is rendered in beehiiv's UI.
  const job = typeof body.job === 'string'
    ? body.job
      .replace(/[\u0000-\u001F\u007F<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[=+\-@]+/, '')
      .trim()
      .slice(0, 200)
    : '';

  // Do not reactivate unsubscribed addresses: the API does not guarantee
  // that reactivation requires a fresh confirmation. Ignore client requests.
  const reactivate = false;

  const attribution = safeAttribution(body, {
    utm_source: 'intelligentgrowth_app',
    utm_medium: 'website_form',
    utm_campaign: source || 'always_on',
  });

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID || 'pub_493c9454-ead1-40c6-b28b-81d4d81a63aa';

  if (!apiKey) {
    console.error('Missing BEEHIIV_API_KEY env var');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const customFields = [
    ...(source ? [{ name: 'Lead Source', value: source }] : []),
    ...(job ? [{ name: 'ig_focus', value: job }] : []),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const bhRes = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: reactivate,
        // send_welcome_email stays false: the 5-day course automation (signup
        // trigger) is the welcome now, and beehiiv's built-in welcome email on
        // top of it would double-send.
        send_welcome_email: false,
        double_opt_override: 'on',
        ...attribution,
        ...(customFields.length ? { custom_fields: customFields } : {}),
      }),
    });

    if (!bhRes.ok) {
      console.error('Beehiiv API error:', bhRes.status);
      return res.status(502).json({ error: 'Subscription failed' });
    }

    return res.status(200).json({ ok: true });
  } catch {
    if (controller.signal.aborted) {
      console.error('Subscribe upstream timeout');
      return res.status(504).json({ error: 'Subscription timed out' });
    }
    console.error('Subscribe upstream request failed');
    return res.status(500).json({ error: 'Internal error' });
  } finally {
    clearTimeout(timeout);
  }
}

import { safeAttribution } from './_attribution.js';

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

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const email = typeof body.email === 'string' ? body.email.trim() : '';

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

  // Only an explicit interest form asks for this. A passive newsletter signup
  // must never silently resurrect someone who unsubscribed.
  const reactivate = body.reactivate === true;

  const attribution = safeAttribution(body, {
    utm_source: 'intelligentgrowth_app',
    utm_medium: 'website_form',
    utm_campaign: source || 'always_on',
  });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

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

  try {
    const bhRes = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
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
        ...attribution,
        ...(customFields.length ? { custom_fields: customFields } : {}),
      }),
    });

    if (!bhRes.ok) {
      const errText = await bhRes.text();
      console.error('Beehiiv API error:', bhRes.status, errText);
      return res.status(502).json({ error: 'Subscription failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

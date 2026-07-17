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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = (body.email || '').trim();

  // Optional lead source, e.g. "team-brain-starter" or "team-brain-waitlist".
  // Normalised to a safe slug so it can drive a segmented beehiiv welcome series.
  const source = typeof body.source === 'string'
    ? body.source.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100)
    : '';

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

  try {
    const bhRes = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        // false: the 5-day course automation (signup trigger) is the welcome now.
        // beehiiv's built-in welcome email on top of it would double-send.
        send_welcome_email: false,
        ...attribution,
        ...(source ? { custom_fields: [{ name: 'Lead Source', value: source }] } : {}),
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

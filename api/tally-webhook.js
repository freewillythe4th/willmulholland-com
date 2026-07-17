// Tally webhook receiver. Sends a Pushover alert when someone submits the
// Work-With-Me form (or any Tally form pointed at this endpoint).
//
// Tally configuration:
//   In Tally form settings -> Integrations -> Webhooks, add:
//     URL: https://www.willmulholland.com/api/tally-webhook?secret=<TALLY_WEBHOOK_SECRET>
//
// Required Vercel env vars:
//   PUSHOVER_APP_TOKEN       Pushover application token
//   PUSHOVER_USER_KEY        Pushover user key
//   TALLY_WEBHOOK_SECRET     Shared secret matching the ?secret= param in the Tally URL
//
// Optional:
//   PUSHOVER_DEVICE          Specific device name (e.g. iphone15). Omit to send to all.
//
// Returns 200 OK to Tally always (so Tally doesn't keep retrying). Errors are
// logged to Vercel and surfaced in response body for debugging.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Shared-secret auth so randos can't spam your Pushover
  const expectedSecret = process.env.TALLY_WEBHOOK_SECRET;
  const providedSecret = req.query.secret || req.headers['x-webhook-secret'];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    console.warn('tally-webhook: secret mismatch');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appToken = process.env.PUSHOVER_APP_TOKEN;
  const userKey = process.env.PUSHOVER_USER_KEY;
  const device = process.env.PUSHOVER_DEVICE;

  if (!appToken || !userKey) {
    console.error('tally-webhook: missing PUSHOVER_APP_TOKEN or PUSHOVER_USER_KEY');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const data = body.data || {};
  const fields = Array.isArray(data.fields) ? data.fields : [];
  const formName = data.formName || 'Tally form';

  // Helper to pull a field by case-insensitive label substring
  const findField = (labelContains) => {
    const needle = labelContains.toLowerCase();
    return fields.find((f) => (f.label || '').toLowerCase().includes(needle));
  };

  // Helper to render a field value for display
  const renderValue = (field) => {
    if (!field) return '';
    const v = field.value;
    if (Array.isArray(v)) {
      // Multi-choice: value may be array of option text OR array of option IDs
      // If field has .options, map IDs to text
      if (field.options && Array.isArray(field.options)) {
        return v
          .map((id) => {
            const opt = field.options.find((o) => o.id === id);
            return opt ? opt.text : id;
          })
          .join(', ');
      }
      return v.join(', ');
    }
    if (v === null || v === undefined) return '';
    return String(v);
  };

  // Pull the key fields. We try several labels because forms can vary.
  const intent = renderValue(findField('looking for')) || renderValue(findField('intent'));
  const firstName = renderValue(findField('first name')) || renderValue(findField('name'));
  const lastName = renderValue(findField('last name')) || renderValue(findField('surname'));
  const email = renderValue(findField('email'));
  const linkedin = renderValue(findField('linkedin'));
  const company = renderValue(findField('company'));
  const role = renderValue(findField('role')) || renderValue(findField('current role'));
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  // Compose Pushover message
  const title = intent
    ? `${formName}: ${intent}`
    : `New ${formName} submission`;

  const lines = [];
  if (fullName) lines.push(`From: ${fullName}`);
  if (email) lines.push(`Email: ${email}`);
  if (role) lines.push(`Role: ${role}`);
  if (company) lines.push(`Company: ${company}`);
  if (linkedin) lines.push(`LinkedIn: ${linkedin}`);
  if (intent) lines.push(`Intent: ${intent}`);
  if (lines.length === 0) {
    // Fallback: dump first 3 non-empty fields
    fields.slice(0, 3).forEach((f) => {
      const v = renderValue(f);
      if (v) lines.push(`${f.label}: ${v}`);
    });
  }
  const message = lines.join('\n') || 'New form submission';

  // Send to Pushover (priority 1 = high, bypasses quiet hours)
  const params = new URLSearchParams();
  params.set('token', appToken);
  params.set('user', userKey);
  params.set('title', title);
  params.set('message', message);
  params.set('priority', '1');
  if (device) params.set('device', device);

  try {
    const pushRes = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const pushBody = await pushRes.json().catch(() => ({}));
    if (!pushRes.ok || pushBody.status !== 1) {
      console.error('tally-webhook: pushover error', pushRes.status, pushBody);
      return res.status(200).json({ ok: false, error: 'pushover_failed', pushover: pushBody });
    }
    return res.status(200).json({ ok: true, sent: { title, message } });
  } catch (err) {
    console.error('tally-webhook: fetch error', err);
    return res.status(200).json({ ok: false, error: 'fetch_error', detail: String(err) });
  }
}

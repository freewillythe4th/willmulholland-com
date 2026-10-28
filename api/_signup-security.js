// Sources:
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
// https://developers.beehiiv.com/api-reference/subscriptions/create
const HOSTNAMES = new Set([
  'intelligentgrowth.app', 'www.intelligentgrowth.app',
  'willmulholland.com', 'www.willmulholland.com',
]);
const ACTIONS = new Set(['subscribe', 'workshop_register', 'community_apply']);
// Only documented Siteverify codes may enter logs. Never log provider strings
// outside this fixed vocabulary, or a full response, email, token or hostname.
const SITEVERIFY_ERROR_CODES = new Set([
  'missing-input-secret', 'invalid-input-secret', 'missing-input-response',
  'invalid-input-response', 'bad-request', 'timeout-or-duplicate', 'internal-error',
]);

export function signupConfiguration() {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const paused = process.env.SIGNUPS_PAUSED === '1';
  return { enabled: !paused && Boolean(siteKey && secret), paused, siteKey: siteKey || '' };
}

export async function fetchWithTimeout(url, options, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Returns null only after sending a safe response. No client field can disable
// the guard. Cloudflare enforces token one-use semantics across server instances.
export async function verifiedSignup(req, res, action) {
  res.setHeader('Cache-Control', 'no-store');
  if (!signupConfiguration().enabled || !ACTIONS.has(action)) {
    res.status(503).json({ error: 'Signups are temporarily paused. Please try again later.' });
    return null;
  }
  let body;
  try {
    if (typeof req.body === 'string' && req.body.length > 16384) throw new Error();
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid request body' });
    return null;
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Invalid request body' });
    return null;
  }
  const fields = ['email', 'firstName', 'lastName', 'fullName', 'linkedin', 'website', 'segment', 'whoWhat', 'goal', 'session', 'job', 'aiUse', 'spend', 'city', 'jobTitle', 'company', 'type', 'source'];
  if (fields.some(key => body[key] !== undefined && typeof body[key] !== 'string') ||
      typeof body.email !== 'string' || body.email.length > 320 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
      /[\u0000-\u001F\u007F]/.test(body.email) ||
      (body.honeypot !== undefined && body.honeypot !== '')) {
    res.status(400).json({ error: 'Invalid signup details' });
    return null;
  }
  const token = body.turnstileToken;
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    res.status(400).json({ error: 'Complete the security check and try again.' });
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY.trim(), response: token }),
    });
    if (!response.ok) throw new Error();
    const result = await response.json();
    const age = Date.now() - Date.parse(result?.challenge_ts);
    if (result?.success !== true || result.action !== action || !HOSTNAMES.has(result.hostname) ||
        !Number.isFinite(age) || age < -30000 || age > 300000 ||
        (result['error-codes'] !== undefined && (!Array.isArray(result['error-codes']) || result['error-codes'].length > 0))) {
      console.error('Signup verification rejected', {
        success: result?.success === true,
        action: result?.action === action,
        hostname: HOSTNAMES.has(result?.hostname),
        error_codes: Array.isArray(result?.['error-codes'])
          ? result['error-codes'].filter(code => SITEVERIFY_ERROR_CODES.has(code)).slice(0, 10)
          : [],
      });
      res.status(403).json({ error: 'Security check failed. Please try again.' });
      return null;
    }
    return body;
  } catch {
    console.error('Signup verification unavailable');
    res.status(503).json({ error: 'Security check unavailable. Please try again later.' });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

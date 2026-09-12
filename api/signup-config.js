import { signupConfiguration } from './_signup-security.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const config = signupConfiguration();
  // The site key is public by design. Never return the secret or env object.
  return res.status(200).json({ enabled: config.enabled, siteKey: config.enabled ? config.siteKey : null });
}

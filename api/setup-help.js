import { buildSetupHelpUrl } from './_setup-help.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'private, no-store');
  const destination = buildSetupHelpUrl(process.env.IG_WHATSAPP_SETUP_URL, req.query && req.query.placement);

  if (!destination) return res.redirect(302, '/mcp/start?help=unavailable#setup-unavailable');
  return res.redirect(302, destination);
}

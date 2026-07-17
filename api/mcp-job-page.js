import { renderJobPage } from './_mcp-job-page.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  const page = renderJobPage(req.query && req.query.slug);
  if (!page) return res.status(404).send('Not found');

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).send(page);
}

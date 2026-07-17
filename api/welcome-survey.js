import { safeSurveyFields } from './_survey.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const { challenges, companyStage } = safeSurveyFields(body);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID || 'pub_493c9454-ead1-40c6-b28b-81d4d81a63aa';
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  try {
    const beehiivResponse = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions/by_email/${encodeURIComponent(email)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custom_fields: [
            { name: 'challenges', value: challenges.join(', ') },
            { name: 'company_stage', value: companyStage },
            { name: 'survey_completed', value: 'true' },
          ],
        }),
      },
    );

    if (!beehiivResponse.ok) {
      console.error('Beehiiv survey update failed:', beehiivResponse.status);
      return res.status(502).json({ error: 'Survey update failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Welcome survey handler error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}

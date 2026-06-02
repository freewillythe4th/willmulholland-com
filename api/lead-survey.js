// Lead-magnet post-signup survey receiver. The email was already captured by
// /api/subscribe (Beehiiv); this just sends Will the segmentation answers via
// Telegram so he can see who's signing up and what they need.
//
// Required Vercel env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (already set).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = (body.email || '').trim().slice(0, 160);
  const firstName = (body.firstName || '').trim().slice(0, 80);
  const company = (body.company || '').trim().slice(0, 120);
  const role = (body.role || '').trim().slice(0, 120);
  const goal = (body.goal || '').trim().slice(0, 120);
  const blocker = (body.blocker || '').trim().slice(0, 500);
  const source = (body.source || 'lead magnet').trim().slice(0, 120);

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const text = [
    '<b>\u{1F4E5} New lead-magnet signup</b>',
    '',
    `Name: <b>${esc(firstName || 'not given')}</b>`,
    `Email: <code>${esc(email || 'not given')}</code>`,
    `Role: ${esc(role || 'not given')}${company ? ' @ ' + esc(company) : ''}`,
    `Goal: ${esc(goal || 'not given')}`,
    `Biggest blocker: ${esc(blocker || 'not given')}`,
    `Source: ${esc(source)}`,
    `Time: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!tgRes.ok) {
      console.error('Telegram API error:', await tgRes.text());
      return res.status(502).json({ error: 'Notification failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('lead-survey handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

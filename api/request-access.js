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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const password = process.env.WORK_PASSWORD || 'willworks2026';

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const subject = encodeURIComponent('Your password for willmulholland.com/work');
  const emailBody = encodeURIComponent(
    `Hey,\n\nThanks for requesting access. The password is:\n\n${password}\n\nGo to https://www.willmulholland.com/work.html and pop it in.\n\nWill`
  );
  const mailtoLink = `mailto:${email}?subject=${subject}&body=${emailBody}`;

  const text = [
    '🔐 *Work samples access request*',
    '',
    `From: \`${email}\``,
    `Time: ${new Date().toISOString()}`,
    '',
    `[Tap to send password](${mailtoLink})`,
  ].join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text();
      console.error('Telegram API error:', errText);
      return res.status(502).json({ error: 'Notification failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Request access handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

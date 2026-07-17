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
  const password = process.env.WORK_PASSWORD || 'Access';

  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const subject = encodeURIComponent('Your password for willmulholland.com/work');
  const emailBody = encodeURIComponent(
    `Hey,\n\nThanks for requesting access. The password is:\n\n${password}\n\nGo to https://www.willmulholland.com/work.html and pop it in.\n\nWill`
  );
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${emailBody}`;

  const text = [
    '<b>🔐 Work samples access request</b>',
    '',
    `From: <code>${email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`,
    `Time: ${new Date().toISOString()}`,
    '',
    `Password: <code>${password}</code>`,
  ].join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: '📧 Send password via Gmail', url: gmailComposeUrl }],
          ],
        },
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

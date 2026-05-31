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
  const firstName = (body.firstName || '').trim().slice(0, 80);
  const segment = (body.segment || '').trim().slice(0, 120);
  const session = (body.session || '').trim().slice(0, 120);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!firstName) {
    return res.status(400).json({ error: 'First name required' });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1. Best-effort: add to Beehiiv list. Never blocks the registration.
  const beehiivKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID || 'pub_493c9454-ead1-40c6-b28b-81d4d81a63aa';
  if (beehiivKey) {
    try {
      const bhRes = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${beehiivKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: false,
          utm_source: 'willmulholland.com',
          utm_medium: 'workshop',
          utm_campaign: 'workshop-2026-06-22',
        }),
      });
      if (!bhRes.ok) {
        console.error('Beehiiv API error:', bhRes.status, await bhRes.text());
      }
    } catch (err) {
      console.error('Beehiiv subscribe failed (non-blocking):', err);
    }
  } else {
    console.error('Missing BEEHIIV_API_KEY env var (skipping list add)');
  }

  // 2. Notify Will via Telegram. This is the operational capture, so it gates success.
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const subject = encodeURIComponent('Your Google Meet link, Run your marketing with AI');
  const emailBody = encodeURIComponent(
    `Hey ${firstName},\n\nThanks for reserving your spot for Run your marketing with AI.\n\nWed 24 June 7pm AEST, or Fri 26 June 7pm PT. Live on Google Meet.\n\nGoogle Meet link: [paste link]\n\nAdd it to your calendar so you don't miss it. See you there.\n\nWill`
  );
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${emailBody}`;

  const text = [
    '<b>\u{1F4C5} Workshop registration</b>',
    '',
    `Name: <b>${esc(firstName)}</b>`,
    `Email: <code>${esc(email)}</code>`,
    `Segment: ${esc(segment || 'not given')}`,
    `Session: ${esc(session || 'not given')}`,
    `Time: ${new Date().toISOString()}`,
    '',
    'Workshop: Run your marketing with AI (Wed 24 Jun 7pm AEST / Fri 26 Jun 7pm PT)',
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
            [{ text: '\u{1F4E7} Send Meet link via Gmail', url: gmailComposeUrl }],
          ],
        },
      }),
    });

    if (!tgRes.ok) {
      console.error('Telegram API error:', await tgRes.text());
      return res.status(502).json({ error: 'Notification failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Workshop register handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

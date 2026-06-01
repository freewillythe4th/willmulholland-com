// Community application receiver. Captures a vetted application for the free
// marketing-with-AI community ("the room") and notifies Will via Telegram so he
// can approve and send the WhatsApp invite manually. No instant access: the
// applicant only sees a "we vet every application" confirmation.
//
// Required Vercel env vars:
//   TELEGRAM_BOT_TOKEN   Telegram bot token (gates success, same as workshop)
//   TELEGRAM_CHAT_ID     Will's chat id
// Optional:
//   BEEHIIV_API_KEY          best-effort list add, never blocks
//   BEEHIIV_PUBLICATION_ID   defaults to the intelligent-growth publication
//   COMMUNITY_INVITE_URL     WhatsApp invite link used in the approval email button

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
  const firstName = (body.firstName || '').trim().slice(0, 80);
  const lastName = (body.lastName || '').trim().slice(0, 80);
  const email = (body.email || '').trim();
  const city = (body.city || '').trim().slice(0, 120);
  const jobTitle = (body.jobTitle || '').trim().slice(0, 120);
  const company = (body.company || '').trim().slice(0, 120);
  const type = (body.type || '').trim().slice(0, 120);
  const source = (body.source || '').trim().slice(0, 200);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!firstName) {
    return res.status(400).json({ error: 'First name required' });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1. Best-effort: add to Beehiiv list, tagged as a community applicant. Never blocks.
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
          utm_medium: 'community',
          utm_campaign: 'community-application',
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

  const inviteUrl = process.env.COMMUNITY_INVITE_URL || 'https://chat.whatsapp.com/JdMGFj6h1PVHWWeSweUVpc';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const subject = encodeURIComponent("You're in, here's the room");
  const emailBody = encodeURIComponent(
    `Hey ${firstName},\n\nYou're approved for the community. It's a free group of marketers swapping what's actually working with AI, the real workflows, the stuff that flopped, and short live calls.\n\nHere's your invite: ${inviteUrl}\n\nJump in and say hi.\n\nWill`
  );
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${emailBody}`;

  const text = [
    '<b>\u{1F6AA} Community application</b>',
    '',
    `Name: <b>${esc(fullName || firstName)}</b>`,
    `Email: <code>${esc(email)}</code>`,
    `Role: ${esc(jobTitle || 'not given')}${company ? ' @ ' + esc(company) : ''}`,
    `Type: ${esc(type || 'not given')}`,
    `City: ${esc(city || 'not given')}`,
    `Heard via: ${esc(source || 'not given')}`,
    `Time: ${new Date().toISOString()}`,
    '',
    'Vet, then approve to send the WhatsApp invite.',
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
            [{ text: '\u{2705} Approve, send invite via Gmail', url: gmailComposeUrl }],
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
    console.error('Community apply handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

import { buildSubmissionRecord, formatSubmissionCaption } from './_first-ten-worksheet.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (body.company) return res.status(200).json({ ok: true });

  let record;
  try {
    record = buildSubmissionRecord(body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const safeSuffix = record.worksheetId.slice(-8);
  const filename = `soara-first-ten-${record.submittedAt.slice(0, 10)}-${safeSuffix}.json`;
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', formatSubmissionCaption(record));
  form.append('parse_mode', 'HTML');
  form.append(
    'document',
    new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }),
    filename,
  );

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form,
    });

    if (!telegramResponse.ok) {
      console.error('Telegram worksheet upload failed:', telegramResponse.status);
      return res.status(502).json({ error: 'Submission failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('First ten worksheet handler error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}

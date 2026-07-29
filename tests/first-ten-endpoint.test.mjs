import test from 'node:test';
import assert from 'node:assert/strict';

import handler from '../api/first-ten-worksheet.js';

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
}

test('submission endpoint sends one structured attachment through the configured capture path', async () => {
  const previousToken = process.env.TELEGRAM_BOT_TOKEN;
  const previousChatId = process.env.TELEGRAM_CHAT_ID;
  const previousFetch = globalThis.fetch;
  let capturedRequest;

  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_CHAT_ID = 'test-chat';
  globalThis.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return { ok: true, status: 200 };
  };

  try {
    const response = responseRecorder();
    await handler({
      method: 'POST',
      body: {
        consent: true,
        worksheetId: '11111111-2222-4333-8444-555555555555',
        answers: { assumptionWho: 'Solo founders preparing a launch' },
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { ok: true });
    assert.equal(response.headers['Cache-Control'], 'no-store');
    assert.equal(capturedRequest.url, 'https://api.telegram.org/bottest-token/sendDocument');
    assert.equal(capturedRequest.options.method, 'POST');
    assert.equal(capturedRequest.options.body.get('chat_id'), 'test-chat');

    const attachment = capturedRequest.options.body.get('document');
    const record = JSON.parse(await attachment.text());
    assert.equal(record.answers.assumptionWho, 'Solo founders preparing a launch');
    assert.equal(record.consent.anonymousWorkshopExamples, true);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = previousToken;
    if (previousChatId === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = previousChatId;
  }
});

test('submission endpoint rejects cross-site and oversized requests before capture', async () => {
  const crossSiteResponse = responseRecorder();
  await handler({
    method: 'POST',
    headers: {
      host: 'intelligentgrowth.app',
      origin: 'https://example.com',
      'sec-fetch-site': 'cross-site',
    },
    body: {},
  }, crossSiteResponse);
  assert.equal(crossSiteResponse.statusCode, 403);

  const oversizedResponse = responseRecorder();
  await handler({
    method: 'POST',
    headers: { 'content-length': '60000' },
    body: {},
  }, oversizedResponse);
  assert.equal(oversizedResponse.statusCode, 413);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import subscribe from '../api/subscribe.js';
import workshop from '../api/workshop-register.js';
import community from '../api/community-apply.js';

const routes = [[subscribe, 'subscribe'], [workshop, 'workshop_register'], [community, 'community_apply']];
function setup(t, action, verify = {}) {
  const env = { SIGNUPS_PAUSED: '0', TURNSTILE_SITE_KEY: 'local-site-key', TURNSTILE_SECRET_KEY: 'private-secret', BEEHIIV_API_KEY: 'private-key', TELEGRAM_BOT_TOKEN: 'private-bot', TELEGRAM_CHAT_ID: 'test-chat' };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const calls = [], logs = [];
  t.mock.method(console, 'error', (...args) => logs.push(args));
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/siteverify')) return { ok: true, json: async () => ({ success: true, hostname: 'intelligentgrowth.app', action, challenge_ts: new Date().toISOString(), ...verify }) };
    return { ok: true, json: async () => ({ data: { status: 'validating' } }) };
  });
  return { calls, logs };
}
async function request(handler, body = {}, method = 'POST') {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(v) { this.body = v; return this; }, end() { return this; } };
  await handler({ method, body }, res);
  return res;
}
const input = { email: 'private-person@example.com', firstName: 'Test', turnstileToken: 'local-token', reactivate: true, double_opt_override: 'off', skipTurnstile: true };

for (const [handler, action] of routes) {
  test(`${action}: missing and oversized tokens never reach providers`, async t => {
    const ctx = setup(t, action);
    for (const token of [undefined, '', ' ', {}, 'a'.repeat(2049)]) {
      assert.equal((await request(handler, { ...input, turnstileToken: token })).statusCode, 400);
    }
    assert.equal(ctx.calls.length, 0);
  });
  test(`${action}: paused or missing configuration fails closed`, async t => {
    const ctx = setup(t, action);
    process.env.SIGNUPS_PAUSED = '1';
    assert.equal((await request(handler, input)).statusCode, 503);
    process.env.SIGNUPS_PAUSED = '0';
    for (const key of ['TURNSTILE_SECRET_KEY', 'TURNSTILE_SITE_KEY']) {
      const value = process.env[key]; delete process.env[key];
      assert.equal((await request(handler, input)).statusCode, 503);
      process.env[key] = value;
    }
    assert.equal(ctx.calls.length, 0);
  });
  for (const [name, verify] of [
    ['failed', { success: false }], ['replayed', { success: false, 'error-codes': ['timeout-or-duplicate'] }],
    ['wrong action', { action: 'other' }], ['wrong hostname', { hostname: 'evil.example' }],
    ['preview hostname', { hostname: 'site.vercel.app' }], ['nonboolean success', { success: 'true' }],
    ['missing timestamp', { challenge_ts: undefined }], ['expired timestamp', { challenge_ts: '2000-01-01T00:00:00Z' }],
  ]) {
    test(`${action}: ${name} verification never reaches downstream providers`, async t => {
      const ctx = setup(t, action, verify);
      assert.equal((await request(handler, input)).statusCode, 403);
      assert.equal(ctx.calls.length, 1);
      assert.match(ctx.calls[0].url, /\/siteverify$/);
      assert.doesNotMatch(inspect(ctx.logs), /private-person|local-token|private-secret/);
    });
  }
  test(`${action}: validated request forces confirmation and cannot reactivate`, async t => {
    const ctx = setup(t, action);
    const res = await request(handler, input);
    assert.equal(res.statusCode, 200);
    const bh = ctx.calls.find(c => c.url.startsWith('https://api.beehiiv.com/'));
    assert.ok(bh);
    const payload = JSON.parse(bh.options.body);
    assert.equal(payload.double_opt_override, 'on');
    assert.equal(payload.reactivate_existing, false);
    assert.equal(payload.send_welcome_email, false);
    assert.equal(payload.turnstileToken, undefined);
    assert.equal(payload.skipTurnstile, undefined);
  });
  test(`${action}: malformed body never crashes or calls a provider`, async t => {
    const ctx = setup(t, action);
    for (const body of ['{', 'null', [], 123, { ...input, email: {} }, { ...input, firstName: {} }]) {
      const res = await request(handler, body);
      if (action === 'subscribe' && body?.firstName && typeof body.firstName === 'object') continue;
      assert.equal(res.statusCode, 400);
    }
  });
}

for (const [handler, action] of routes) {
  test(`${action}: verification network or JSON failure stays closed and private`, async t => {
    const ctx = setup(t, action);
    for (const response of [null, { ok: false }, { ok: true, json: async () => { throw new Error('private-secret'); } }]) {
      t.mock.method(globalThis, 'fetch', async () => { if (!response) throw new Error('local-token'); return response; });
      assert.equal((await request(handler, input)).statusCode, 503);
    }
    assert.doesNotMatch(inspect(ctx.logs), /private-secret|local-token/);
  });
  test(`${action}: verification timeout aborts with no downstream call`, async t => {
    setup(t, action); t.mock.timers.enable({ apis: ['setTimeout'] });
    let signal;
    t.mock.method(globalThis, 'fetch', async (_url, options) => new Promise((_resolve, reject) => {
      signal = options.signal; signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
    }));
    const promise = request(handler, input);
    t.mock.timers.tick(5000);
    assert.equal((await promise).statusCode, 503); assert.equal(signal.aborted, true);
  });
  test(`${action}: upstream failure is not logged with subscriber data`, async t => {
    const ctx = setup(t, action);
    t.mock.method(globalThis, 'fetch', async url => {
      if (url.includes('/siteverify')) return { ok: true, json: async () => ({ success: true, action, hostname: 'www.willmulholland.com', challenge_ts: new Date().toISOString() }) };
      return { ok: false, status: 502, text: async () => 'private-person@example.com' };
    });
    assert.equal((await request(handler, input)).statusCode, 502);
    assert.doesNotMatch(inspect(ctx.logs), /private-person/);
  });
}

test('public configuration exposes only a public site key and respects pause or absent keys', async t => {
  setup(t, 'subscribe');
  const { default: handler } = await import('../api/signup-config.js');
  const configured = await request(handler, {}, 'GET');
  assert.deepEqual(configured.body, { enabled: true, siteKey: 'local-site-key' });
  assert.equal(configured.headers['Cache-Control'], 'no-store');
  assert.doesNotMatch(inspect(configured), /private-secret|private-key|private-bot/);
  process.env.SIGNUPS_PAUSED = '1';
  assert.deepEqual((await request(handler, {}, 'GET')).body, { enabled: false, siteKey: null });
  process.env.SIGNUPS_PAUSED = '0';
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.deepEqual((await request(handler, {}, 'GET')).body, { enabled: false, siteKey: null });
  assert.equal((await request(handler, {}, 'POST')).statusCode, 405);
});

test('each verified production hostname is accepted, with no header or client hostname override', async t => {
  const ctx = setup(t, 'subscribe');
  for (const hostname of ['intelligentgrowth.app', 'www.intelligentgrowth.app', 'willmulholland.com', 'www.willmulholland.com']) {
    t.mock.method(globalThis, 'fetch', async url => url.includes('/siteverify')
      ? { ok: true, json: async () => ({ success: true, action: 'subscribe', hostname, challenge_ts: new Date().toISOString() }) }
      : { ok: true });
    assert.equal((await request(subscribe, { ...input, hostname: 'evil.example' })).statusCode, 200);
  }
  assert.doesNotMatch(inspect(ctx.logs), /private-person/);
});


test('403 diagnostics contain only verification booleans and recognised error codes', async t => {
  const ctx = setup(t, 'subscribe', { success: false, action: 'other', hostname: 'private-person@example.com',
    'error-codes': ['timeout-or-duplicate', 'private-person@example.com', 'local-token', { token: 'local-token' }] });
  assert.equal((await request(subscribe, input)).statusCode, 403);
  assert.deepEqual(ctx.logs, [['Signup verification rejected', {
    success: false, action: false, hostname: false, error_codes: ['timeout-or-duplicate']
  }]]);
  assert.doesNotMatch(inspect(ctx.logs), /private-person|local-token|private-secret|evil\.example/);
});

test('403 diagnostics distinguish hostname failure from successful action and verification', async t => {
  const ctx = setup(t, 'subscribe', { hostname: 'evil.example' });
  assert.equal((await request(subscribe, input)).statusCode, 403);
  assert.deepEqual(ctx.logs, [['Signup verification rejected', {
    success: true, action: true, hostname: false, error_codes: []
  }]]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import handler from '../api/subscribe.js';

function setup(t, upstream = async () => ({ ok: true })) {
  const calls = [];
  const logs = [];
  t.mock.method(globalThis, 'fetch', async (...args) => {
    if (args[0].includes('/siteverify')) return { ok: true, json: async () => ({ success: true, action: 'subscribe', hostname: 'intelligentgrowth.app', challenge_ts: new Date().toISOString() }) };
    calls.push(args);
    return upstream(...args);
  });
  t.mock.method(console, 'error', (...args) => logs.push(args));
  for (const [key, value] of Object.entries({ TURNSTILE_SITE_KEY: 'local-site', TURNSTILE_SECRET_KEY: 'local-secret', SIGNUPS_PAUSED: '0' })) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const oldKey = process.env.BEEHIIV_API_KEY;
  process.env.BEEHIIV_API_KEY = 'test-only-key';
  t.after(() => {
    if (oldKey === undefined) delete process.env.BEEHIIV_API_KEY;
    else process.env.BEEHIIV_API_KEY = oldKey;
  });
  return {
    calls, logs,
    async request(body, method = 'POST') {
      const res = {
        setHeader() {},
        status(code) { this.statusCode = code; return this; },
        json(value) { this.body = value; return this; },
        end() { return this; },
      };
      if (body && typeof body === 'object' && !Array.isArray(body)) body = { turnstileToken: 'local-token', ...body };
      await handler({ method, body }, res);
      return res;
    },
  };
}

test('valid signup preserves attribution, job and source with mandatory confirmation', async (t) => {
  const ctx = setup(t);
  const response = await ctx.request({
    email: '  Person+course@example.com  ', source: 'Brain Founding Cohort',
    job: '=Customer insights', reactivate: true, honeypot: '',
    utm_source: 'LinkedIn', utm_medium: 'Organic Social', utm_campaign: 'Workshop',
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true });
  assert.equal(ctx.calls.length, 1);
  assert.deepEqual(JSON.parse(ctx.calls[0][1].body), {
    email: 'Person+course@example.com', reactivate_existing: false,
    send_welcome_email: false, double_opt_override: 'on', utm_source: 'linkedin', utm_medium: 'organic_social',
    utm_campaign: 'workshop', custom_fields: [
      { name: 'Lead Source', value: 'brain_founding_cohort' },
      { name: 'ig_focus', value: 'Customer insights' },
    ],
  });
});

test('passive signup and nonboolean reactivation never reactivate subscribers', async (t) => {
  const ctx = setup(t);
  for (const reactivate of [undefined, false, 'true', 1]) {
    assert.equal((await ctx.request({ email: 'person@example.com', reactivate })).statusCode, 200);
    assert.equal(JSON.parse(ctx.calls.at(-1)[1].body).reactivate_existing, false);
  }
});

test('malformed and oversized emails never reach the subscription provider', async (t) => {
  const ctx = setup(t);
  for (const email of [null, {}, [], '', 'a@@example.com', 'a b@example.com',
    'a..b@example.com', '.person@example.com', 'person.@example.com',
    'person@-example.com', 'person@example-.com', 'person@exam_ple.com',
    'person@example..com', 'person@localhost', 'person@example.com\u0000',
    'a'.repeat(65) + '@example.com', 'person@' + 'a'.repeat(64) + '.com',
    'a'.repeat(64) + '@' + ['a'.repeat(63), 'b'.repeat(63), 'c'.repeat(63)].join('.'),
    ' '.repeat(10000) + 'person@example.com']) {
    assert.equal((await ctx.request({ email })).statusCode, 400, JSON.stringify(email).slice(0, 90));
  }
  assert.equal(ctx.calls.length, 0);
});

test('populated or malformed honeypot never creates a subscription', async (t) => {
  const ctx = setup(t);
  for (const honeypot of ['https://spam.example', ' ', {}, [], true, 1, null]) {
    assert.equal((await ctx.request({ email: 'person@example.com', honeypot })).statusCode, 400);
  }
  assert.equal(ctx.calls.length, 0);
});

test('bad request shapes and unsupported methods never reach the provider', async (t) => {
  const ctx = setup(t);
  for (const body of ['{', 'null', '[]', '123', []]) {
    assert.equal((await ctx.request(body)).statusCode, 400);
  }
  assert.equal((await ctx.request({}, 'GET')).statusCode, 405);
  assert.equal((await ctx.request({}, 'OPTIONS')).statusCode, 200);
  assert.equal(ctx.calls.length, 0);
});

test('provider failure logs no response body or subscriber details', async (t) => {
  let bodyReads = 0;
  const ctx = setup(t, async () => ({
    ok: false, status: 422,
    text: async () => { bodyReads++; return 'private-subscriber@example.com'; },
  }));
  const response = await ctx.request({ email: 'private-subscriber@example.com' });
  assert.equal(response.statusCode, 502);
  assert.equal(bodyReads, 0);
  assert.doesNotMatch(inspect([response.body, ctx.logs]), /private-subscriber/);
});

test('network exceptions never expose provider errors or subscriber details', async (t) => {
  const ctx = setup(t, async () => { throw new Error('private-subscriber@example.com test-only-key'); });
  const response = await ctx.request({ email: 'private-subscriber@example.com' });
  assert.equal(response.statusCode, 500);
  assert.doesNotMatch(inspect([response.body, ctx.logs]), /private-subscriber|test-only-key/);
});

test('stalled upstream is aborted after eight seconds and returns a safe failure', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const ctx = setup(t, async (_url, { signal }) => new Promise((_resolve, reject) => {
    assert.ok(signal, 'upstream request must have a cancellation signal');
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const response = ctx.request({ email: 'person@example.com' });
  await new Promise(resolve => setImmediate(resolve));
  t.mock.timers.tick(8000);
  assert.equal((await response).statusCode, 504);
  assert.equal(ctx.calls[0][1].signal.aborted, true);
});

test('common valid mailbox variants and maximum length remain accepted', async (t) => {
  const ctx = setup(t);
  const maximumEmail = 'a'.repeat(64) + '@' + ['a'.repeat(63), 'b'.repeat(63), 'c'.repeat(61)].join('.');
  assert.equal(maximumEmail.length, 254);
  for (const email of ["o'connor@example.com", 'first.last+tag@sub.example.com',
    'person@bücher.example', 'josé@example.com', '"person"@example.com',
    'person@xn--bcher-kva.example', maximumEmail]) {
    assert.equal((await ctx.request({ email })).statusCode, 200);
  }
  assert.equal(ctx.calls.length, 7);
});

test('completed request cancels its timeout', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const ctx = setup(t);
  assert.equal((await ctx.request({ email: 'person@example.com' })).statusCode, 200);
  t.mock.timers.tick(8000);
  assert.equal(ctx.calls[0][1].signal.aborted, false);
});

test('missing API configuration fails safely without upstream traffic', async (t) => {
  const ctx = setup(t);
  delete process.env.BEEHIIV_API_KEY;
  assert.equal((await ctx.request({ email: 'person@example.com' })).statusCode, 500);
  assert.equal(ctx.calls.length, 0);
});

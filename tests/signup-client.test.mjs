import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync(new URL('../js/signup-security.js', import.meta.url), 'utf8');
function environment(config = { enabled: true, siteKey: 'public-site-key' }, upstream = async () => ({ ok: true, status: 200 })) {
  function element() { return { style: {}, children: [], textContent: '', setAttribute() {}, appendChild(el) { this.children.push(el); } }; }
  const forms = ['subscribe', 'workshop_register', 'community_apply'].map(action => Object.assign(element(), { getAttribute: () => action }));
  const renders = [], resets = [], calls = [];
  const window = { turnstile: { render(container, options) { renders.push(options); return renders.length - 1; }, reset(id) { resets.push(id); } } };
  const document = { readyState: 'complete', querySelectorAll: () => forms, createElement: element, head: element() };
  vm.runInNewContext(script, { window, document, Map, AbortController, setTimeout, clearTimeout, fetch: async (url, options) => {
    if (url === '/api/signup-config') return { ok: true, json: async () => config };
    calls.push({ url, options }); return upstream(url, options);
  } });
  return { window, forms, renders, resets, calls };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const options = { method: 'POST', body: JSON.stringify({ email: 'person@example.com', source: 'campaign', turnstileToken: 'spoofed' }) };

test('managed widgets are distinct for each action and require a token before network submission', async t => {
  const ctx = environment(); await tick();
  assert.deepEqual(ctx.renders.map(r => r.action), ['subscribe', 'workshop_register', 'community_apply']);
  for (const r of ctx.renders) assert.equal(r.appearance, 'interaction-only');
  const pending = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  assert.equal(ctx.calls.length, 0);
  assert.match(ctx.forms[0].children[1].textContent, /Checking/);
  ctx.renders[0].callback('delayed-token');
  assert.equal((await pending).status, 200);
  assert.equal(JSON.parse(ctx.calls[0].options.body).turnstileToken, 'delayed-token');
});

test('verified client submission uses its own token, preserves payload, resets and blocks reuse', async () => {
  const ctx = environment(); await tick();
  ctx.renders[0].callback('fresh-token');
  assert.equal((await ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options)).status, 200);
  assert.deepEqual(JSON.parse(ctx.calls[0].options.body), { email: 'person@example.com', source: 'campaign', turnstileToken: 'fresh-token' });
  assert.deepEqual(ctx.resets, [0]);
  const pending = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  ctx.renders[0]['error-callback']('600010');
  await assert.rejects(pending, /Security check/);
  assert.equal(ctx.calls.length, 1);
});

test('expiry and challenge failure invalidate tokens; expiry resets only its own form', async () => {
  const ctx = environment(); await tick();
  ctx.renders[0].callback('expired-token'); ctx.renders[1].callback('workshop-token');
  ctx.renders[0]['expired-callback']();
  assert.deepEqual(ctx.resets, [0]);
  const pending = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  ctx.renders[0]['error-callback']('600010');
  await assert.rejects(pending, /Security check/);
  assert.equal((await ctx.window.igSignup.submit(ctx.forms[1], '/api/workshop-register', options)).status, 200);
  ctx.renders[2].callback('failed-token'); ctx.renders[2]['error-callback']();
  const retry = ctx.window.igSignup.submit(ctx.forms[2], '/api/community-apply', options);
  await tick();
  ctx.renders[2]['error-callback']('600010');
  await assert.rejects(retry, /Security check/);
});

for (const failure of ['http', 'network']) test(`${failure} signup failure resets the consumed token`, async () => {
  const ctx = environment(undefined, async () => { if (failure === 'network') throw new Error('network'); return { ok: false, status: 503 }; });
  await tick(); ctx.renders[0].callback('fresh');
  try { await ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options); } catch {}
  assert.deepEqual(ctx.resets, [0]);
  const pending = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  ctx.renders[0]['error-callback']('600010');
  await assert.rejects(pending, /Security check/);
  assert.equal(ctx.calls.length, 1);
});

test('disabled public configuration never renders or submits', async () => {
  const ctx = environment({ enabled: false, siteKey: null }); await tick();
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options), /paused/);
  assert.equal(ctx.calls.length, 0); assert.equal(ctx.renders.length, 0);
});

test('wrong form action cannot submit to another protected endpoint', async () => {
  const ctx = environment(); await tick(); ctx.renders[0].callback('fresh');
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/community-apply', options), /Invalid signup form/);
  assert.equal(ctx.calls.length, 0);
});

test('every protected HTML caller uses the shared helper, script and matching form action', () => {
  const root = new URL('../', import.meta.url);
  const expected = { 'subscribe': 19, 'workshop_register': 1, 'community_apply': 0 };
  const count = { subscribe: 0, workshop_register: 0, community_apply: 0 };
  let callers = 0;
  for (const file of readdirSync(root).filter(f => f.endsWith('.html'))) {
    const html = readFileSync(new URL(file, root), 'utf8');
    if (!/\/api\/(subscribe|workshop-register|community-apply)/.test(html)) continue;
    callers++;
    assert.match(html, /<script src="\/js\/signup-security.js"><\/script>/, file);
    assert.doesNotMatch(html, /fetch\('\/api\/(subscribe|workshop-register|community-apply)'/, file);
    for (const [, action] of html.matchAll(/<form data-signup-action="([a-z_]+)"/g)) count[action]++;
    assert.match(html, /window\.igSignup\.submit\((form|f), '\/api\//, file);
  }
  assert.equal(callers, 12); assert.deepEqual(count, expected);
});


test('a challenge error never submits and a fresh retry can succeed', async () => {
  const ctx = environment(); await tick();
  const first = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  ctx.renders[0]['error-callback']('600010');
  await assert.rejects(first, /600010/);
  assert.equal(ctx.calls.length, 0);
  const retry = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick(); ctx.renders[0].callback('retry-token');
  assert.equal((await retry).status, 200);
  assert.equal(ctx.calls.length, 1);
});

test('concurrent taps cannot send two requests while waiting for a token', async () => {
  const ctx = environment(); await tick();
  const first = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick();
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options), /in progress/);
  ctx.renders[0].callback('only-token');
  await first;
  assert.equal(ctx.calls.length, 1);
});

test('non-security server errors reach the caller', async () => {
  const ctx = environment(undefined, async () => ({ ok: false, status: 503, json: async () => ({ error: 'Signups are temporarily paused. Please try again later.' }) }));
  await tick(); ctx.renders[0].callback('rejected-token');
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options), /Signups are temporarily paused/);
});


test('a 15 second token timeout sends nothing and releases the form for retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const ctx = environment(); await tick();
  const pending = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  const rejected = assert.rejects(pending, /Security check timed out/);
  await tick(); t.mock.timers.tick(15000); await rejected;
  assert.equal(ctx.calls.length, 0);
  const retry = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick(); ctx.renders[0].callback('after-timeout');
  assert.equal((await retry).status, 200);
});

test('failed configuration can be retried without duplicating widgets or status lines', async () => {
  const config = { enabled: false, siteKey: null };
  const ctx = environment(config); await tick();
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options), /paused/);
  config.enabled = true; config.siteKey = 'public-site-key';
  const retry = ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options);
  await tick(); ctx.renders[0].callback('after-reload');
  assert.equal((await retry).status, 200);
  assert.equal(ctx.forms[0].children.length, 2);
  assert.equal(ctx.renders.length, 3);
});


test('a 403 resets the widget, gives the exact retry message and accepts a fresh token', async () => {
  let attempts = 0;
  const ctx = environment(undefined, async () => ++attempts === 1
    ? { ok: false, status: 403, json: async () => ({ error: 'Security check failed. Please try again.' }) }
    : { ok: true, status: 200 });
  await tick(); ctx.renders[0].callback('rejected-token');
  await assert.rejects(ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options),
    { message: "Security check didn't go through. Tap Send it over again." });
  assert.deepEqual(ctx.resets, [0]);
  assert.equal(ctx.forms[0].children[1].textContent, "Security check didn't go through. Tap Send it over again.");
  ctx.renders[0].callback('fresh-retry-token');
  assert.equal((await ctx.window.igSignup.submit(ctx.forms[0], '/api/subscribe', options)).status, 200);
  assert.equal(JSON.parse(ctx.calls[1].options.body).turnstileToken, 'fresh-retry-token');
});

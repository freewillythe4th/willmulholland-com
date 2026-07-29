import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pageUrl = new URL('../first-ten.html', import.meta.url);
const routesUrl = new URL('../vercel.json', import.meta.url);

test('first ten worksheet exposes the complete five-step participant flow', () => {
  const html = fs.readFileSync(pageUrl, 'utf8');

  assert.match(html, /<form[^>]+id="worksheetForm"/);
  assert.match(html, /data-step="assumptions"/);
  assert.match(html, /data-step="conversations"/);
  assert.match(html, /data-step="prompts"/);
  assert.match(html, /data-step="offer"/);
  assert.match(html, /data-step="outreach"/);
  assert.match(html, /name="assumptionWho"/);
  assert.match(html, /name="conversationIntroducer"/);
  assert.match(html, /name="momLastTime"/);
  assert.match(html, /name="offerTheyGet"/);
  assert.match(html, /name="outreachQuestion"/);
});

test('page makes browser-private autosave and optional sharing clear', () => {
  const html = fs.readFileSync(pageUrl, 'utf8');

  assert.match(html, /Your draft stays in this browser/i);
  assert.match(html, /Nothing is shared unless you choose/i);
  assert.match(html, /may be used anonymously in workshop examples/i);
  assert.match(html, /id="shareConsent"/);
  assert.match(html, /id="shareDialog"/);
  assert.match(html, /id="saveStatus"[^>]+aria-live="polite"/);
});

test('participant copy avoids internal product terms and retired motifs', () => {
  const html = fs.readFileSync(pageUrl, 'utf8');

  assert.doesNotMatch(html, /\bMCP\b|\bConnector\b/);
  assert.doesNotMatch(html, /Mom Test/i);
  assert.doesNotMatch(html, /mountain|summit|trail/i);
  assert.doesNotMatch(html, /[\u2013\u2014]/);
});

test('the clean chat route resolves before the site catch-all', () => {
  const config = JSON.parse(fs.readFileSync(routesUrl, 'utf8'));
  const worksheetIndex = config.routes.findIndex((route) => route.src === '/first-ten');
  const catchAllIndex = config.routes.findIndex((route) => route.src === '/(.*)');

  assert.ok(worksheetIndex >= 0);
  assert.equal(config.routes[worksheetIndex].dest, '/first-ten.html');
  assert.match(config.routes[worksheetIndex].headers['Content-Security-Policy'], /default-src 'self'/);
  assert.equal(config.routes[worksheetIndex].headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(config.routes[worksheetIndex].headers['X-Frame-Options'], 'DENY');
  assert.ok(worksheetIndex < catchAllIndex);
});

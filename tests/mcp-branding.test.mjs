import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const pages = [
  '../mcp.html',
  '../mcp-start.html',
  '../terms.html',
  '../privacy.html'
];

test('MCP pages use the same clean canonical logo as the main site', () => {
  for (const page of pages) {
    const html = fs.readFileSync(new URL(page, import.meta.url), 'utf8');

    assert.match(html, /src="\/images\/ig-logo\/ig-logo-full\.png"/);
    assert.doesNotMatch(html, /ig-nav-lockup\.png/);
    assert.doesNotMatch(html, /ig-lockup-bigword\.png/);
  }
});

test('the canonical navigation logo is the real stacked PNG', () => {
  const image = fs.readFileSync(new URL('../images/ig-logo/ig-logo-full.png', import.meta.url));

  assert.equal(image.toString('ascii', 1, 4), 'PNG');
  assert.equal(image.readUInt32BE(16), 426);
  assert.equal(image.readUInt32BE(20), 318);
});

test('server-rendered MCP job pages use the same canonical logo', () => {
  const template = fs.readFileSync(new URL('../api/_mcp-job-page.js', import.meta.url), 'utf8');

  assert.match(template, /src="\/images\/ig-logo\/ig-logo-full\.png"/);
  assert.doesNotMatch(template, /ig-nav-lockup\.png/);
  assert.doesNotMatch(template, /ig-lockup-bigword\.png/);
});

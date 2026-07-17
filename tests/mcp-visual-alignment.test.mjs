import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const stylesheet = fs.readFileSync(new URL('../css/mcp-funnel.css', import.meta.url), 'utf8');
const productPage = fs.readFileSync(new URL('../mcp.html', import.meta.url), 'utf8');
const setupPage = fs.readFileSync(new URL('../mcp-start.html', import.meta.url), 'utf8');
const jobTemplate = fs.readFileSync(new URL('../api/_mcp-job-page.js', import.meta.url), 'utf8');

test('the MCP funnel uses the white and soft-gray Intelligent Growth canvas', () => {
  assert.match(stylesheet, /--paper:\s*#fff(?:fff)?;/i);
  assert.match(stylesheet, /--paper-strong:\s*#f4f4f2;/i);
  assert.match(stylesheet, /body\s*\{[^}]*background:\s*var\(--paper\)/s);
  assert.match(stylesheet, /\.section-white\s*\{\s*background:\s*var\(--paper-strong\)/s);
  assert.match(stylesheet, /\.site-nav\s*\{[^}]*background:\s*rgba\(255,\s*255,\s*255,/s);
  assert.match(stylesheet, /\.site-nav__brand img\s*\{[^}]*width:\s*auto;[^}]*height:\s*46px;/s);
});

test('the old all-beige palette cannot return', () => {
  assert.doesNotMatch(stylesheet, /#f2ede3/i);
  assert.doesNotMatch(stylesheet, /#ebe5d8/i);
  assert.doesNotMatch(stylesheet, /rgba\(247,\s*243,\s*236/i);
});

test('product, setup, and job pages share the aligned funnel system', () => {
  for (const html of [productPage, setupPage, jobTemplate]) {
    assert.match(html, /\/css\/mcp-funnel\.css/);
    assert.match(html, /\/images\/ig-logo\/ig-logo-full\.png/);
  }

  assert.match(productPage, /section-dark/);
  assert.match(productPage, /section-blue/);
});

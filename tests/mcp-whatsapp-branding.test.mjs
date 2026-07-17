import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const pages = [
  '../mcp.html',
  '../mcp-start.html'
];

test('every WhatsApp setup link includes the recognizable channel icon', () => {
  for (const page of pages) {
    const html = fs.readFileSync(new URL(page, import.meta.url), 'utf8');
    const whatsappLinks = html.match(/<a[^>]*data-ig-channel="whatsapp"[^>]*>/g) ?? [];
    const brandedLinks = html.match(/<a[^>]*data-ig-channel="whatsapp"[^>]*><img class="channel-icon" src="\/images\/icons\/whatsapp\.svg" alt="" aria-hidden="true">/g) ?? [];

    assert.ok(whatsappLinks.length > 0, `${page} should contain a WhatsApp setup link`);
    assert.equal(brandedLinks.length, whatsappLinks.length);
  }
});

test('the WhatsApp icon is a compact green vector asset', () => {
  const icon = fs.readFileSync(new URL('../images/icons/whatsapp.svg', import.meta.url), 'utf8');

  assert.match(icon, /viewBox="0 0 24 24"/);
  assert.match(icon, /fill="#25D366"/);
  assert.match(icon, /<path/);
});

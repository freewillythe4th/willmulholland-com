import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSetupHelpUrl } from '../api/_setup-help.js';

test('WhatsApp setup links use the API send format with a simple prefilled message', () => {
  const result = buildSetupHelpUrl(
    'https://api.whatsapp.com/send/?phone=61439571922&type=phone_number&app_absent=0',
    'hero',
  );
  const url = new URL(result);
  assert.equal(url.hostname, 'api.whatsapp.com');
  assert.equal(url.pathname, '/send/');
  assert.equal(url.searchParams.get('phone'), '61439571922');
  assert.equal(url.searchParams.get('type'), 'phone_number');
  assert.equal(url.searchParams.get('app_absent'), '0');
  assert.equal(url.searchParams.get('text'), "Hey, I'd love to use Intelligent Growth. How do I get started?");
});

test('setup help rejects non-WhatsApp destinations and invalid phone numbers', () => {
  assert.equal(buildSetupHelpUrl('https://example.com/collect', 'hero'), null);
  assert.equal(buildSetupHelpUrl('https://api.whatsapp.com/send/?phone=not-a-number', 'hero'), null);
});

test('legacy wa.me setup links remain supported', () => {
  const result = buildSetupHelpUrl('https://wa.me/61439571922', 'setup');
  const url = new URL(result);
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/61439571922');
  assert.equal(url.searchParams.get('text'), "Hey, I'd love to use Intelligent Growth. How do I get started?");
});

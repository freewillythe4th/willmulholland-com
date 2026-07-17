import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const terms = fs.readFileSync(new URL('../terms.html', import.meta.url), 'utf8');
const privacy = fs.readFileSync(new URL('../privacy.html', import.meta.url), 'utf8');

test('terms cover hosted MCP access, protected methods, user context, billing, and consumer rights', () => {
  assert.match(terms, /hosted Intelligent Growth MCP/i);
  assert.match(terms, /protected methods/i);
  assert.match(terms, /You keep ownership of the context/i);
  assert.match(terms, /billing cadence, renewal, cancellation/i);
  assert.match(terms, /Australian Consumer Law/i);
  assert.match(terms, /ig-logo-full\.png/);
  assert.match(terms, /free MCP connection requires.*newsletter/i);
  assert.match(terms, /unsubscribe.*without losing.*free MCP access/i);
});

test('privacy explains task processing and the strict analytics boundary', () => {
  assert.match(privacy, /How task context is processed/i);
  assert.match(privacy, /AI model provider/i);
  assert.match(privacy, /Autocapture and session recording are disabled/i);
  assert.match(privacy, /do not receive prompts, outputs, email addresses, credentials/i);
  assert.match(privacy, /United States and Indonesia/i);
  assert.match(privacy, /ig-logo-full\.png/);
  assert.match(privacy, /free MCP connection/i);
  assert.match(privacy, /pseudonymous.*email/i);
  assert.match(privacy, /unsubscribe.*without losing.*free MCP access/i);
});

test('public policies contain no private provenance names', () => {
  assert.doesNotMatch(`${terms}\n${privacy}`, /sharebird|reforge|fletch|april|emma/i);
});

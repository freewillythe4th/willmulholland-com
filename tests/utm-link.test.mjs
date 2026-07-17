import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTrackedUrl } from '../scripts/utm-link.mjs';

test('UTM builder creates a normalized LinkedIn campaign URL', () => {
  assert.equal(
    buildTrackedUrl({
      url: 'https://intelligentgrowth.app/mcp?old=kept&utm_source=remove-me',
      source: 'LinkedIn',
      medium: 'Organic Social',
      campaign: 'MCP Launch',
      content: 'Founder Post',
    }),
    'https://intelligentgrowth.app/mcp?old=kept&utm_source=linkedin&utm_medium=organic_social&utm_campaign=mcp_launch&utm_content=founder_post',
  );
});

test('UTM builder requires source, medium, and campaign', () => {
  assert.throws(
    () => buildTrackedUrl({ url: 'https://intelligentgrowth.app/mcp', source: 'linkedin' }),
    /source, medium, and campaign are required/,
  );
});

test('UTM builder rejects unknown mediums to prevent reporting drift', () => {
  assert.throws(
    () => buildTrackedUrl({
      url: 'https://intelligentgrowth.app/mcp',
      source: 'linkedin',
      medium: 'social',
      campaign: 'mcp_launch',
    }),
    /Unknown medium/,
  );
});

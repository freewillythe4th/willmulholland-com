import test from 'node:test';
import assert from 'node:assert/strict';

import { safeAttribution } from '../api/_attribution.js';

test('API attribution accepts only normalized standard campaign fields', () => {
  assert.deepEqual(
    safeAttribution({
      utm_source: 'LinkedIn',
      utm_medium: 'Organic Social',
      utm_campaign: 'MCP Launch!',
      utm_content: '<script>alert(1)</script>',
      email: 'private@example.com',
      gclid: 'do-not-copy',
    }),
    {
      utm_source: 'linkedin',
      utm_medium: 'organic_social',
      utm_campaign: 'mcp_launch',
      utm_content: 'script_alert_1_script',
    },
  );
});

test('API attribution falls back to the form defaults', () => {
  assert.deepEqual(
    safeAttribution({}, {
      utm_source: 'intelligentgrowth_app',
      utm_medium: 'website_form',
      utm_campaign: 'always_on',
    }),
    {
      utm_source: 'intelligentgrowth_app',
      utm_medium: 'website_form',
      utm_campaign: 'always_on',
    },
  );
});

test('API attribution truncates untrusted values', () => {
  const result = safeAttribution({ utm_source: 'a'.repeat(200) });
  assert.equal(result.utm_source.length, 100);
  assert.deepEqual(safeAttribution({ utm_content: 'person@example.com' }), {});
});

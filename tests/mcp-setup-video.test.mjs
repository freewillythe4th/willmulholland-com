import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const setupPage = fs.readFileSync(new URL('../mcp-start.html', import.meta.url), 'utf8');
const setupScript = fs.readFileSync(new URL('../js/mcp-start.js', import.meta.url), 'utf8');
const stylesheet = fs.readFileSync(new URL('../css/mcp-funnel.css', import.meta.url), 'utf8');

test('Claude Desktop setup keeps the normal connector path and offers the direct config fallback', () => {
  const claudeInstruction = setupPage.indexOf('data-instruction="claude_desktop"');
  const starterPrompt = setupPage.indexOf('id="prompt-box"');

  assert.ok(claudeInstruction >= 0);
  assert.ok(starterPrompt > claudeInstruction);
  assert.match(setupPage, /Use this first if Add custom connector is available/i);
  assert.match(setupPage, /Customize &gt; Connectors/);
  assert.match(setupPage, /https:\/\/mcp\.intelligentgrowth\.app\/mcp/);
  assert.match(setupPage, /Can.t add a custom connector\?/i);
  assert.match(setupPage, /Team or Enterprise workspace/i);
  assert.match(setupPage, /Owner or Primary Owner.*organisation policy/is);
  assert.match(setupPage, /allows connectors configured on your computer/i);
  assert.match(setupPage, /blocked too.*workspace admin/is);
  assert.match(setupPage, /curl -sL https:\/\/intelligentgrowth\.app\/install \| sh/);
  assert.match(setupPage, /irm https:\/\/intelligentgrowth\.app\/install\.ps1 \| iex/);
  assert.match(setupPage, /claude_desktop_config\.json/);
  assert.match(setupPage, /four steps/i);
  assert.match(setupPage, /complete the browser sign-in/i);
  assert.match(setupPage, /return to Terminal or PowerShell/i);
  assert.match(setupPage, /Message Will on WhatsApp.*jump on a short onboarding call/is);
  assert.doesNotMatch(setupPage, /(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)\d+/i);
  assert.doesNotMatch(setupPage, /access[_-]?token|api[_-]?key|client_secret/i);
});

test('setup can copy the platform-specific Windows command', () => {
  assert.match(setupScript, /button\.dataset\.copyValue \|\| connectionValueFor\(client\)/);
  assert.match(setupScript, /button\.dataset\.copyLabel/);
  assert.match(stylesheet, /\.copy-row\s*\{/);
});

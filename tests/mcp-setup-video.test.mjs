import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const setupPage = fs.readFileSync(new URL('../mcp-start.html', import.meta.url), 'utf8');
const setupScript = fs.readFileSync(new URL('../js/mcp-start.js', import.meta.url), 'utf8');
const stylesheet = fs.readFileSync(new URL('../css/mcp-funnel.css', import.meta.url), 'utf8');

test('Claude Desktop setup uses direct config installers before the starter prompt', () => {
  const claudeInstruction = setupPage.indexOf('data-instruction="claude_desktop"');
  const starterPrompt = setupPage.indexOf('id="prompt-box"');

  assert.ok(claudeInstruction >= 0);
  assert.ok(starterPrompt > claudeInstruction);
  assert.match(setupPage, /curl -sL https:\/\/intelligentgrowth\.app\/install \| sh/);
  assert.match(setupPage, /irm https:\/\/intelligentgrowth\.app\/install\.ps1 \| iex/);
  assert.match(setupPage, /claude_desktop_config\.json/);
  assert.doesNotMatch(setupPage, /Add custom connector/);
});

test('setup can copy the platform-specific Windows command', () => {
  assert.match(setupScript, /button\.dataset\.copyValue \|\| connectionValueFor\(client\)/);
  assert.match(stylesheet, /\.copy-row\s*\{/);
});

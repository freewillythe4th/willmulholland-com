import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../mcp.html', import.meta.url), 'utf8');

test('MCP product page owns the product marketing MCP category', () => {
  assert.match(page, /<title>Product Marketing MCP Server for Claude and ChatGPT \| Intelligent Growth<\/title>/);
  assert.match(page, /<meta name="description" content="Product marketing MCP for positioning, messaging, competitive analysis and launch planning in Claude and ChatGPT\./);
  assert.match(page, /Product Marketing MCP Server/);
});

test('MCP product page publishes accurate software structured data', () => {
  assert.match(page, /<script type="application\/ld\+json">/);
  assert.match(page, /"@type": "SoftwareApplication"/);
  assert.match(page, /"applicationCategory": "BusinessApplication"/);
  assert.match(page, /"url": "https:\/\/intelligentgrowth\.app\/mcp"/);
});

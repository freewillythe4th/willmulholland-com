import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('robots points crawlers to the canonical sitemap', () => {
  const robots = fs.readFileSync(new URL('../robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/intelligentgrowth\.app\/sitemap\.xml/);
});

test('sitemap includes the product and every indexable MCP job page', () => {
  const sitemap = fs.readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const path of [
    '/mcp',
    '/mcp/competitive-gap',
    '/mcp/positioning-review',
    '/mcp/messaging-review',
    '/mcp/launch-brief',
    '/blog/ai-competitive-analysis-for-product-marketers',
    '/blog/how-to-write-positioning-with-ai',
    '/blog/how-to-use-ai-for-a-product-launch',
  ]) {
    assert.match(sitemap, new RegExp(`<loc>https://intelligentgrowth\\.app${path}</loc>`));
  }
});

test('MCP page publishes a dedicated high-resolution social card', () => {
  const html = fs.readFileSync(new URL('../mcp.html', import.meta.url), 'utf8');
  const image = fs.readFileSync(new URL('../images/og/mcp-share-card.png', import.meta.url));

  assert.match(html, /<meta property="og:image" content="https:\/\/intelligentgrowth\.app\/images\/og\/mcp-share-card\.png">/);
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta property="og:image:alt" content="Intelligent Growth product marketing MCP server">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/intelligentgrowth\.app\/images\/og\/mcp-share-card\.png">/);

  assert.equal(image.toString('ascii', 1, 4), 'PNG');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

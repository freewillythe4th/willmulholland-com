import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const guides = [
  {
    slug: 'ai-competitive-analysis-for-product-marketers',
    keyword: 'AI competitive analysis for product marketers',
    job: 'competitive_gap',
  },
  {
    slug: 'how-to-write-positioning-with-ai',
    keyword: 'how to write positioning with AI',
    job: 'positioning_diagnosis',
  },
  {
    slug: 'how-to-use-ai-for-a-product-launch',
    keyword: 'how to use AI for a product launch',
    job: 'launch_brief',
  },
];

for (const guide of guides) {
  test(`${guide.slug} is an indexable, tracked and branded guide`, () => {
    const html = fs.readFileSync(new URL(`../blog/${guide.slug}.html`, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://intelligentgrowth\\.app/blog/${guide.slug}">`));
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /src="\/images\/ig-logo\/ig-logo-full\.png"/);
    assert.match(html, /<script type="module" src="\/js\/analytics\.js"><\/script>/);
    assert.match(html, /data-ig-event="mcp_content_cta_clicked"/);
    assert.match(html, new RegExp(`data-ig-job="${guide.job}"`));
    assert.match(html, /data-ig-placement="article_cta"/);
    assert.match(html, new RegExp(guide.keyword, 'i'));
    assert.doesNotMatch(html, /[\u2013\u2014]/);
    assert.doesNotMatch(html, /\b(?:Fletch|Reforge|Sharebird)\b/i);
  });
}

test('blog index links to all three product marketing guides', () => {
  const html = fs.readFileSync(new URL('../blog.html', import.meta.url), 'utf8');
  for (const guide of guides) {
    assert.match(html, new RegExp(`href="/blog/${guide.slug}"`));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { JOB_PAGE_SLUGS, renderJobPage } from '../api/_mcp-job-page.js';

test('each search job has a distinct, indexable page and activation path', () => {
  assert.deepEqual(JOB_PAGE_SLUGS, ['competitive-gap', 'positioning-review', 'messaging-review', 'launch-brief']);

  for (const slug of JOB_PAGE_SLUGS) {
    const page = renderJobPage(slug);
    assert.match(page, new RegExp(`<link rel="canonical" href="https://intelligentgrowth.app/mcp/${slug}">`));
    assert.match(page, /\/images\/ig-logo\/ig-logo-full\.png/);
    assert.match(page, /\/js\/analytics\.js/);
    assert.match(page, /data-ig-event="mcp_start_clicked"/);
    assert.match(page, /What you bring/);
    assert.match(page, /What comes back/);
  }
});

test('job pages fail closed for unknown slugs and do not expose private provenance', () => {
  assert.equal(renderJobPage('unknown'), null);
  const pages = JOB_PAGE_SLUGS.map(renderJobPage).join('\n');
  assert.doesNotMatch(pages, /sharebird|reforge|fletch|source material|private prompt|provider prompt/i);
});

test('positioning page leads with the free diagnosis and keeps the member review distinct', () => {
  const page = renderJobPage('positioning-review');
  assert.match(page, /Free positioning diagnosis/i);
  assert.match(page, /Find what your positioning currently communicates/i);
  assert.match(page, /\/mcp\/start\?job=positioning_diagnosis/);
  assert.match(page, /Diagnose my positioning/);
  assert.match(page, /Current market frame/);
  assert.match(page, /Biggest positioning risk/);
  assert.match(page, /Likely buyer alternative/);
  assert.match(page, /Missing evidence/);
  assert.match(page, /Next research action/);
  assert.match(page, /not a final positioning decision/i);
  assert.match(page, /Full positioning review/i);
  assert.match(page, /Member workflow/i);
  assert.match(page, /\/mcp\/start\?job=positioning/);
  assert.match(page, /Final market-frame recommendation/i);
  assert.match(page, /Completed positioning brief/i);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const page = fs.readFileSync(new URL('../mcp.html', import.meta.url), 'utf8');

function sectionBetween(start, end) {
  const startIndex = page.indexOf(start);
  const endIndex = page.indexOf(end, startIndex);
  assert.notEqual(startIndex, -1, `Missing section start: ${start}`);
  assert.notEqual(endIndex, -1, `Missing section end: ${end}`);
  return page.slice(startIndex, endIndex);
}

test('the OS pricing card offers a seven-day trial with clear conversion terms', () => {
  const memberCard = sectionBetween(
    '<article class="price-card price-card--member">',
    '</article>',
  );

  assert.match(memberCard, /7-day free trial/i);
  assert.match(memberCard, /every paid method/i);
  assert.match(memberCard, /becomes A\$49 a month unless you cancel/i);
  assert.match(memberCard, /A\$490 a year/i);
  assert.match(memberCard, /data-ig-event="mcp_trial_clicked"/);
  assert.match(memberCard, /data-ig-billing-interval="monthly"/);
  assert.match(memberCard, />Start 7-day free trial<\/a>/);
});

test('the free plan remains separate from the paid OS trial', () => {
  const freeCard = sectionBetween(
    '<article class="price-card">',
    '<article class="price-card price-card--member">',
  );

  assert.doesNotMatch(freeCard, /7-day free trial/i);
  assert.match(freeCard, /Free positioning diagnosis/);
  assert.match(freeCard, /Free competitive gap/);
});

test('the FAQ explains card, conversion, access and cancellation', () => {
  assert.match(page, /<summary>How does the 7-day free trial work\?<\/summary>/);
  assert.match(page, /Intelligent Growth OS is the membership for the complete Connector/i);
  assert.match(page, /use every paid method for seven days/i);
  assert.match(page, /payment card/i);
  assert.match(page, /converts to A\$49 a month/i);
  assert.match(page, /annual option remains A\$490/i);
  assert.match(page, /cancel before the trial ends/i);
});

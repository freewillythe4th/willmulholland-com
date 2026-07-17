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

test('the general free entry point leads with the positioning diagnosis', () => {
  const hero = sectionBetween('<header class="hero">', '</header>');
  assert.match(hero, /href="\/mcp\/start\?job=positioning_diagnosis"[^>]*data-ig-job="positioning_diagnosis"[^>]*>Run the free positioning diagnosis<\/a>/);
  assert.match(page, /Two free starts: positioning diagnosis and competitive gap\./);

  for (const placement of ['navigation', 'proof', 'pricing', 'setup', 'footer']) {
    assert.match(
      page,
      new RegExp(`href="\\/mcp\\/start\\?job=positioning_diagnosis"[^>]*data-ig-job="positioning_diagnosis"[^>]*data-ig-placement="${placement}"`),
    );
  }
});

test('competitive gap remains a distinct free alternative', () => {
  const hero = sectionBetween('<header class="hero">', '</header>');
  assert.match(hero, /href="\/mcp\/start\?job=competitive-gap"[^>]*data-ig-job="competitive-gap"[^>]*>Find a competitive gap<\/a>/);

  const freeCard = sectionBetween('<article class="price-card">', '<article class="price-card price-card--member">');
  assert.match(freeCard, /Free positioning diagnosis/);
  assert.match(freeCard, /Free competitive gap/);
  assert.match(freeCard, /href="\/mcp\/start\?job=competitive-gap"/);
});

test('the free positioning card promises a diagnosis, not the member recommendation', () => {
  const positioningCard = sectionBetween('01 / Positioning', '02 / Messaging');
  assert.match(positioningCard, /Free positioning diagnosis/);
  assert.match(positioningCard, /current market frame/i);
  assert.match(positioningCard, /biggest positioning risk/i);
  assert.match(positioningCard, /missing evidence/i);
  assert.match(positioningCard, /next research action/i);
  assert.doesNotMatch(positioningCard, /differentiated value|recommended market frame|full positioning recommendation/i);
  assert.match(positioningCard, /href="\/mcp\/start\?job=positioning_diagnosis"/);
});

test('the page answers exactly what free access includes', () => {
  assert.match(page, /<summary>What can I use for free\?<\/summary>/);
  assert.match(page, /positioning diagnosis and the competitive gap workflow/i);
  assert.match(page, /full positioning recommendation/i);
  assert.match(page, /requires membership/i);
});

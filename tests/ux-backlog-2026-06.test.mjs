import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// UWR-030. A line reading "open: see (workshop hero, thesis end-CTA, scroll-spy
// dock, mobile nav)" was repeated verbatim into every daily memory file from
// 2026-06-04 to 2026-07-20, and got read as four tracked UX defects. Three of
// the four were already built and live. These pin them so the misreading cannot
// happen again by silent regression. The fourth, the scroll-spy dock, does not
// exist anywhere in this repository and is a design decision, not a bug.

const read = (name) => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

test('the workshop page has a hero with its tag, subhead and call to action', () => {
  const html = read('workshop.html');

  assert.match(html, /\.hero-tag\s*\{/);
  assert.match(html, /\.hero-sub\s*\{/);
  assert.match(html, /\.hero-cta\s*\{/);
  assert.match(html, /class="hero-top"/);
});

test('the mobile nav toggle exists and only shows inside a media query', () => {
  for (const page of ['index.html', 'workshop.html']) {
    const html = read(page);

    assert.match(html, /class="nav-toggle"/, `${page} has no nav toggle`);
    assert.match(html, /\.nav-toggle-bar\s*\{/, `${page} has no toggle bars`);
    assert.match(html, /@media[^{]*\{[\s\S]*?\.nav-toggle\s*\{\s*display:\s*block/, `${page} shows the toggle outside a media query`);
  }
});

test('the open mobile menu keeps the logo and subscribe pill visible', () => {
  // Shipped 2026-06-04: on the black overlay the dark logo and dark pill were
  // invisible. The inversion is the fix and must not be dropped.
  const html = read('index.html');

  assert.match(html, /body\.nav-open \.nav-logo/);
  assert.match(html, /body\.nav-open \.nav-logo \.logo-word \{ filter: brightness\(0\) invert\(1\); \}/);
});

test('the thesis has an end call to action on the augmented page and in its footer', () => {
  const html = read('augmented.html');

  assert.match(html, /Read the thesis: the Marketing Brain/);
  assert.match(html, /<section class="cta" id="contact">/);
  assert.match(html, /<footer>[\s\S]*?href="\/system"[\s\S]*?<\/footer>/);
});

test('no scroll-spy dock is claimed anywhere, because none was ever built', () => {
  // Guards the honest state. If someone builds one, this test should be
  // rewritten to describe it rather than deleted quietly.
  for (const page of ['index.html', 'workshop.html', 'augmented.html', 'system.html']) {
    assert.doesNotMatch(read(page), /scroll-?spy/i, `${page} mentions a scroll-spy`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const brain = readFileSync(new URL('../brain.html', import.meta.url), 'utf8');
const subscribeApi = readFileSync(new URL('../api/subscribe.js', import.meta.url), 'utf8');
const workshopApi = readFileSync(new URL('../api/workshop-register.js', import.meta.url), 'utf8');

// The launch post lives in the second-brain vault, outside this repo. It is the
// public copy that has to agree with the page, so it is checked here when
// present and skipped on a machine that does not have the vault.
const postPath = `${process.env.HOME}/second-brain/3-Resources/LinkedIn-Pipeline/drafts/2026-08-13-brain-free-founding-cohort-launch.md`;
let post = '';
try {
  post = readFileSync(postPath, 'utf8');
} catch {
  post = '';
}

// The hero is the whole argument: a visitor has to know inside five seconds that
// this is a free live cohort, who it is for, and what they walk away with.
// Everything below <main> only. Slicing on a bare class name would match the
// CSS rule in <head> first and silently scan the wrong region.
const body = brain.slice(brain.indexOf('<main>'));
const section = (open, close = '</section>') => {
  const start = body.indexOf(open);
  assert.notEqual(start, -1, `markup not found: ${open}`);
  const end = body.indexOf(close, start);
  assert.notEqual(end, -1, `no ${close} after ${open}`);
  return body.slice(start, end);
};

const hero = section('<section class="hero">');

// The three places a price would live if this cohort had one. The career proof
// numbers in the sections between them ($180M launched at eBay) are a different
// claim entirely, so they are deliberately outside this scan.
// None of these three contain a nested <section>, so the first </section>
// really is their own closing tag. Asserted below so a future nested section
// cannot silently widen the scan.
const offerStrip = section('<section class="offer-strip"');
const offerSection = section('<section class="section" id="offer">');
const joinSection = section('<section class="join" id="join">');
for (const [name, slice] of [['offer strip', offerStrip], ['offer', offerSection], ['join', joinSection]]) {
  assert.equal(slice.match(/<section/g).length, 1, `${name} gained a nested section, the slice boundary is now wrong`);
}
const priceSurfaces = `${offerStrip}\n${offerSection}\n${joinSection}`;

test('the hero says free, live, and cohort before anything else', () => {
  assert.match(hero, /Free live cohort/);
  assert.match(hero, /cohort free/);
  assert.match(hero, /Four weeks, live and online/);
  assert.match(hero, /Free for the founding cohort/);
});

test('the hero action is registering interest, not buying or applying', () => {
  assert.match(hero, /Register your interest/);
  assert.doesNotMatch(hero, /\bApply\b/);
  assert.doesNotMatch(hero, /Join the founding cohort/);
});

test('no page copy asks for money or implies a price', () => {
  assert.doesNotMatch(brain, /Founding price/);
  assert.doesNotMatch(brain, /What you are buying/);
  assert.doesNotMatch(brain, /checkout|Buy now|Pay now|card details|Stripe/i);
  assert.match(brain, /No payment, no card/);

  // A currency amount on the offer strip, the offer card, or the form itself
  // would read as a price.
  assert.doesNotMatch(priceSurfaces, /A?\$\s?\d/);
  assert.doesNotMatch(priceSurfaces, /\bper (month|seat|person)\b/i);
});

test('the offer strip carries the founding round exchange', () => {
  assert.match(brain, /What it costs[\s\S]{0,120}Nothing\. The first cohort is free\./);
  assert.match(brain, /What I ask back[\s\S]{0,120}Honest feedback while we build it\./);
});

test('why it is free is explained, and testimonial consent stays optional', () => {
  assert.match(brain, /Why the first one is free/);
  assert.match(brain, /I will ask you then/);
  assert.match(brain, /the answer can be no/);
});

test('interest is open ended, with no seat cap and no announced dates', () => {
  assert.doesNotMatch(brain, /seats? (left|remaining|available)/i);
  assert.doesNotMatch(brain, /only \d+ (spots?|seats?|places?)/i);
  assert.doesNotMatch(brain, /sold out|closing soon|last chance/i);
  assert.match(brain, /Dates are not set yet/);
});

test('the form collects an email plus one high signal question', () => {
  assert.match(brain, /<form class="join-form" id="joinForm">/);
  assert.match(brain, /<input id="joinEmail" name="email" type="email"[^>]*required>/);
  assert.match(brain, /<select id="joinJob" name="job" required>/);
  assert.match(brain, /Turning customer or sales calls into insights/);
  assert.match(brain, /Watching what competitors are doing/);
});

test('every form field is labelled for screen readers', () => {
  assert.match(brain, /<label for="joinEmail">/);
  assert.match(brain, /<label for="joinJob">/);
  assert.match(brain, /<label for="starterEmail">/);
});

test('the submission carries an explicit cohort tag and the job answer', () => {
  assert.match(brain, /source: 'brain_founding_cohort'/);
  assert.match(brain, /jobId: 'joinJob'/);
  assert.match(brain, /job \? \{ job: job \} : \{\}/);
});

test('a ?src= campaign cannot overwrite the cohort tag', () => {
  // The regression: campaignSource() spread last in Object.assign meant
  // /brain?src=anything replaced brain_founding_cohort and the registration
  // dropped out of the cohort segment.
  assert.match(brain, /source: config\.source \|\| campaign \|\| ''/);
  assert.match(brain, /campaign \? \{ utm_campaign: campaign \} : \{\}/);
  assert.doesNotMatch(brain, /job \? \{ job: job \} : \{\},\s*campaignSource\(\)/);
});

test('choosing "Something else" has to collect the actual job', () => {
  assert.match(brain, /<input id="joinOther"[^>]*maxlength="140"/);
  assert.match(brain, /<label for="joinOther">/);
  assert.match(brain, /if \(!other\) \{ otherInput\.focus\(\); return; \}/);
  assert.match(brain, /otherInput\.required = isOther;/);
});

test('registering re-subscribes an unsubscribed person, a passive signup does not', () => {
  // Otherwise the confirmation says "You are on the list" to someone who is not.
  assert.match(brain, /reactivate: true,/);
  assert.match(subscribeApi, /const reactivate = body\.reactivate === true;/);
  assert.match(subscribeApi, /reactivate_existing: reactivate,/);
  // The starter form must not opt in.
  const starterConfig = brain.slice(brain.indexOf("formId: 'starterForm'"), brain.indexOf("formId: 'joinForm'"));
  assert.doesNotMatch(starterConfig, /reactivate/);
});

test('the confirmation discloses the email course the signup also triggers', () => {
  assert.match(joinSection, /five day email course/);
});

test('no banned word reaches the copy this work added', () => {
  const added = [hero, offerStrip, offerSection, joinSection].join('\n');
  for (const word of ['unlock', 'leverage', 'seamless', 'supercharge', 'robust', 'streamline', 'empower', 'elevate', '10x', 'game-changer']) {
    assert.doesNotMatch(added, new RegExp(word, 'i'), `banned word present: ${word}`);
  }
  // "real" as a filler adjective, not the word inside "really" or a URL.
  assert.doesNotMatch(added, /\breal\b/i);
});

test('the confirmation state sets honest expectations', () => {
  assert.match(brain, /id="joinConfirm"[^>]*hidden/);
  assert.match(brain, /You are on the list\./);
  assert.match(brain, /There are no dates yet\./);
  assert.match(brain, /registering does not commit you to anything/);
});

test('the FAQ answers cost, catch, and commitment', () => {
  assert.match(brain, /<summary>What does the cohort cost\?<\/summary>/);
  assert.match(brain, /<summary>What is the catch\?<\/summary>/);
  assert.match(brain, /<summary>Does registering commit me to anything\?<\/summary>/);
});

test('the subscribe endpoint stores the job answer without breaking lead source', () => {
  assert.match(subscribeApi, /body\.job/);
  assert.match(subscribeApi, /name: 'Lead Source'/);
  assert.match(subscribeApi, /slice\(0, 200\)/);
});

test('the cohort answer does not collide with the workshop build vote', () => {
  // beehiiv custom fields are scalar. Sharing build_vote would have one answer
  // overwrite the other for anyone who did both the workshop and the cohort.
  assert.match(subscribeApi, /name: 'ig_focus'/);
  assert.doesNotMatch(subscribeApi, /name: 'build_vote'/);
  assert.match(workshopApi, /name: 'build_vote'/);
});

test('the job answer is stripped of formula and control characters', () => {
  assert.match(subscribeApi, /\\u0000-\\u001F/);
  assert.match(subscribeApi, /\^\[=\+\\-@\]\+/);
});

test('no em or en dashes, encoded or literal', () => {
  for (const [name, text] of [['brain.html', brain], ['subscribe.js', subscribeApi], ['the post draft', post]]) {
    assert.doesNotMatch(text, /[–—]/, `literal dash in ${name}`);
    assert.doesNotMatch(text, /&(mdash|ndash|#8211|#8212|#x201[34]);/i, `encoded dash in ${name}`);
  }
});

test('the LinkedIn post names a live cohort in its first line and stays a draft', { skip: post ? false : 'launch post not on this machine' }, () => {
  const firstLine = post.slice(post.indexOf('## POST THIS')).split('\n').filter(Boolean)[1];
  assert.match(firstLine, /free/i);
  assert.match(firstLine, /cohort|course/i);
  assert.match(firstLine, /live/i);
  assert.match(post, /DRAFT \/ NOT POSTED/);
  assert.doesNotMatch(post, /\bApply\b/);
});

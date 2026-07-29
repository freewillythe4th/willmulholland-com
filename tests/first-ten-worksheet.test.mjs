import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildClaudePrompt,
  buildStepPrompt,
  buildDesignPartnerOffer,
  buildOutreachMessage,
  createWorksheetId,
  normalizeWorksheet,
  resolveWorksheetId,
  storageKey,
} from '../js/first-ten-worksheet.mjs';

test('design partner offer preview keeps participant answers grammatical', () => {
  const offer = buildDesignPartnerOffer({
    offerTheyGet: 'I will give them direct access and a say in what gets built.',
    offerYouGet: 'Use it in their current workflow and meet each week',
    offerPrice: 'A $50 founding payment',
  });

  assert.equal(
    offer,
    'I am looking for five people to build this with.\nWhat you get: I will give them direct access and a say in what gets built.\nWhat I ask: Use it in their current workflow and meet each week\nFounding commitment: A $50 founding payment',
  );
});

test('worksheet storage is isolated by a random browser-only worksheet id', () => {
  const cryptoStub = { randomUUID: () => '11111111-2222-4333-8444-555555555555' };

  assert.equal(resolveWorksheetId('', cryptoStub), '11111111-2222-4333-8444-555555555555');
  assert.equal(resolveWorksheetId('#worksheet=existing_worksheet_123', cryptoStub), 'existing_worksheet_123');
  assert.notEqual(storageKey('worksheet_one'), storageKey('worksheet_two'));
});

test('worksheet ids reject unsafe or unbounded values', () => {
  assert.throws(() => storageKey('../another-user'));
  assert.throws(() => storageKey('short'));
  assert.equal(createWorksheetId({ randomUUID: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' }), 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
});

test('normalization keeps only known, bounded worksheet answers', () => {
  const worksheet = normalizeWorksheet({
    assumptionWho: ` Solo founders ${'x'.repeat(2000)} `,
    assumptionCost: ' Five hours a week ',
    unknown: 'must not survive',
  });

  assert.equal(worksheet.assumptionWho.length, 1200);
  assert.equal(worksheet.assumptionCost, 'Five hours a week');
  assert.equal('unknown' in worksheet, false);
});

test('Copy for Claude output is concise, useful, and limited to filled answers', () => {
  const prompt = buildClaudePrompt({
    assumptionWho: 'Solo founders launching a B2B product',
    assumptionCost: 'They lose a day each week chasing weak leads',
    conversationPerson: 'Sam, who is preparing a launch',
    momLastTime: 'Walk me through the last time you tried to find early customers.',
    offerTheyGet: 'Direct access and a say in what gets built',
    outreachSignal: 'You are preparing the first launch for Acme',
    outreachQuestion: 'Would you be open to comparing notes for 20 minutes?',
  });

  assert.match(prompt, /Identify the riskiest assumption/);
  assert.match(prompt, /^Help me get my first customers\./);
  assert.match(prompt, /Solo founders launching a B2B product/);
  assert.match(prompt, /Sam, who is preparing a launch/);
  assert.match(prompt, /Direct access and a say in what gets built/);
  assert.match(prompt, /Would you be open to comparing notes for 20 minutes\?/);
  assert.doesNotMatch(prompt, /Current alternative:/);
  assert.doesNotMatch(prompt, /\bMCP\b|\bConnector\b/);
});

test('a step copy includes the new answers and the earlier context, not later blank sections', () => {
  const prompt = buildStepPrompt({
    assumptionWho: 'Solo founders launching a B2B product',
    assumptionRiskiest: 'They will make time for a customer conversation this week',
    conversationPerson: 'Sam, who is preparing a launch',
    conversationPlace: 'Product Marketing Alliance',
    momLastTime: 'Walk me through the last time you tried to find early customers.',
  }, 1);

  assert.match(prompt, /Solo founders launching a B2B product/);
  assert.match(prompt, /Sam, who is preparing a launch/);
  assert.match(prompt, /Product Marketing Alliance/);
  assert.match(prompt, /first ten customer conversations/i);
  assert.match(prompt, /^Help me get my first customers\./);
  assert.doesNotMatch(prompt, /Walk me through the last time/);
  assert.doesNotMatch(prompt, /Design-partner offer/);
});

test('outreach builder produces a specific message without invented details', () => {
  const message = buildOutreachMessage({
    outreachName: 'Maya',
    outreachSignal: 'saw you are launching the first version of Atlas',
    outreachProduct: 'I am testing a faster way to turn customer calls into launch decisions',
    outreachCredibility: '',
    outreachQuestion: 'Would you be open to a quick chat about how you are handling it?',
  });

  assert.equal(
    message,
    'Hey Maya, saw you are launching the first version of Atlas. I am testing a faster way to turn customer calls into launch decisions. Would you be open to a quick chat about how you are handling it?',
  );
  assert.doesNotMatch(message, /undefined|null/);
});

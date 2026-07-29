import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSubmissionRecord,
  formatSubmissionCaption,
  safeWorksheetSubmission,
} from '../api/_first-ten-worksheet.js';

test('submission requires explicit consent and at least one worksheet answer', () => {
  assert.throws(
    () => safeWorksheetSubmission({ consent: false, answers: { assumptionWho: 'Founders' } }),
    /Consent required/,
  );
  assert.throws(
    () => safeWorksheetSubmission({ consent: true, answers: {} }),
    /At least one answer required/,
  );
});

test('submission keeps known bounded fields and optional participant details', () => {
  const result = safeWorksheetSubmission({
    consent: true,
    worksheetId: '11111111-2222-4333-8444-555555555555',
    name: ' Maya <script> ',
    email: 'maya@example.com',
    answers: {
      assumptionWho: `Founders ${'x'.repeat(2000)}`,
      conversationPlace: 'A local founder group',
      secret: 'drop this',
    },
  });

  assert.equal(result.name, 'Maya script');
  assert.equal(result.email, 'maya@example.com');
  assert.equal(result.answers.assumptionWho.length, 1200);
  assert.equal(result.answers.conversationPlace, 'A local founder group');
  assert.equal('secret' in result.answers, false);
});

test('submission rejects invalid optional email and unsafe worksheet ids', () => {
  assert.throws(
    () => safeWorksheetSubmission({
      consent: true,
      worksheetId: '11111111-2222-4333-8444-555555555555',
      email: 'not-an-email',
      answers: { assumptionWho: 'Founders' },
    }),
    /Valid email required/,
  );
  assert.throws(
    () => safeWorksheetSubmission({ consent: true, worksheetId: '../unsafe', answers: { assumptionWho: 'Founders' } }),
    /Invalid worksheet id/,
  );
});

test('structured record discloses the anonymous workshop-example consent', () => {
  const record = buildSubmissionRecord({
    consent: true,
    worksheetId: '11111111-2222-4333-8444-555555555555',
    answers: { assumptionWho: 'Solo founders' },
  }, new Date('2026-07-29T08:00:00.000Z'));

  assert.equal(record.schemaVersion, 1);
  assert.equal(record.submittedAt, '2026-07-29T08:00:00.000Z');
  assert.equal(record.participant.name, 'not provided');
  assert.equal(record.consent.anonymousWorkshopExamples, true);
  assert.equal(record.answers.assumptionWho, 'Solo founders');
});

test('Telegram caption is short and escapes participant text', () => {
  const caption = formatSubmissionCaption({
    name: '<Maya>',
    email: 'maya@example.com',
    answers: { assumptionWho: 'Solo founders', conversationPlace: 'A founder group' },
  });

  assert.match(caption, /New first ten customers worksheet/);
  assert.match(caption, /&lt;Maya&gt;/);
  assert.match(caption, /2 answers/);
  assert.ok(caption.length < 1024);
});

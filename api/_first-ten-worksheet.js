import { hasWorksheetAnswers, normalizeWorksheet } from '../js/first-ten-worksheet.mjs';

const SAFE_ID = /^[a-zA-Z0-9_-]{8,80}$/;

function safeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>/]/g, '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function safeWorksheetSubmission(input = {}) {
  if (input.consent !== true) throw new Error('Consent required');

  const answers = normalizeWorksheet(input.answers);
  if (!hasWorksheetAnswers(answers)) throw new Error('At least one answer required');

  const worksheetId = safeText(input.worksheetId, 80);
  if (!SAFE_ID.test(worksheetId)) throw new Error('Invalid worksheet id');

  const name = safeText(input.name, 80);
  const email = safeText(input.email, 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Valid email required');
  }

  return { worksheetId, name, email, answers };
}

export function buildSubmissionRecord(input = {}, now = new Date()) {
  const submission = safeWorksheetSubmission(input);
  return {
    schemaVersion: 1,
    submittedAt: now.toISOString(),
    worksheetId: submission.worksheetId,
    participant: {
      name: submission.name || 'not provided',
      email: submission.email || 'not provided',
    },
    consent: {
      sharedWithWill: true,
      anonymousWorkshopExamples: true,
      disclosure: 'The participant chose to share this worksheet with Will and agreed that answers may be used anonymously in workshop examples.',
    },
    answers: submission.answers,
  };
}

export function formatSubmissionCaption(submission = {}) {
  const answers = submission.answers || {};
  const answerCount = Object.values(answers).filter(Boolean).length;
  const name = submission.name || (submission.participant && submission.participant.name) || 'not provided';
  const email = submission.email || (submission.participant && submission.participant.email) || 'not provided';
  return [
    '<b>New first ten customers worksheet</b>',
    '',
    `Name: ${escapeHtml(name)}`,
    `Email: <code>${escapeHtml(email)}</code>`,
    `${answerCount} ${answerCount === 1 ? 'answer' : 'answers'} attached as JSON`,
    'Consent: shared with Will, anonymous workshop examples allowed',
  ].join('\n');
}

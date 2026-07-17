import test from 'node:test';
import assert from 'node:assert/strict';

import { safeSurveyFields } from '../api/_survey.js';

test('survey fields are bounded before they reach Beehiiv', () => {
  assert.deepEqual(
    safeSurveyFields({
      challenges: [' Pipeline growth ', '<b>Positioning</b>', ...Array(12).fill('extra')],
      companyStage: `Series A ${'x'.repeat(200)}`,
    }),
    {
      challenges: ['Pipeline growth', 'bPositioningb', ...Array(8).fill('extra')],
      companyStage: `Series A ${'x'.repeat(71)}`,
    },
  );
});

test('invalid survey field shapes become empty values', () => {
  assert.deepEqual(safeSurveyFields({ challenges: 'not-an-array', companyStage: {} }), {
    challenges: [],
    companyStage: '',
  });
});

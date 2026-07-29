export const WORKSHEET_VERSION = 1;

export const WORKSHEET_FIELDS = Object.freeze([
  'assumptionWho',
  'assumptionCost',
  'assumptionAlternative',
  'assumptionTrigger',
  'assumptionRiskiest',
  'conversationPerson',
  'conversationIntroducer',
  'conversationPlace',
  'momLastTime',
  'momCost',
  'momTried',
  'momCurrent',
  'momCommitment',
  'offerTheyGet',
  'offerYouGet',
  'offerPrice',
  'outreachName',
  'outreachSignal',
  'outreachProduct',
  'outreachCredibility',
  'outreachQuestion',
]);

const SAFE_ID = /^[a-zA-Z0-9_-]{8,80}$/;

function cleanText(value, maxLength = 1200) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function endSentence(value) {
  const text = cleanText(value, 1200);
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function createWorksheetId(cryptoLike = globalThis.crypto) {
  if (cryptoLike && typeof cryptoLike.randomUUID === 'function') {
    return cryptoLike.randomUUID();
  }

  if (cryptoLike && typeof cryptoLike.getRandomValues === 'function') {
    const values = new Uint8Array(16);
    cryptoLike.getRandomValues(values);
    values[6] = (values[6] & 0x0f) | 0x40;
    values[8] = (values[8] & 0x3f) | 0x80;
    const hex = [...values].map((value) => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error('Secure browser storage is unavailable');
}

export function resolveWorksheetId(hash = '', cryptoLike = globalThis.crypto) {
  const params = new URLSearchParams(String(hash).replace(/^#/, ''));
  const existing = params.get('worksheet') || '';
  return SAFE_ID.test(existing) ? existing : createWorksheetId(cryptoLike);
}

export function storageKey(worksheetId) {
  if (!SAFE_ID.test(worksheetId || '')) {
    throw new Error('Invalid worksheet id');
  }
  return `ig:first-ten:v${WORKSHEET_VERSION}:${worksheetId}`;
}

export function normalizeWorksheet(input = {}) {
  return Object.fromEntries(
    WORKSHEET_FIELDS.map((field) => [field, cleanText(input[field])]),
  );
}

export function hasWorksheetAnswers(input = {}) {
  return Object.values(normalizeWorksheet(input)).some(Boolean);
}

export function buildOutreachMessage(input = {}) {
  const worksheet = normalizeWorksheet(input);
  const greeting = worksheet.outreachName ? `Hey ${worksheet.outreachName},` : 'Hey,';
  return [
    greeting,
    endSentence(worksheet.outreachSignal),
    endSentence(worksheet.outreachProduct),
    endSentence(worksheet.outreachCredibility),
    endSentence(worksheet.outreachQuestion),
  ].filter(Boolean).join(' ');
}

function addSection(lines, title, entries) {
  const filled = entries.filter(([, value]) => value);
  if (!filled.length) return;
  lines.push('', title);
  for (const [label, value] of filled) lines.push(`- ${label}: ${value}`);
}

export function buildClaudePrompt(input = {}) {
  const worksheet = normalizeWorksheet(input);
  const outreach = buildOutreachMessage(worksheet);
  const lines = [
    'Help me turn this first-customer worksheet into a practical plan.',
    '',
    'Use only the evidence below. Do not invent people, results, relationships, or credibility. If something is missing, tell me what I still need to learn.',
    '',
    'Please:',
    '1. Identify the riskiest assumption and explain why in one sentence.',
    '2. Suggest three Mom Test follow-up questions for my first conversation.',
    '3. Tighten my design-partner offer so the exchange and commitment are clear.',
    '4. Rewrite my outreach message in plain language with one easy question.',
    '5. Give me the next three actions to take this week.',
  ];

  addSection(lines, 'Assumptions', [
    ['Who and urgency', worksheet.assumptionWho],
    ['Cost today', worksheet.assumptionCost],
    ['Current alternative', worksheet.assumptionAlternative],
    ['Commit or pay trigger', worksheet.assumptionTrigger],
    ['Riskiest assumption', worksheet.assumptionRiskiest],
  ]);

  addSection(lines, 'Route to the first ten conversations', [
    ['One person with the problem', worksheet.conversationPerson],
    ['One possible introducer', worksheet.conversationIntroducer],
    ['One place to find more', worksheet.conversationPlace],
  ]);

  addSection(lines, 'Mom Test prompts', [
    ['Last time it happened', worksheet.momLastTime],
    ['Cost in time or money', worksheet.momCost],
    ['What they tried', worksheet.momTried],
    ['What they use now', worksheet.momCurrent],
    ['Commitment to ask for', worksheet.momCommitment],
  ]);

  addSection(lines, 'Design-partner offer', [
    ['What they get', worksheet.offerTheyGet],
    ['What I ask from them', worksheet.offerYouGet],
    ['Founding price or commitment', worksheet.offerPrice],
  ]);

  addSection(lines, 'Outreach message builder', [
    ['Why them', worksheet.outreachSignal],
    ['What it does', worksheet.outreachProduct],
    ['Credibility I can prove', worksheet.outreachCredibility],
    ['Easy question', worksheet.outreachQuestion],
    ['Draft message', outreach],
  ]);

  return lines.join('\n').trim();
}

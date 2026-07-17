const ENDPOINT = 'https://mcp.intelligentgrowth.app/mcp';

const CLIENTS = new Set(['claude_desktop', 'claude_code', 'chatgpt', 'other']);
const JOBS = new Set(['competitive_gap', 'positioning_diagnosis', 'positioning', 'messaging', 'launch']);

const STARTER_PROMPTS = Object.freeze({
  competitive_gap: 'Use Intelligent Growth to run a competitive gap analysis for my product. Start by telling me the product context, customer evidence and competitor URLs you need. Do not begin the analysis until I have supplied the required context.',
  positioning_diagnosis: 'Use the Intelligent Growth tool ig_positioning_diagnosis to diagnose my current positioning. First collect the product, audience and use case, buyer alternative, current homepage copy, and any available customer evidence. If I only give you a URL, read the page with your own browsing capability and include the relevant copy in the tool context. If you cannot read it, ask me to paste the copy. Then call ig_positioning_diagnosis and return its focused diagnosis without turning it into a final positioning decision.',
  positioning: 'Use the Intelligent Growth tool pmm_positioning to run my full positioning review. Start by asking for the product, audience, alternatives, customer evidence, current homepage copy and business constraint. If I only give you a URL, read the page with your own browsing capability and include the relevant copy in the tool context. If you cannot read it, ask me to paste the copy. Then call pmm_positioning, recommend a direction, explain the reasoning and flag the proof that is missing.',
  messaging: 'Use Intelligent Growth to sharpen my messaging. Start by asking for the offer, audience, customer language, current message and available proof. Then produce a clear hierarchy I can review and improve.',
  launch: 'Use Intelligent Growth to plan this launch. Start by asking for the product change, audience, deadline, business goal, constraints and evidence. Then recommend the launch call, plan, stakeholder actions and measures that matter.',
});

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeClient(value) {
  const normalized = slug(value);
  return CLIENTS.has(normalized) ? normalized : 'other';
}

export function normalizeJob(value) {
  const normalized = slug(value);
  return JOBS.has(normalized) ? normalized : 'competitive_gap';
}

export function connectionValueFor(client) {
  return normalizeClient(client) === 'claude_code'
    ? `claude mcp add intelligent-growth --transport http ${ENDPOINT}`
    : ENDPOINT;
}

export function starterPromptFor(job) {
  return STARTER_PROMPTS[normalizeJob(job)];
}

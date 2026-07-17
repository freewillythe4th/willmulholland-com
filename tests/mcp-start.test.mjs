import test from 'node:test';
import assert from 'node:assert/strict';

import {
  connectionValueFor,
  normalizeClient,
  normalizeJob,
  starterPromptFor,
} from '../js/mcp-start-core.mjs';

test('setup accepts only supported clients and safe job slugs', () => {
  assert.equal(normalizeClient('Claude Desktop'), 'claude_desktop');
  assert.equal(normalizeClient('unknown client'), 'other');
  assert.equal(normalizeJob('competitive-gap'), 'competitive_gap');
  assert.equal(normalizeJob('positioning-diagnosis'), 'positioning_diagnosis');
  assert.equal(normalizeJob('reveal-private-method'), 'competitive_gap');
});

test('connection values contain only the public hosted endpoint', () => {
  assert.equal(connectionValueFor('claude_code'), 'claude mcp add intelligent-growth --transport http https://mcp.intelligentgrowth.app/mcp');
  assert.equal(connectionValueFor('chatgpt'), 'https://mcp.intelligentgrowth.app/mcp');
  assert.equal(connectionValueFor('other'), 'https://mcp.intelligentgrowth.app/mcp');
});

test('starter prompts ask for context without exposing private methods', () => {
  const prompt = starterPromptFor('competitive_gap');
  assert.match(prompt, /competitive gap/i);
  assert.match(prompt, /context/i);
  assert.doesNotMatch(prompt, /source material|private prompt|provider|reference library/i);
  assert.equal(starterPromptFor('not-real'), starterPromptFor('competitive_gap'));
});

test('positioning diagnosis prompt invokes the free tool and handles URLs honestly', () => {
  const prompt = starterPromptFor('positioning_diagnosis');
  assert.match(prompt, /ig_positioning_diagnosis/);
  assert.match(prompt, /product/i);
  assert.match(prompt, /audience/i);
  assert.match(prompt, /buyer alternative/i);
  assert.match(prompt, /homepage copy/i);
  assert.match(prompt, /evidence/i);
  assert.match(prompt, /If I only give you a URL/i);
  assert.match(prompt, /read the page/i);
  assert.match(prompt, /ask me to paste/i);
  assert.doesNotMatch(prompt, /pmm_positioning/);
});

test('member positioning prompt invokes the paid review without free-tier narration', () => {
  const prompt = starterPromptFor('positioning');
  assert.match(prompt, /pmm_positioning/);
  assert.doesNotMatch(prompt, /free tier|upgrade|free skill/i);
});

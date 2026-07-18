import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const page = fs.readFileSync(new URL('../mcp.html', import.meta.url), 'utf8');
const setupPage = fs.readFileSync(new URL('../mcp-start.html', import.meta.url), 'utf8');

test('the hero leads with product marketing skills Claude can run', () => {
  assert.match(page, /Give Claude 53 product marketing skills it can run on demand\./);
  assert.match(page, /53 maintained product marketing skills/i);
  assert.match(page, /asks for what is missing, runs the right skill and returns/i);
});

test('the page explains the skill, context and deliverable sequence', () => {
  assert.match(page, /asks for any missing company, customer and market context/i);
  assert.match(page, /selects and runs the right skill/i);
  assert.match(page, /recommendation, reasoning, assumptions and a deliverable/i);
});

test('generic contrast headings are removed', () => {
  assert.doesNotMatch(page, /Advice is cheap\. The useful bit is the work that comes back\./);
  assert.doesNotMatch(page, /Same brief\. Different kind of result\./);
  assert.doesNotMatch(page, /Claude is good\. A blank chat still makes you do too much of the work\./);
});

test('the pricing heading separates the free preview from the paid trial', () => {
  assert.match(page, /Try two jobs free\. Test the complete Connector for seven days\./);
  assert.match(page, /payment card is required/i);
  assert.match(page, /A\$49 a month unless you cancel/i);
});

test('the setup guide explains what is free and where to trial the complete Connector', () => {
  assert.match(setupPage, /The free Connector includes two jobs/i);
  assert.match(setupPage, /Intelligent Growth OS is the membership for complete access/i);
  assert.match(setupPage, /try it free for 7 days/i);
  assert.match(setupPage, /A\$49 a month unless you cancel/i);
  assert.match(setupPage, /data-ig-event="mcp_trial_clicked"/);
});

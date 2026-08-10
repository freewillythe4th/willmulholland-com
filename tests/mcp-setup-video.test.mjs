import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const setupPage = fs.readFileSync(new URL('../mcp-start.html', import.meta.url), 'utf8');
const setupScript = fs.readFileSync(new URL('../js/mcp-start.js', import.meta.url), 'utf8');
const stylesheet = fs.readFileSync(new URL('../css/mcp-funnel.css', import.meta.url), 'utf8');

test('Claude Desktop setup includes the guided setup video before the starter prompt', () => {
  const claudeInstruction = setupPage.indexOf('data-instruction="claude_desktop"');
  const setupVideo = setupPage.indexOf('id="claude-desktop-setup-video"');
  const starterPrompt = setupPage.indexOf('id="prompt-box"');

  assert.ok(claudeInstruction >= 0);
  assert.ok(setupVideo > claudeInstruction);
  assert.ok(starterPrompt > setupVideo);
  assert.match(setupPage, /<video[^>]*id="claude-desktop-setup-video"[^>]*controls[^>]*playsinline[^>]*preload="metadata"/s);
  assert.match(setupPage, /poster="\/images\/intelligent-growth\/connector-setup-poster\.jpg"/);
  assert.match(setupPage, /<source src="\/videos\/intelligent-growth-connector-setup\.mp4" type="video\/mp4">/);
  assert.match(setupPage, /<track[^>]*kind="captions"[^>]*src="\/videos\/intelligent-growth-connector-setup\.vtt"[^>]*default>/s);
});

test('setup video follows the funnel design and records safe playback milestones', () => {
  assert.match(stylesheet, /\.setup-video-card\s*\{/);
  assert.match(stylesheet, /\.setup-video-card video\s*\{/);
  assert.match(setupScript, /setup_video_started/);
  assert.match(setupScript, /setup_video_completed/);
});

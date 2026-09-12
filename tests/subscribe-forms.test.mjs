import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const formsByFile = {
  'index.html': ['heroSubscribe', 'ig-subscribe-form'],
  'preview-deck.html': ['heroSubscribe', 'ig-subscribe-form'],
  'preview-superpower.html': ['heroSubscribe', 'ig-subscribe-form'],
  'blog.html': ['ig-subscribe-form'],
  'workshop-confirmed.html': ['ig-subscribe-form'],
  'workshop.html': ['waitlistForm', 'recordingForm'],
  'podcast.html': ['guestForm', 'nlForm'],
  'traffic.html': ['captureForm'],
  'resources.html': ['everythingForm'],
  'brain.html': ['starterForm', 'joinForm'],
  'team-brain.html': ['team-brain-starter', 'team-brain-waitlist', 'team-brain-final'],
};
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

test('all HTML subscribe callers are included in the audited inventory', () => {
  const callers = readdirSync(root).filter(f => f.endsWith('.html') && read(f).includes("'/api/subscribe'"));
  assert.deepEqual(callers.sort(), Object.keys(formsByFile).sort());
});

for (const [file, ids] of Object.entries(formsByFile)) {
  test(`${file}: each signup form has one inaccessible, non-autofill trap`, () => {
    const forms = [...read(file).matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)];
    for (const id of ids) {
      const form = forms.find(m => m[1].includes(`="${id}"`));
      assert.ok(form, `missing ${id}`);
      const traps = [...form[2].matchAll(/<input\b[^>]*name="honeypot"[^>]*>/g)];
      assert.equal(traps.length, 1, id);
      for (const attribute of ['hidden', 'tabindex="-1"', 'aria-hidden="true"', 'autocomplete="off"']) {
        assert.ok(traps[0][0].includes(attribute), `${id}: ${attribute}`);
      }
      assert.doesNotMatch(traps[0][0], /\brequired\b|\bdisabled\b/);
    }
  });
  test(`${file}: every subscribe payload reads its own form trap without altering email`, () => {
    const source = read(file);
    const fetchCount = [...source.matchAll(/igSignup\.submit\([^,]+, '\/api\/subscribe'/g)].length;
    const payloads = [...source.matchAll(/\{\s*email:\s*email,\s*honeypot:\s*([^,}]+)[,}]/g)];
    assert.equal(payloads.length, fetchCount);
    for (const [, expression] of payloads) {
      for (const value of ['', 'bot-filled-value']) {
        const form = { querySelector(selector) {
          assert.equal(selector, '[name="honeypot"]');
          return { value };
        } };
        assert.equal(vm.runInNewContext(expression, { form, f: form }), value);
      }
    }
    assert.doesNotMatch(source, /(?:window|globalThis)\.fetch\s*=/);
  });
}

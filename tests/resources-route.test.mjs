import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const routes = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).routes;

function routeFor(source) {
  return routes.find((route) => route.src === source);
}

test('resources is the canonical post-session route', () => {
  assert.deepEqual(routeFor('/resources'), {
    src: '/resources',
    dest: '/resources.html',
  });

  const page = fs.readFileSync(new URL('../resources.html', import.meta.url), 'utf8');
  assert.match(page, /<link rel="canonical" href="https:\/\/intelligentgrowth\.app\/resources">/);
});

test('legacy session routes redirect to resources', () => {
  assert.deepEqual(routeFor('/everything'), {
    src: '/everything',
    status: 307,
    headers: { Location: '/resources' },
  });

  assert.deepEqual(routeFor('/pma'), {
    src: '/pma',
    status: 307,
    headers: { Location: '/resources?src=pma_summit' },
  });
});

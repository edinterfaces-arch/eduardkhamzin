import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { profile, projects, demo } from '../src/content.js';

test('all external profile and project destinations are reserved placeholders', () => {
  const links = [profile.companyUrl, profile.socialUrl, ...projects.map(p => p.href)];
  for (const link of links) assert.equal(new URL(link).hostname, 'example.com');
  assert.equal(profile.email, 'hello@example.com');
  assert.equal(profile.name, 'Your Name');
  assert.equal(profile.location, 'Your City');
  assert.equal(demo.visitors.length, 3);
});

test('rendered source and metadata contain no original identifying information or tracking', async () => {
  const names = await readdir(new URL('../src', import.meta.url));
  const source = (await Promise.all(names.filter(n => /\.(js|jsx|css)$/.test(n)).map(n => readFile(new URL(`../src/${n}`, import.meta.url), 'utf8')))).join('\n') + await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const forbidden = ['eduardo', 'alba', 'khamzin', 'recura', 'filmhunch', 'minivo', 'smart find', 'new york', 'gmail.com'];
  for (const word of forbidden) assert.ok(!source.toLowerCase().includes(word), `Found identifying information: ${word}`);
  assert.ok(!/new WebSocket|navigator\.geolocation|localStorage|analytics\.js|googletagmanager/.test(source));
});

test('placeholder media is local and exists', async () => {
  for (const path of [profile.photo, ...projects.map(p => p.image)]) {
    assert.ok(path.startsWith('/images/'));
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  }
});

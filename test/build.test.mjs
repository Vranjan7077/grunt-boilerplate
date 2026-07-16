import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

// Real build validation, not mocked Grunt internals: runs a full
// production build against the boilerplate's own sample content and
// asserts on what actually landed in dist/.
test('production build', async (t) => {
  execSync('npx grunt build --env=production', { cwd: root, stdio: 'inherit' });

  await t.test('emits index.html and patterns.html', () => {
    assert.ok(existsSync(path.join(dist, 'index.html')));
    assert.ok(existsSync(path.join(dist, 'patterns.html')));
  });

  await t.test('rev-manifest.json is well-formed and non-empty', () => {
    const manifest = JSON.parse(readFileSync(path.join(dist, 'rev-manifest.json'), 'utf8'));
    assert.ok(Object.keys(manifest).length > 0);
  });

  await t.test('hashed CSS and JS files exist on disk', () => {
    const cssFiles = readdirSync(path.join(dist, 'css'));
    const jsFiles = readdirSync(path.join(dist, 'js'));
    assert.ok(cssFiles.some((file) => /^main\.[0-9a-f]{8}\.css$/.test(file)));
    assert.ok(jsFiles.some((file) => /^main\.[0-9a-f]{8}\.js$/.test(file)));
  });

  await t.test('index.html references the hashed filenames from the manifest', () => {
    const manifest = JSON.parse(readFileSync(path.join(dist, 'rev-manifest.json'), 'utf8'));
    const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
    const hashedCss = manifest['/css/main.css'].split('/').pop();
    const hashedJs = manifest['/js/main.js'].split('/').pop();
    assert.ok(html.includes(hashedCss), `expected index.html to reference ${hashedCss}`);
    assert.ok(html.includes(hashedJs), `expected index.html to reference ${hashedJs}`);
  });

  await t.test('production output is minified', () => {
    const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
    assert.ok(!html.includes('\n  '), 'expected collapsed whitespace from htmlmin');
  });

  await t.test('pre-compressed gzip/brotli siblings exist', () => {
    const indexHtml = path.join(dist, 'index.html');
    assert.ok(existsSync(`${indexHtml}.gz`));
    assert.ok(existsSync(`${indexHtml}.br`));
  });
});

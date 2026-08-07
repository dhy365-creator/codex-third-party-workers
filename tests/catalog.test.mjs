import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acquireCatalog,
  catalogIsSafe,
  extractCatalogFromScript,
} from '../src/catalog.mjs';

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'catalog.json');

test('reduces a local catalog to DeepSeek V4 Flash', async () => {
  const result = await acquireCatalog({ source: fixture });
  assert.equal(result.fetched, false);
  assert.equal(result.catalog.models.length, 1);
  assert.equal(result.catalog.models[0].slug, 'deepseek-v4-flash');
  assert.equal(catalogIsSafe(result.catalog), true);
  assert.doesNotMatch(JSON.stringify(result.catalog), /deepseek-v4-pro/i);
});

test('extracts only the inert official heredoc and never executes it', async () => {
  const json = await fs.readFile(fixture, 'utf8');
  const script = [
    '#!/bin/sh',
    'touch /tmp/this-must-never-run',
    'cat > "$TMP_MODELS" <<\'CODEX_MODELS_JSON\'',
    json.trim(),
    'CODEX_MODELS_JSON',
  ].join('\n');
  const reduced = extractCatalogFromScript(script);
  assert.equal(reduced.models.length, 1);
  assert.equal(reduced.models[0].slug, 'deepseek-v4-flash');
});

test('rejects a Pro-only catalog and oversized sources', () => {
  assert.throws(
    () => extractCatalogFromScript(JSON.stringify({ models: [{ slug: 'deepseek-v4-pro' }] })),
    /V4 Pro is not supported/,
  );
  assert.throws(() => extractCatalogFromScript('x'.repeat(2 * 1024 * 1024 + 1)), /size limit/);
});

test('accepts only an official HTTPS DeepSeek host for automatic retrieval', async () => {
  await assert.rejects(
    acquireCatalog({ source: 'auto', setupScriptUrl: 'https://example.com/setup.sh', fetchImpl: async () => null }),
    /official deepseek\.com host/,
  );
});

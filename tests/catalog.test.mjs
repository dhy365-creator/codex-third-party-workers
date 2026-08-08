import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acquireCatalog,
  catalogIsSafe,
  extractCatalogFromScript,
  reduceCatalogForProvider,
} from '../src/catalog.mjs';
import { resolveProviderPack } from '../src/provider-packs.mjs';

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'catalog.json');
const providerPack = resolveProviderPack('deepseek');

test('reduces a local catalog to DeepSeek V4 Flash', async () => {
  const result = await acquireCatalog({
    source: fixture,
    reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
  });
  assert.equal(result.fetched, false);
  assert.equal(result.catalog.models.length, 1);
  assert.equal(result.catalog.models[0].slug, 'deepseek-v4-flash');
  assert.equal(catalogIsSafe(result.catalog, providerPack.catalog), true);
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
  assert.equal(reduced.models.length, 2);
  assert.equal(reduced.models[0].slug, 'deepseek-v4-flash');
});

test('rejects a Pro-only catalog when reduced by provider policy', () => {
  assert.throws(
    () => reduceCatalogForProvider({ models: [{ slug: 'deepseek-v4-pro' }] }, providerPack.catalog),
    /unsupported provider model variant/,
  );
});

test('oversized source is rejected', () => {
  assert.throws(() => extractCatalogFromScript('x'.repeat(2 * 1024 * 1024 + 1)), /size limit/);
});

test('reports failed catalog download for fetch errors', async () => {
  await assert.rejects(
    acquireCatalog({
      source: 'auto',
      setupScriptUrl: 'https://example.com/setup.sh',
      validateHost: (candidate) => candidate,
      reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
      fetchImpl: async () => ({ ok: false, status: 500 }),
    }),
    /catalog download failed/,
  );
});

test('accepts only an official HTTPS DeepSeek host at installer layer', async () => {
  const catalogSource = fixture;
  await assert.rejects(
    acquireCatalog({
      source: 'auto',
      setupScriptUrl: 'https://example.com/setup.sh',
      validateHost: (candidate) => {
        const url = new URL(candidate);
        if (url.protocol !== 'https:' || url.hostname !== 'setup.deepseek.com') {
          throw new Error('official setup script host is not allowed');
        }
        return candidate;
      },
      reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
      fetchImpl: async () => ({
        ok: true,
        headers: { get: () => String(2 * 1024 * 1024 + 1) },
        arrayBuffer: async () => Buffer.from(await fs.readFile(catalogSource)).buffer,
      }),
    }),
    /catalog source exceeds the size limit|official setup script host is not allowed|catalog download failed|catalog source is too/,
  );
});

test('requires a validator for automatic catalog acquisition', async () => {
  await assert.rejects(
    acquireCatalog({
      source: 'auto',
      setupScriptUrl: 'https://trusted.example.com/setup.sh',
      reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
      fetchImpl: async () => {
        throw new Error('network should not be called when validator is missing');
      },
    }),
    /catalog host validator is required/,
  );
});

test('rejects trusted-to-untrusted redirects during catalog acquisition', async () => {
  await assert.rejects(
    acquireCatalog({
      source: 'auto',
      setupScriptUrl: 'https://trusted.example.com/setup.sh',
      validateHost: (candidate) => {
        const url = new URL(candidate);
        if (!url.hostname.endsWith('.example.com')) {
          throw new Error('official setup script host is not allowed');
        }
        return candidate;
      },
      reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
      fetchImpl: async (requestedUrl) => {
        if (requestedUrl === 'https://trusted.example.com/setup.sh') {
          return {
            status: 302,
            headers: {
              get: (name) => (name === 'location' ? 'https://malicious.example.net/setup.sh' : null),
            },
            ok: false,
            arrayBuffer: async () => new ArrayBuffer(0),
          };
        }
        throw new Error(`unexpected fetch target: ${requestedUrl}`);
      },
    }),
    /official setup script host is not allowed|catalog redirect is missing Location header/,
  );
});

test('parses catalog after valid redirects and keeps final validated source URL', async () => {
  const catalogSource = fixture;
  const catalogBytes = await fs.readFile(catalogSource);
  const result = await acquireCatalog({
    source: 'auto',
    setupScriptUrl: 'https://trusted.example.com/setup.sh',
    validateHost: (candidate) => {
      const url = new URL(candidate);
      if (!url.hostname.endsWith('.example.com')) {
        throw new Error('official setup script host is not allowed');
      }
      return candidate;
    },
    reduce: (catalog) => reduceCatalogForProvider(catalog, providerPack.catalog),
    fetchImpl: async (requestedUrl) => {
      if (requestedUrl === 'https://trusted.example.com/setup.sh') {
        return {
          status: 302,
          headers: {
            get: () => 'https://mirror.example.com/setup.sh',
          },
          ok: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          url: requestedUrl,
        };
      }
      if (requestedUrl === 'https://mirror.example.com/setup.sh') {
        return {
          ok: true,
          status: 200,
          url: 'https://mirror.example.com/setup.sh',
          headers: {
            get: () => String(catalogBytes.length),
          },
          arrayBuffer: async () => catalogBytes.buffer.slice(
            catalogBytes.byteOffset,
            catalogBytes.byteOffset + catalogBytes.byteLength,
          ),
        };
      }
      throw new Error(`unexpected fetch target: ${requestedUrl}`);
    },
  });
  assert.equal(result.fetched, true);
  assert.equal(result.source, 'https://mirror.example.com/setup.sh');
  assert.equal(result.catalog.models.length, 1);
  assert.equal(result.catalog.models[0].slug, 'deepseek-v4-flash');
});

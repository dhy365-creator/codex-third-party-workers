import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../src/cli.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function filesUnder(directory) {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(target));
    else if (entry.isFile()) output.push(target);
  }
  return output;
}

test('repository contains no personal absolute paths, fixed UID, or credential values', async () => {
  const forbidden = [
    `experimental_${'bearer_token'}`,
  ];
  for (const file of await filesUnder(root)) {
    const data = await fs.readFile(file);
    if (data.includes(0)) continue;
    const text = data.toString('utf8');
    for (const value of forbidden) assert.equal(text.includes(value), false, `${file} contains ${value}`);
    assert.doesNotMatch(text, /\/Users\/[A-Za-z0-9._-]+/);
    assert.doesNotMatch(text, /codex-(?:deepseek|third-party-worker)-task-bridge-[0-9]{2,}/);
    assert.doesNotMatch(text, /sk-[A-Za-z0-9_-]{12,}/);
  }
});

test('CLI rejects any API-key flag', () => {
  assert.throws(() => parseArgs(['--api-key', 'secret']), /unknown option/);
});

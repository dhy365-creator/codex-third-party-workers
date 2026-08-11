import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, summarizeVerify } from '../src/cli.mjs';

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

test('post-install success signal appears only after complete local verification', () => {
  const success = summarizeVerify({
    configured: true,
    runtimeVerified: false,
    credentialReady: true,
    issues: [],
    warnings: ['runtime remains unverified'],
  });
  assert.equal(success.POST_INSTALL_STATUS, 'SUCCESS');
  assert.equal(Object.keys(success).filter((key) => key === 'POST_INSTALL_STATUS').length, 1);

  const verificationFailure = summarizeVerify({
    configured: false,
    runtimeVerified: false,
    credentialReady: true,
    issues: ['managed file changed'],
    warnings: [],
  });
  assert.equal(verificationFailure.POST_INSTALL_STATUS, undefined);

  const credentialCheckSkipped = summarizeVerify({
    configured: true,
    runtimeVerified: false,
    credentialReady: null,
    issues: [],
    warnings: ['Keychain credential check was skipped'],
  });
  assert.equal(credentialCheckSkipped.POST_INSTALL_STATUS, undefined);
});

test('optional Star policy is agent-only, consent-based, and non-blocking', async () => {
  const prompt = await fs.readFile(path.join(root, 'docs', 'CODEX_INSTALL_PROMPT.zh-CN.md'), 'utf8');
  assert.match(prompt, /POST_INSTALL_STATUS: "SUCCESS"/);
  assert.match(prompt, /询问一次/);
  assert.match(prompt, /绝不\s*自动 Star/);
  assert.match(prompt, /明确同意/);
  assert.match(prompt, /拒绝、忽略或说以后再说/);
  assert.match(prompt, /GitHub 未认证、工具不可用或 Star 失败/);
  assert.match(prompt, /不阻塞、不改变已经\s*成功的安装状态/);

  const implementation = await Promise.all(
    ['src', 'scripts'].map(async (directory) => Promise.all(
      (await filesUnder(path.join(root, directory))).map((file) => fs.readFile(file, 'utf8')),
    )),
  );
  const source = implementation.flat().join('\n');
  assert.doesNotMatch(source, /user\/starred|gh\s+(?:api|repo)\b[^\n]*\bstar\b/i);
  assert.doesNotMatch(await fs.readFile(path.join(root, 'src', 'installer.mjs'), 'utf8'), /star/i);
});

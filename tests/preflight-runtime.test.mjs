import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runPreflight } from '../src/preflight-runtime.mjs';

function rateLimits({ sparkUsed = 100, generalUsed = 95 } = {}) {
  return {
    rateLimitsByLimitId: {
      spark: {
        limitId: 'spark',
        limitName: 'Codex Spark',
        primary: { usedPercent: sparkUsed },
      },
      codex: {
        limitId: 'codex',
        limitName: 'Codex',
        primary: { usedPercent: generalUsed },
      },
    },
  };
}

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'codex-dsw-preflight-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const agentPath = path.join(root, 'deepseek_worker.toml');
  const catalogPath = path.join(root, 'catalog.json');
  const configPath = path.join(root, 'worker.json');
  await fs.writeFile(agentPath, 'model = "deepseek-v4-flash"\n');
  await fs.writeFile(catalogPath, JSON.stringify({
    models: [{ slug: 'deepseek-v4-flash', input_modalities: ['text'] }],
  }));
  await fs.writeFile(configPath, '{}');
  return {
    threshold: 10,
    sparkAvailable: true,
    lunaAvailable: true,
    bridgePath: path.join(root, 'bridge'),
    agentPath,
    catalogPath,
    configPath,
    keychainAccount: 'fixture-user',
    keychainService: 'fixture-service',
    providerId: 'deepseek',
    platform: 'darwin',
  };
}

function input(overrides = {}) {
  return {
    version: 1,
    operation: 'spawn',
    requestedAgent: 'spark-worker',
    taskName: 'bounded_task',
    message: 'bounded text and code task',
    cwd: '/tmp/worktree',
    deepseekSuitable: true,
    ...overrides,
  };
}

test('preflight prepares DeepSeek only after Spark is exhausted and quota is low', async (t) => {
  const config = await fixture(t);
  let bridgeRequest;
  const result = await runPreflight(input(), config, {
    readRateLimits: async () => rateLimits(),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
    createBridgeImpl: async (request) => { bridgeRequest = request; },
  });
  assert.equal(result.agentType, 'deepseek_worker');
  assert.equal(result.action, 'spawn');
  assert.equal(result.bridgePrepared, true);
  assert.equal(bridgeRequest.message, 'bounded text and code task');
});

test('preflight accepts legacy deepseekSuitable compatibility flag', async (t) => {
  const config = await fixture(t);
  const result = await runPreflight(input(), config, {
    readRateLimits: async () => rateLimits(),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
    createBridgeImpl: async () => {},
    providerSuitable: undefined,
  });
  assert.equal(result.bridgePrepared, true);
});

test('quota lookup failure keeps the requested OpenAI worker', async (t) => {
  const config = await fixture(t);
  const result = await runPreflight(input(), config, {
    readRateLimits: async () => { throw new Error('offline'); },
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
  });
  assert.equal(result.agentType, 'spark-worker');
  assert.equal(result.bridgePrepared, false);
});

test('busy bridge safely falls back to Luna', async (t) => {
  const config = await fixture(t);
  const result = await runPreflight(input(), config, {
    readRateLimits: async () => rateLimits(),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => true,
  });
  assert.equal(result.agentType, 'luna_worker');
  assert.equal(result.bridgePrepared, false);
});

test('bridge-compatible DeepSeek followup reuses its existing target', async (t) => {
  const config = await fixture(t);
  let bridgeRequest;
  const result = await runPreflight(input({
    operation: 'followup',
    existingAgentType: 'deepseek_worker',
    target: '/root/existing_task',
  }), config, {
    readRateLimits: async () => rateLimits(),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
    hasArchivedImpl: async () => true,
    createBridgeImpl: async (request) => { bridgeRequest = request; },
  });
  assert.equal(result.action, 'followup');
  assert.equal(result.target, '/root/existing_task');
  assert.equal(bridgeRequest.taskName, '/root/existing_task');
});

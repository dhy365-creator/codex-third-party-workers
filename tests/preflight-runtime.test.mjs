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
  await fs.writeFile(agentPath, [
    'name = "deepseek_worker"',
    'model = "deepseek-v4-flash"',
    'model_provider = "deepseek"',
  ].join('\n'));
  await fs.writeFile(catalogPath, JSON.stringify({
    models: [{ slug: 'deepseek-v4-flash', input_modalities: ['text'] }],
  }));
  const config = {
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
    profiles: [{
      id: 'flash',
      providerRole: 'deepseek_worker',
      model: 'deepseek-v4-flash',
      agentPath,
      catalogPath,
    }],
    defaultProviderRole: 'deepseek_worker',
  };
  await fs.writeFile(configPath, JSON.stringify(config));
  return config;
}

async function registerPro(config) {
  const root = path.dirname(config.agentPath);
  const agentPath = path.join(root, 'deepseek_pro_worker.toml');
  const catalogPath = path.join(root, 'deepseek-v4-pro.json');
  await fs.writeFile(agentPath, [
    'name = "deepseek_pro_worker"',
    'model = "deepseek-v4-pro"',
    'model_provider = "deepseek"',
  ].join('\n'));
  await fs.writeFile(catalogPath, JSON.stringify({
    models: [{ slug: 'deepseek-v4-pro', input_modalities: ['text'] }],
  }));
  config.profiles.push({
    id: 'pro',
    providerRole: 'deepseek_pro_worker',
    model: 'deepseek-v4-pro',
    agentPath,
    catalogPath,
  });
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
  assert.deepEqual(result.worker, {
    providerId: 'deepseek',
    providerRole: 'deepseek_worker',
    model: 'deepseek-v4-flash',
  });
  assert.equal(bridgeRequest.message, 'bounded text and code task');
  assert.equal(bridgeRequest.model, 'deepseek-v4-flash');
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

test('explicit Pro worker is allowed only after its registered profile is ready', async (t) => {
  const config = await fixture(t);
  await registerPro(config);
  let bridgeRequest;
  const result = await runPreflight(input({ requestedAgent: 'deepseek_pro_worker' }), config, {
    readRateLimits: async () => rateLimits({ sparkUsed: 0, generalUsed: 0 }),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
    createBridgeImpl: async (request) => { bridgeRequest = request; },
  });
  assert.equal(result.agentType, 'deepseek_pro_worker');
  assert.equal(result.reason, 'explicit-provider-ready');
  assert.equal(result.bridgePrepared, true);
  assert.deepEqual(result.worker, {
    providerId: 'deepseek',
    providerRole: 'deepseek_pro_worker',
    model: 'deepseek-v4-pro',
  });
  assert.equal(bridgeRequest.providerRole, 'deepseek_pro_worker');
  assert.equal(bridgeRequest.model, 'deepseek-v4-pro');
});

test('unregistered Pro and unknown workers fail closed', async (t) => {
  const config = await fixture(t);
  await assert.rejects(
    runPreflight(input({ requestedAgent: 'deepseek_pro_worker' }), config),
    /unknown requested agent/,
  );
  await assert.rejects(
    runPreflight(input({ requestedAgent: 'not_a_worker' }), config),
    /unknown requested agent/,
  );
});

test('automatic low-quota fallback never selects Pro', async (t) => {
  const config = await fixture(t);
  await registerPro(config);
  const flash = config.profiles.find((profile) => profile.id === 'flash');
  await fs.unlink(flash.agentPath);
  const result = await runPreflight(input(), config, {
    readRateLimits: async () => rateLimits(),
    keychainReadyImpl: async () => true,
    bridgeBusyImpl: async () => false,
  });
  assert.equal(result.agentType, 'luna_worker');
  assert.equal(result.bridgePrepared, false);
});

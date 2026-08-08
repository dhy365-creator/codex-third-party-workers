import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENTS_START,
  agentToml,
  agentsBlock,
  extractAgentsBlock,
  removeAgentsBlock,
  replaceAgentsBlock,
} from '../src/templates.mjs';
import { resolveProviderPack } from '../src/provider-packs.mjs';

test('agent TOML keeps DeepSeek inside the child and uses Keychain auth', () => {
  const providerPack = resolveProviderPack('deepseek');
  const result = agentToml({
    catalogPath: '/tmp/catalog.json',
    bridgePath: '/tmp/bridge',
    bridgeCliPath: '/tmp/bridge-cli.mjs',
    nodePath: '/usr/local/bin/node',
    keychainAccount: 'fixture-user',
    providerPack,
  });
  assert.match(result, /model = "deepseek-v4-flash"/);
  assert.match(result, /model_provider = "deepseek"/);
  assert.match(result, /\[model_providers\.deepseek\.auth\]/);
  assert.match(result, /find-generic-password/);
  assert.equal(result.includes('worker_config'), false);
  assert.equal(result.includes(`experimental_${'bearer_token'}`), false);
  assert.doesNotMatch(result, /deepseek-v4-pro/i);
});

test('agent TOML configures MiniMax M3 with command-backed Keychain auth', () => {
  const providerPack = resolveProviderPack('minimax');
  const result = agentToml({
    catalogPath: '/tmp/minimax-catalog.json',
    bridgePath: '/tmp/bridge',
    bridgeCliPath: '/tmp/bridge-cli.mjs',
    nodePath: '/usr/local/bin/node',
    keychainAccount: 'fixture-user',
    providerPack,
  });
  assert.match(result, /name = "minimax_worker"/);
  assert.match(result, /model = "MiniMax-M3"/);
  assert.match(result, /model_provider = "minimax"/);
  assert.match(result, /model_context_window = 1000000/);
  assert.match(result, /codex-minimax-api-key/);
  assert.equal(result.includes(`experimental_${'bearer_token'}`), false);
});

test('agent TOML configures Qwen3.7-Max without changing the primary model', () => {
  const providerPack = resolveProviderPack('qwen');
  const result = agentToml({
    catalogPath: '/tmp/qwen-catalog.json',
    bridgePath: '/tmp/bridge',
    bridgeCliPath: '/tmp/bridge-cli.mjs',
    nodePath: '/usr/local/bin/node',
    keychainAccount: 'fixture-user',
    providerPack,
  });
  assert.match(result, /name = "qwen_worker"/);
  assert.match(result, /model = "qwen3\.7-max"/);
  assert.match(result, /model_provider = "qwen"/);
  assert.match(result, /model_context_window = 1000000/);
  assert.match(result, /codex-qwen-api-key/);
  assert.equal(result.includes(`experimental_${'bearer_token'}`), false);
});

test('AGENTS marker update is idempotent and removable without touching user text', () => {
  const block = agentsBlock({
    nodePath: '/node',
    preflightPath: '/preflight',
    bridgePath: '/bridge',
    threshold: 50,
    sparkAvailable: false,
    lunaAvailable: true,
  });
  const first = replaceAgentsBlock('# User rules\n', block);
  const second = replaceAgentsBlock(first, block);
  assert.equal(second, first);
  assert.equal(second.split(AGENTS_START).length - 1, 1);
  assert.equal(extractAgentsBlock(second), block);
  const removed = removeAgentsBlock(`${second}# Later user rule\n`, block);
  assert.equal(removed.changed, true);
  assert.match(removed.text, /# User rules/);
  assert.match(removed.text, /# Later user rule/);
  assert.doesNotMatch(removed.text, new RegExp(AGENTS_START));
});

test('malformed markers fail closed', () => {
  assert.throws(
    () => replaceAgentsBlock(`text\n${AGENTS_START}\n`, 'replacement'),
    /malformed/,
  );
});

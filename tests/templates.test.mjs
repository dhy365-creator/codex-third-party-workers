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

test('agent TOML keeps DeepSeek inside the child and uses Keychain auth', () => {
  const result = agentToml({
    catalogPath: '/tmp/catalog.json',
    bridgePath: '/tmp/bridge',
    bridgeCliPath: '/tmp/bridge-cli.mjs',
    nodePath: '/usr/local/bin/node',
    keychainAccount: 'fixture-user',
  });
  assert.match(result, /model = "deepseek-v4-flash"/);
  assert.match(result, /model_provider = "deepseek"/);
  assert.match(result, /\[model_providers\.deepseek\.auth\]/);
  assert.match(result, /find-generic-password/);
  assert.equal(result.includes('worker_config'), false);
  assert.equal(result.includes(`experimental_${'bearer_token'}`), false);
  assert.doesNotMatch(result, /deepseek-v4-pro/i);
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
  assert.doesNotMatch(removed.text, /codex-deepseek-worker:start/);
});

test('malformed markers fail closed', () => {
  assert.throws(
    () => replaceAgentsBlock(`text\n${AGENTS_START}\n`, 'replacement'),
    /malformed/,
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { install } from '../src/installer.mjs';
import { uninstall } from '../src/uninstaller.mjs';
import { verify } from '../src/verifier.mjs';
import { AGENTS_START, AGENTS_END } from '../src/templates.mjs';

const fixtureCatalog = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
  'catalog.json',
);

async function setup(t) {
  const homeDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codex-dsw-home-'));
  t.after(() => fs.rm(homeDir, { recursive: true, force: true }));
  const codexDir = path.join(homeDir, '.codex');
  await fs.mkdir(codexDir, { recursive: true });
  const configToml = path.join(codexDir, 'config.toml');
  const sentinel = 'model = "gpt-5.6-sol"\nmodel_provider = "openai"\n';
  await fs.writeFile(configToml, sentinel);
  await fs.writeFile(path.join(codexDir, 'AGENTS.md'), '# Existing user rules\n');
  const env = {
    ...process.env,
    DEEPSEEK_WORKER_BRIDGE_ROOT: path.join(homeDir, 'fake-bridge'),
  };
  const options = {
    homeDir,
    uid: process.getuid(),
    username: 'fixture-user',
    nodePath: process.execPath,
    platform: 'darwin',
    env,
    plan: 'plus',
    sparkAvailable: false,
    lunaAvailable: true,
    threshold: 50,
    confirmMainPreserved: true,
    consentData: true,
    catalogSource: fixtureCatalog,
    keychainReadyImpl: async () => true,
  };
  return { homeDir, codexDir, configToml, sentinel, options };
}

test('dry-run writes nothing, apply is idempotent, verify is honest, and uninstall is safe', async (t) => {
  const fixture = await setup(t);
  const dry = await install(fixture.options);
  assert.equal(dry.dryRun, true);
  assert.equal(dry.applied, false);
  assert.equal(await fs.readFile(fixture.configToml, 'utf8'), fixture.sentinel);
  await assert.rejects(fs.stat(dry.manifestPath), /ENOENT/);

  const applied = await install({ ...fixture.options, apply: true });
  assert.equal(applied.applied, true);
  assert.equal(await fs.readFile(fixture.configToml, 'utf8'), fixture.sentinel);
  assert.equal((await fs.stat(applied.manifestPath)).mode & 0o777, 0o600);
  const agent = await fs.readFile(applied.environment.agentPath, 'utf8');
  assert.match(agent, /model_provider = "deepseek"/);
  assert.match(agent, /fixture-user/);
  assert.doesNotMatch(agent, /gpt-5\.6-sol/);
  const catalog = JSON.parse(await fs.readFile(applied.environment.catalogPath, 'utf8'));
  assert.deepEqual(catalog.models.map((model) => model.slug), ['deepseek-v4-flash']);

  const checked = await verify({
    ...fixture.options,
    checkKeychain: true,
    keychainReadyImpl: async () => true,
  });
  assert.equal(checked.configured, true);
  assert.equal(checked.runtimeVerified, false);
  assert.match(checked.warnings.join('\n'), /runtime remains unverified/);

  await fs.appendFile(path.join(fixture.codexDir, 'AGENTS.md'), '# Later user rule\n');
  await install({ ...fixture.options, apply: true });
  const agents = await fs.readFile(path.join(fixture.codexDir, 'AGENTS.md'), 'utf8');
  assert.equal(agents.split(AGENTS_START).length - 1, 1);

  const uninstallDry = await uninstall({ ...fixture.options });
  assert.equal(uninstallDry.dryRun, true);
  assert.equal(uninstallDry.applied, false);
  const removed = await uninstall({ ...fixture.options, apply: true });
  assert.equal(removed.applied, true);
  assert.equal(removed.keychainRemoved, false);
  assert.equal(await fs.readFile(fixture.configToml, 'utf8'), fixture.sentinel);
  const finalAgents = await fs.readFile(path.join(fixture.codexDir, 'AGENTS.md'), 'utf8');
  assert.match(finalAgents, /# Existing user rules/);
  assert.match(finalAgents, /# Later user rule/);
  assert.doesNotMatch(finalAgents, new RegExp(AGENTS_START));
  assert.doesNotMatch(finalAgents, new RegExp(AGENTS_END));
  await assert.rejects(fs.stat(applied.environment.agentPath), /ENOENT/);
  await assert.rejects(fs.stat(applied.manifestPath), /ENOENT/);
});

test('uninstall reports conflicts and performs no partial removal', async (t) => {
  const fixture = await setup(t);
  const applied = await install({ ...fixture.options, apply: true });
  await fs.appendFile(applied.environment.agentPath, '# user change\n');
  const result = await uninstall({ ...fixture.options, apply: true });
  assert.equal(result.applied, false);
  assert.match(result.conflicts.join('\n'), /managed file was modified/);
  await fs.stat(applied.environment.preflightPath);
  await fs.stat(applied.manifestPath);
});

test('missing Keychain credential fails before any configuration write', async (t) => {
  const fixture = await setup(t);
  await assert.rejects(
    install({ ...fixture.options, apply: true, keychainReadyImpl: async () => false }),
    /not provisioned/,
  );
  assert.equal(await fs.readFile(fixture.configToml, 'utf8'), fixture.sentinel);
  await assert.rejects(fs.stat(path.join(fixture.codexDir, 'agents')), /ENOENT/);
  await assert.rejects(fs.stat(path.join(fixture.codexDir, 'codex-third-party-workers-install.json')), /ENOENT/);
});

test('uninstall restores a validated pre-existing managed file', async (t) => {
  const fixture = await setup(t);
  const agentsDir = path.join(fixture.codexDir, 'agents');
  await fs.mkdir(agentsDir, { recursive: true });
  const agentPath = path.join(agentsDir, 'deepseek_worker.toml');
  const original = 'name = "user-owned-deepseek-worker"\n';
  await fs.writeFile(agentPath, original, { mode: 0o640 });
  await install({ ...fixture.options, apply: true });
  assert.notEqual(await fs.readFile(agentPath, 'utf8'), original);
  const result = await uninstall({ ...fixture.options, apply: true });
  assert.equal(result.applied, true);
  assert.equal(await fs.readFile(agentPath, 'utf8'), original);
  assert.equal((await fs.stat(agentPath)).mode & 0o777, 0o640);
});

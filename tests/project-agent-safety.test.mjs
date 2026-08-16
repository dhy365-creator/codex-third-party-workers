import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspectProjectCustomAgentLayers } from '../src/project-agent-safety.mjs';

async function fixture(t, name) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), name));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

test('project layer inspection permits a project without Custom Agents', async (t) => {
  const root = await fixture(t, 'codex-project-agent-clean-');
  await fs.mkdir(path.join(root, '.git'));
  const result = await inspectProjectCustomAgentLayers({ cwd: root });
  assert.deepEqual(result, { safe: true, definitions: [], issues: [] });
});

test('project layer inspection finds Custom Agents from a nested task cwd', async (t) => {
  const root = await fixture(t, 'codex-project-agent-shadow-');
  const directory = path.join(root, '.codex', 'agents');
  const nested = path.join(root, 'packages', 'fixture');
  await fs.mkdir(path.join(root, '.git'));
  await fs.mkdir(directory, { recursive: true });
  await fs.mkdir(nested, { recursive: true });
  await fs.writeFile(path.join(directory, 'unrelated-name.toml'), 'name = "deepseek_worker"\n');

  const result = await inspectProjectCustomAgentLayers({ cwd: nested });
  assert.equal(result.safe, false);
  assert.equal(result.definitions.length, 1);
  assert.deepEqual(result.issues, []);
});

test('project layer inspection resolves a symlinked task cwd before checking layers', async (t) => {
  const parent = await fixture(t, 'codex-project-agent-cwd-link-');
  const root = path.join(parent, 'repository');
  const nested = path.join(root, 'packages', 'fixture');
  const link = path.join(parent, 'task-link');
  await fs.mkdir(path.join(root, '.git'), { recursive: true });
  await fs.mkdir(path.join(root, '.codex', 'agents'), { recursive: true });
  await fs.mkdir(nested, { recursive: true });
  await fs.writeFile(path.join(root, '.codex', 'agents', 'worker.toml'), 'name = "deepseek_worker"\n');
  await fs.symlink(nested, link);

  const result = await inspectProjectCustomAgentLayers({ cwd: link });
  assert.equal(result.safe, false);
  assert.equal(result.definitions.length, 1);
});

test('project layer inspection fails closed on a symlinked agent directory', async (t) => {
  const root = await fixture(t, 'codex-project-agent-symlink-');
  const target = path.join(root, 'target');
  await fs.mkdir(path.join(root, '.git'));
  await fs.mkdir(path.join(root, '.codex'), { recursive: true });
  await fs.mkdir(target);
  await fs.symlink(target, path.join(root, '.codex', 'agents'));

  const result = await inspectProjectCustomAgentLayers({ cwd: root });
  assert.equal(result.safe, false);
  assert.match(result.issues.join('\n'), /not a regular directory/);
});

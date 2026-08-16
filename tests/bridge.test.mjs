import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  BridgeBusyError,
  completeBridgeTask,
  createBridgeTask,
  hasArchivedBridgeTask,
  readBridgeTask,
} from '../src/bridge.mjs';
import { BRIDGE_PREFIX, getBridgeRoot } from '../src/environment.mjs';

test('bridge root uses the current platform when no platform override is supplied', () => {
  const uid = 424242;
  const root = getBridgeRoot({ uid, tmpDir: '/ignored-by-default-platform', env: {} });
  const expectedParent = process.platform === 'darwin' ? '/private/tmp' : os.tmpdir();
  assert.equal(root, path.join(expectedParent, `${BRIDGE_PREFIX}${uid}`));
});

test('bridge is single-slot, owner-only, atomic, and redacts archives', async (t) => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'codex-dsw-bridge-'));
  const root = path.join(parent, 'bridge');
  t.after(() => fs.rm(parent, { recursive: true, force: true }));

  const created = await createBridgeTask({
    root,
    taskName: '/root/example_task',
    cwd: '/tmp/example-worktree',
    message: 'private bounded task body',
  });
  assert.equal(created.task.taskBasename, 'example_task');
  assert.equal((await fs.stat(path.join(root, 'active'))).mode & 0o777, 0o700);
  assert.equal((await fs.stat(path.join(root, 'active', 'task.json'))).mode & 0o777, 0o600);
  assert.equal((await readBridgeTask({ root })).status, 'pending');

  await assert.rejects(
    createBridgeTask({ root, taskName: 'second', cwd: '/tmp', message: 'second task' }),
    BridgeBusyError,
  );
  await assert.rejects(
    completeBridgeTask('wrong-task', { root }),
    /does not match/,
  );

  const result = await completeBridgeTask('example_task', { root });
  assert.match(path.basename(result.archivePath), /^completed-example_task-/);
  assert.equal(await readBridgeTask({ root }), null);
  const archived = JSON.parse(await fs.readFile(path.join(result.archivePath, 'task.json'), 'utf8'));
  assert.equal(archived.status, 'completed');
  assert.equal(archived.message, '[REDACTED]');
  assert.equal(archived.cwd, '[REDACTED]');
  assert.equal(JSON.stringify(archived).includes('private bounded task body'), false);
  assert.equal(await hasArchivedBridgeTask('/root/example_task', { root }), true);
});

test('bridge rejects missing task fields before creating a slot', async (t) => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'codex-dsw-bridge-invalid-'));
  const root = path.join(parent, 'bridge');
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  await assert.rejects(
    createBridgeTask({ root, taskName: 'x', cwd: '', message: 'body' }),
    /cwd is required/,
  );
  await assert.rejects(fs.stat(path.join(root, 'active')), /ENOENT/);
});

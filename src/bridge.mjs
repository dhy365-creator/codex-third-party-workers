import path from 'node:path';
import crypto from 'node:crypto';
import {
  ensureDir,
  fs,
  lstatIfExists,
  normalizeBasename,
  redactTask,
} from './fs-utils.mjs';
import { getBridgeRoot } from './environment.mjs';

export const BRIDGE_VERSION = 1;
const ACTIVE_STATUSES = new Set(['pending', 'running']);
const ARCHIVE_STATUSES = new Set(['completed', 'failed']);

export class BridgeBusyError extends Error {
  constructor(message = 'DeepSeek bridge is busy') {
    super(message);
    this.name = 'BridgeBusyError';
    this.code = 'BRIDGE_BUSY';
  }
}

function pathsFor(root) {
  return {
    root,
    active: path.join(root, 'active'),
    task: path.join(root, 'active', 'task.json'),
  };
}

function expectedUid(options = {}) {
  return options.uid ?? process.getuid?.();
}

async function assertOwnedPath(filePath, { type, mode, uid }) {
  const info = await fs.lstat(filePath);
  if (info.isSymbolicLink()) throw new Error(`bridge symlink is not allowed: ${filePath}`);
  if (type === 'directory' && !info.isDirectory()) throw new Error(`${filePath} is not a directory`);
  if (type === 'file' && !info.isFile()) throw new Error(`${filePath} is not a regular file`);
  if ((info.mode & 0o777) !== mode) throw new Error(`unexpected bridge mode: ${filePath}`);
  if (uid != null && info.uid !== uid) throw new Error(`unexpected bridge owner: ${filePath}`);
  return info;
}

export function bridgePaths({ root, uid, platform, tmpDir, env } = {}) {
  const resolved = path.resolve(root ?? getBridgeRoot({ uid, platform, tmpDir, env }));
  return pathsFor(resolved);
}

export async function ensureBridgeRoot(options = {}) {
  const paths = bridgePaths(options);
  const existing = await lstatIfExists(paths.root);
  if (existing?.isSymbolicLink() || (existing && !existing.isDirectory())) {
    throw new Error('bridge root must be a real directory');
  }
  await ensureDir(paths.root, 0o700);
  await assertOwnedPath(paths.root, {
    type: 'directory',
    mode: 0o700,
    uid: expectedUid(options),
  });
  return paths;
}

function validateTask(task, statuses = ACTIVE_STATUSES) {
  if (!task || typeof task !== 'object') throw new Error('bridge task is not an object');
  if (task.version !== BRIDGE_VERSION) throw new Error('unsupported bridge task version');
  if (!statuses.has(task.status)) throw new Error('invalid bridge task status');
  if (typeof task.taskName !== 'string' || !task.taskName.trim()) throw new Error('bridge taskName is empty');
  if (task.taskBasename !== normalizeBasename(task.taskName)) throw new Error('bridge taskBasename is invalid');
  if (statuses === ARCHIVE_STATUSES) {
    if (task.message !== '[REDACTED]' || task.cwd !== '[REDACTED]') {
      throw new Error('bridge archive is not redacted');
    }
  } else {
    if (typeof task.message !== 'string' || !task.message.trim()) throw new Error('bridge message is empty');
    if (typeof task.cwd !== 'string' || !path.isAbsolute(task.cwd)) throw new Error('bridge cwd must be absolute');
  }
  return task;
}

export async function createBridgeTask({
  root,
  uid,
  platform,
  tmpDir,
  env,
  taskName,
  cwd,
  message,
  now = new Date(),
} = {}) {
  if (typeof taskName !== 'string' || !taskName.trim()) throw new Error('taskName is required');
  if (typeof cwd !== 'string' || !cwd.trim()) throw new Error('cwd is required');
  if (typeof message !== 'string' || !message.trim()) throw new Error('message is required');
  const task = validateTask({
    version: BRIDGE_VERSION,
    status: 'pending',
    taskName: String(taskName ?? '').trim(),
    taskBasename: normalizeBasename(taskName),
    cwd: path.resolve(String(cwd ?? '')),
    message,
    createdAt: now.toISOString(),
  });
  const options = { root, uid, platform, tmpDir, env };
  const paths = await ensureBridgeRoot(options);
  try {
    await fs.mkdir(paths.active, { mode: 0o700 });
  } catch (error) {
    if (error?.code === 'EEXIST') throw new BridgeBusyError();
    throw error;
  }
  try {
    await assertOwnedPath(paths.active, {
      type: 'directory',
      mode: 0o700,
      uid: expectedUid(options),
    });
    const handle = await fs.open(paths.task, 'wx', 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(task, null, 2)}\n`);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.chmod(paths.task, 0o600);
    await assertOwnedPath(paths.task, {
      type: 'file',
      mode: 0o600,
      uid: expectedUid(options),
    });
    return { ...paths, task };
  } catch (error) {
    try {
      const taskInfo = await lstatIfExists(paths.task);
      if (taskInfo?.isFile() && !taskInfo.isSymbolicLink()) await fs.unlink(paths.task);
      await fs.rmdir(paths.active);
    } catch {
      // Preserve the original error. Never touch any archive.
    }
    throw error;
  }
}

export async function readBridgeTask(options = {}) {
  const paths = bridgePaths(options);
  const active = await lstatIfExists(paths.active);
  if (!active) return null;
  await assertOwnedPath(paths.active, {
    type: 'directory', mode: 0o700, uid: expectedUid(options),
  });
  await assertOwnedPath(paths.task, {
    type: 'file', mode: 0o600, uid: expectedUid(options),
  });
  return validateTask(JSON.parse(await fs.readFile(paths.task, 'utf8')));
}

export async function bridgeBusy(options = {}) {
  const paths = bridgePaths(options);
  const active = await lstatIfExists(paths.active);
  if (!active) return false;
  await assertOwnedPath(paths.active, {
    type: 'directory', mode: 0o700, uid: expectedUid(options),
  });
  return true;
}

export async function hasArchivedBridgeTask(taskName, options = {}) {
  const paths = await ensureBridgeRoot(options);
  const basename = normalizeBasename(taskName);
  const prefixes = [`completed-${basename}-`, `failed-${basename}-`];
  const entries = await fs.readdir(paths.root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !prefixes.some((prefix) => entry.name.startsWith(prefix))) continue;
    const directory = path.join(paths.root, entry.name);
    const taskPath = path.join(directory, 'task.json');
    try {
      await assertOwnedPath(directory, {
        type: 'directory', mode: 0o700, uid: expectedUid(options),
      });
      await assertOwnedPath(taskPath, {
        type: 'file', mode: 0o600, uid: expectedUid(options),
      });
      const task = validateTask(
        JSON.parse(await fs.readFile(taskPath, 'utf8')),
        ARCHIVE_STATUSES,
      );
      if (task.taskBasename === basename) return true;
    } catch {
      // Malformed archives never authorize a follow-up.
    }
  }
  return false;
}

export async function archiveBridgeTask({ status, expectedTaskBasename, now = new Date(), ...options } = {}) {
  if (!ARCHIVE_STATUSES.has(status)) throw new Error('archive status must be completed or failed');
  const paths = bridgePaths(options);
  const task = await readBridgeTask(options);
  if (!task) throw new Error('bridge has no active task');
  if (expectedTaskBasename && normalizeBasename(expectedTaskBasename) !== task.taskBasename) {
    throw new Error('bridge task does not match the expected task');
  }
  const redacted = redactTask({ ...task, status, updatedAt: now.toISOString() });
  const temp = path.join(paths.active, `.task-${crypto.randomBytes(8).toString('hex')}.tmp`);
  const handle = await fs.open(temp, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(redacted, null, 2)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.chmod(temp, 0o600);
  await fs.rename(temp, paths.task);
  const prefix = `${status}-${task.taskBasename}`;
  let archivePath;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const nonce = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const candidate = path.join(paths.root, `${prefix}-${nonce}`);
    if (!(await lstatIfExists(candidate))) {
      archivePath = candidate;
      break;
    }
  }
  if (!archivePath) throw new Error('could not allocate bridge archive path');
  await fs.rename(paths.active, archivePath);
  await fs.chmod(archivePath, 0o700);
  await fs.chmod(path.join(archivePath, 'task.json'), 0o600);
  return { archivePath, status, task: redacted };
}

export function completeBridgeTask(expectedTaskBasename, options = {}) {
  return archiveBridgeTask({ ...options, status: 'completed', expectedTaskBasename });
}

export function failBridgeTask(expectedTaskBasename, options = {}) {
  return archiveBridgeTask({ ...options, status: 'failed', expectedTaskBasename });
}

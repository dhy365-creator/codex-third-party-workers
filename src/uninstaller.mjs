import path from 'node:path';
import { discoverEnvironment } from './environment.mjs';
import {
  copyOwnerOnly,
  fs,
  isPathInside,
  lstatIfExists,
  removeFileIfExists,
  sha256File,
  writeFileIfChanged,
} from './fs-utils.mjs';
import { removeAgentsBlock } from './templates.mjs';

const RUNTIME_FILES = [
  'bridge.mjs',
  'bridge-cli.mjs',
  'catalog.mjs',
  'environment.mjs',
  'fs-utils.mjs',
  'keychain.mjs',
  'preflight-runtime.mjs',
  'routing.mjs',
];

function allowedPaths(env) {
  return new Set([
    ...RUNTIME_FILES.map((name) => path.join(env.runtimeDir, name)),
    env.agentPath,
    env.configPath,
    env.catalogPath,
    env.preflightPath,
    env.bridgeCliPath,
    env.agentsMarkerPath,
  ]);
}

async function loadManifest(env) {
  const info = await lstatIfExists(env.manifestPath);
  if (!info) throw new Error('install manifest is missing');
  if (info.isSymbolicLink() || !info.isFile() || (info.mode & 0o777) !== 0o600) {
    throw new Error('install manifest must be a regular owner-only file');
  }
  const manifest = JSON.parse(await fs.readFile(env.manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.environment?.homeDir !== env.homeDir) {
    throw new Error('install manifest is incompatible with this home directory');
  }
  return manifest;
}

async function planRegular(record, env) {
  const info = await lstatIfExists(record.path);
  if (!info) return { type: 'already-missing', record };
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`managed path is not a regular file: ${record.path}`);
  }
  if (await sha256File(record.path) !== record.hash) {
    throw new Error(`managed file was modified: ${record.path}`);
  }
  if (record.backup) {
    if (!isPathInside(env.backupDir, record.backup.path)) {
      throw new Error(`backup escapes the managed backup directory: ${record.path}`);
    }
    const backupInfo = await lstatIfExists(record.backup.path);
    if (!backupInfo || backupInfo.isSymbolicLink() || !backupInfo.isFile()) {
      throw new Error(`backup is missing or invalid: ${record.path}`);
    }
    if ((backupInfo.mode & 0o777) !== 0o600 || await sha256File(record.backup.path) !== record.backup.hash) {
      throw new Error(`backup failed integrity validation: ${record.path}`);
    }
    if (!Number.isInteger(record.backup.originalMode)
      || record.backup.originalMode < 0
      || record.backup.originalMode > 0o777) {
      throw new Error(`backup mode is invalid: ${record.path}`);
    }
    return { type: 'restore', record };
  }
  if (record.preExisting) return { type: 'preserve-preexisting', record };
  return { type: 'remove', record };
}

async function planAgents(record, manifest) {
  const info = await lstatIfExists(record.path);
  if (!info) return { type: 'already-missing', record };
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error('AGENTS.md is not a regular file');
  }
  const source = await fs.readFile(record.path, 'utf8');
  const removed = removeAgentsBlock(source, manifest.agentsBlock);
  if (!removed.changed) return { type: 'already-missing', record };
  return {
    type: !removed.text && !record.preExisting ? 'remove' : 'rewrite-agents',
    record,
    text: removed.text,
    mode: info.mode & 0o777,
  };
}

export async function uninstall(options = {}) {
  const env = discoverEnvironment({ ...options, env: options.env ?? process.env });
  const dryRun = options.apply !== true;
  const manifest = await loadManifest(env);
  const allowed = allowedPaths(env);
  const actions = [];
  const conflicts = [];
  for (const record of manifest.managedFiles ?? []) {
    if (!allowed.has(record.path)) {
      conflicts.push(`manifest contains an unmanaged path: ${record.path}`);
      continue;
    }
    try {
      actions.push(record.kind === 'agents-marker'
        ? await planAgents(record, manifest)
        : await planRegular(record, env));
    } catch (error) {
      conflicts.push(error.message);
    }
  }
  if (conflicts.length || dryRun) {
    return {
      dryRun,
      applied: false,
      actions,
      conflicts,
      keychainRemoved: false,
      manifestRemoved: false,
    };
  }
  for (const action of actions) {
    if (action.type === 'remove') {
      await removeFileIfExists(action.record.path);
    } else if (action.type === 'restore') {
      await copyOwnerOnly(action.record.backup.path, action.record.path);
      await fs.chmod(action.record.path, action.record.backup.originalMode);
    } else if (action.type === 'rewrite-agents') {
      await writeFileIfChanged(action.record.path, action.text, { mode: action.mode });
    }
  }
  await removeFileIfExists(env.manifestPath);
  return {
    dryRun: false,
    applied: true,
    actions,
    conflicts: [],
    keychainRemoved: false,
    manifestRemoved: true,
  };
}

import os from 'node:os';
import path from 'node:path';

export const SERVICE_NAME = 'codex-deepseek-api-key';
export const BRIDGE_PREFIX = 'codex-deepseek-task-bridge-';
export const DEFAULT_API_BASE = 'https://api.deepseek.com/';
export const DEFAULT_SETUP_SCRIPT_URL =
  'https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh';
export const DEFAULT_CATALOG_FILE = 'deepseek-v4-flash.json';
export const DEFAULT_AGENT_FILE = 'deepseek_worker.toml';
export const DEFAULT_CONFIG_FILE = 'codex-deepseek-worker.json';
export const PREFLIGHT_FILE = 'subagent-preflight.mjs';
export const BRIDGE_CLI_FILE = 'codex-deepseek-worker-bridge.mjs';
export const MANIFEST_FILE = 'codex-deepseek-worker-install.json';
export const BACKUP_DIR = 'codex-deepseek-worker-backups';
export const RUNTIME_DIR = 'codex-deepseek-worker';

export function parseBoolean(value, name = 'boolean') {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'on'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'off'].includes(normalized)) return false;
  throw new Error(`${name} must be true or false`);
}

export function parseThreshold(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 100) {
    throw new Error('DeepSeek threshold must be an integer from 0 to 100');
  }
  return number;
}

export function getBridgeRoot({ uid, platform = process.platform, tmpDir, env = process.env } = {}) {
  const user = os.userInfo();
  const resolvedUid = uid ?? (typeof process.getuid === 'function' ? process.getuid() : user.uid);
  if (env.DEEPSEEK_WORKER_BRIDGE_ROOT) {
    return path.resolve(env.DEEPSEEK_WORKER_BRIDGE_ROOT);
  }
  const root = platform === 'darwin' ? '/private/tmp' : (tmpDir ?? os.tmpdir());
  return path.join(root, `${BRIDGE_PREFIX}${resolvedUid}`);
}

export function discoverEnvironment({
  homeDir,
  uid,
  username,
  nodePath,
  platform = process.platform,
  tmpDir,
  env = process.env,
} = {}) {
  const user = os.userInfo();
  const resolvedHome = path.resolve(homeDir ?? os.homedir());
  const resolvedUid = uid ?? (typeof process.getuid === 'function' ? process.getuid() : user.uid);
  const resolvedUsername = username ?? user.username;
  const resolvedNode = nodePath ?? process.execPath;
  const bridgePath = getBridgeRoot({ uid: resolvedUid, platform, tmpDir, env });
  const codexDir = path.join(resolvedHome, '.codex');
  const runtimeDir = path.join(codexDir, 'lib', RUNTIME_DIR);
  return {
    platform,
    homeDir: resolvedHome,
    uid: resolvedUid,
    username: resolvedUsername,
    nodePath: resolvedNode,
    keychainAccount: resolvedUsername,
    bridgePath,
    codexDir,
    runtimeDir,
    agentPath: path.join(codexDir, 'agents', DEFAULT_AGENT_FILE),
    configPath: path.join(codexDir, DEFAULT_CONFIG_FILE),
    catalogPath: path.join(codexDir, 'model-catalogs', DEFAULT_CATALOG_FILE),
    preflightPath: path.join(codexDir, 'bin', PREFLIGHT_FILE),
    bridgeCliPath: path.join(codexDir, 'bin', BRIDGE_CLI_FILE),
    manifestPath: path.join(codexDir, MANIFEST_FILE),
    backupDir: path.join(codexDir, BACKUP_DIR),
    agentsMarkerPath: path.join(codexDir, 'AGENTS.md'),
  };
}

export function assertSupportedPlatform(platform = process.platform) {
  if (platform !== 'darwin') {
    throw new Error('codex-deepseek-worker is macOS-only (darwin)');
  }
}

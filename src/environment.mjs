import os from 'node:os';
import path from 'node:path';
import { DEFAULT_PROVIDER_ID, resolveProviderPack, PACKAGE_NAME } from './provider-packs.mjs';

export const BRIDGE_PREFIX = 'codex-third-party-worker-task-bridge-';

function getPack(options = {}) {
  if (options.providerPack) return options.providerPack;
  return resolveProviderPack(options.provider ?? DEFAULT_PROVIDER_ID);
}

export function parseThreshold(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 100) {
    throw new Error('provider threshold must be an integer from 0 to 100');
  }
  return number;
}

export function parseBoolean(value, name = 'boolean') {
  if (typeof value === 'boolean') return value;
  const normalized = String(value ?? '').trim().toLowerCase();
  if ([
    'true',
    'yes',
    'y',
    '1',
    'on',
  ].includes(normalized)) return true;
  if ([
    'false',
    'no',
    'n',
    '0',
    'off',
  ].includes(normalized)) return false;
  throw new Error(`${name} must be true or false`);
}

export function getBridgeRoot({ uid, platform, tmpDir, env = process.env } = {}) {
  const user = os.userInfo();
  const resolvedUid = uid ?? (typeof process.getuid === 'function' ? process.getuid() : user.uid);
  const override = env.CODEX_THIRD_PARTY_WORKER_BRIDGE_ROOT ?? env.DEEPSEEK_WORKER_BRIDGE_ROOT;
  if (override) return path.resolve(override);
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
  provider,
  providerPack,
} = {}) {
  const user = os.userInfo();
  const resolvedHome = path.resolve(homeDir ?? os.homedir());
  const resolvedUid = uid ?? (typeof process.getuid === 'function' ? process.getuid() : user.uid);
  const resolvedUsername = username ?? user.username;
  const resolvedNode = nodePath ?? process.execPath;
  const pack = getPack({ providerPack, provider });
  const bridgePath = getBridgeRoot({ uid: resolvedUid, platform, tmpDir, env });
  const codexDir = path.join(resolvedHome, '.codex');
  const runtimeDir = path.join(codexDir, 'lib', pack.files.runtimeDir);
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
    providerPack: pack,
    agentPath: path.join(codexDir, 'agents', pack.agentFile),
    configPath: path.join(codexDir, pack.files.configFile),
    catalogPath: path.join(codexDir, 'model-catalogs', pack.catalog.file),
    preflightPath: path.join(codexDir, 'bin', pack.files.preflightFile),
    bridgeCliPath: path.join(codexDir, 'bin', pack.files.bridgeFile),
    manifestPath: path.join(codexDir, pack.files.manifestFile),
    backupDir: path.join(codexDir, pack.files.backupDir),
    agentsMarkerPath: path.join(codexDir, 'AGENTS.md'),
  };
}

export function assertSupportedPlatform(platform = process.platform) {
  if (platform !== 'darwin') {
    throw new Error('codex-third-party-workers is macOS-only (darwin)');
  }
}

export { PACKAGE_NAME, DEFAULT_PROVIDER_ID as DEFAULT_PROVIDER_ID };

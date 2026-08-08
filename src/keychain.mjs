import { execFile as nodeExecFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(nodeExecFile);

function securityPath(env = process.env) {
  return env.CODEX_THIRD_PARTY_WORKER_SECURITY_BIN || env.DEEPSEEK_WORKER_SECURITY_BIN || '/usr/bin/security';
}

function requireDarwin(platform) {
  if (platform !== 'darwin') {
    throw new Error('macOS Keychain is available only on darwin');
  }
}

/**
 * Check for the Keychain item without asking `security` to print its value.
 */
export async function keychainReady({
  account,
  service,
  platform = process.platform,
  env = process.env,
  execFileImpl = execFile,
} = {}) {
  requireDarwin(platform);
  if (!account) throw new Error('Keychain account is required');
  await execFileImpl(
    securityPath(env),
    ['find-generic-password', '-a', account, '-s', service],
    { encoding: 'utf8', maxBuffer: 1024 * 1024 },
  );
  return true;
}

export function keychainProvisionCommand({ account, service } = {}) {
  if (!account) throw new Error('Keychain account is required');
  return [
    '/usr/bin/security',
    'add-generic-password',
    '-a', account,
    '-s', service,
    '-U',
    '-w',
  ];
}

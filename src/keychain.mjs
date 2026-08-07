import { execFile as nodeExecFile } from 'node:child_process';
import { promisify } from 'node:util';
import { SERVICE_NAME } from './environment.mjs';

const execFile = promisify(nodeExecFile);

function securityPath(env = process.env) {
  return env.DEEPSEEK_WORKER_SECURITY_BIN || '/usr/bin/security';
}

function requireDarwin(platform) {
  if (platform !== 'darwin') {
    throw new Error('macOS Keychain is available only on darwin');
  }
}

/**
 * Check for the Keychain item without asking `security` to print its value.
 * Tests inject execFileImpl and never touch the real Keychain.
 */
export async function keychainReady({
  account,
  service = SERVICE_NAME,
  platform = process.platform,
  env = process.env,
  execFileImpl = execFile,
} = {}) {
  requireDarwin(platform);
  if (!account) throw new Error('Keychain account is required');
  try {
    await execFileImpl(
      securityPath(env),
      ['find-generic-password', '-a', account, '-s', service],
      { encoding: 'utf8', maxBuffer: 1024 * 1024 },
    );
    return true;
  } catch {
    return false;
  }
}

export function keychainProvisionCommand({ account, service = SERVICE_NAME } = {}) {
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

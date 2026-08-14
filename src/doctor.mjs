import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverEnvironment, DEFAULT_PROVIDER_ID } from './environment.mjs';
import { keychainReady } from './keychain.mjs';
import { resolveProviderPack } from './provider-packs.mjs';
import { verify } from './verifier.mjs';

const STATUS = Object.freeze({ PASS: 'PASS', WARN: 'WARN', BLOCKED: 'BLOCKED' });
const VALUE_FLAGS = new Set(['provider', 'model']);
const CODEX_APP_CANDIDATES = Object.freeze([
  '/Applications/Codex.app',
  '/Applications/ChatGPT.app',
  '/opt/homebrew/bin/codex',
  '/usr/local/bin/codex',
]);

function add(checks, name, status, detail) {
  checks.push({ name, status, detail });
}

function mode(info) {
  return info?.mode & 0o777;
}

function maximumStatus(checks) {
  if (checks.some((check) => check.status === STATUS.BLOCKED)) return STATUS.BLOCKED;
  if (checks.some((check) => check.status === STATUS.WARN)) return STATUS.WARN;
  return STATUS.PASS;
}

async function lstat(filePath) {
  try {
    return await fs.lstat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function validRegularFile(info) {
  return Boolean(info?.isFile() && !info.isSymbolicLink());
}

function nodeMajor(version) {
  const match = String(version).match(/^v?(\d+)\./);
  return match ? Number(match[1]) : NaN;
}

async function detectCodexEnvironment(codexDirInfo, options) {
  if (typeof options.codexDetected === 'boolean') return options.codexDetected;
  if (codexDirInfo?.isDirectory() && !codexDirInfo.isSymbolicLink()) return true;
  for (const candidate of options.codexCandidates ?? CODEX_APP_CANDIDATES) {
    if (await lstat(candidate)) return true;
  }
  return false;
}

async function readInstallState(homeDir, env) {
  const info = await lstat(env.manifestPath);
  if (!info) return { installed: false, info: null, manifest: null, error: null };
  if (!validRegularFile(info)) {
    return { installed: false, info, manifest: null, error: 'install manifest is not a regular file' };
  }
  try {
    const manifest = JSON.parse(await fs.readFile(env.manifestPath, 'utf8'));
    if (manifest.schemaVersion !== 1 || manifest.environment?.homeDir !== homeDir) {
      throw new Error('install manifest is incompatible with this environment');
    }
    return { installed: true, info, manifest, error: null };
  } catch {
    return {
      installed: false,
      info,
      manifest: null,
      error: 'install manifest could not be parsed or validated',
    };
  }
}

export function parseDoctorArgs(argv = process.argv.slice(2)) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`unexpected argument: ${token}`);
    const name = token.slice(2);
    if (name === 'help') {
      parsed.help = true;
      continue;
    }
    if (!VALUE_FLAGS.has(name)) throw new Error(`unknown option: --${name}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`--${name} requires a value`);
    parsed[name] = value;
    index += 1;
  }
  return parsed;
}

export async function runDoctor(options = {}) {
  const checks = [];
  const homeDir = path.resolve(options.homeDir ?? os.homedir());
  const platform = options.platform ?? process.platform;
  const baseEnv = discoverEnvironment({
    homeDir,
    platform,
    env: options.env ?? process.env,
    uid: options.uid,
    username: options.username,
  });
  const installState = await readInstallState(homeDir, baseEnv);
  const installedProvider = installState.manifest?.options?.providerId;
  const providerId = String(options.provider ?? installedProvider ?? DEFAULT_PROVIDER_ID).trim().toLowerCase();

  const major = nodeMajor(options.nodeVersion ?? process.version);
  add(
    checks,
    'Node.js',
    Number.isInteger(major) && major >= 20 ? STATUS.PASS : STATUS.BLOCKED,
    Number.isInteger(major) && major >= 20 ? `version ${major} satisfies >=20` : 'Node.js >=20 is required',
  );
  add(checks, 'Operating system', platform === 'darwin' ? STATUS.PASS : STATUS.BLOCKED,
    platform === 'darwin' ? 'macOS detected' : 'macOS is required');

  const codexDirInfo = await lstat(baseEnv.codexDir);
  if (!codexDirInfo) {
    add(checks, 'Codex directory', STATUS.WARN, 'Codex data directory is not present');
  } else if (!codexDirInfo.isDirectory() || codexDirInfo.isSymbolicLink()) {
    add(checks, 'Codex directory', STATUS.BLOCKED, 'Codex data directory is invalid');
  } else {
    add(checks, 'Codex directory', mode(codexDirInfo) & 0o077 ? STATUS.WARN : STATUS.PASS,
      mode(codexDirInfo) & 0o077 ? 'directory is accessible beyond its owner' : 'owner-only directory detected');
  }
  const codexDetected = await detectCodexEnvironment(codexDirInfo, options);
  add(checks, 'Codex environment', codexDetected ? STATUS.PASS : STATUS.BLOCKED,
    codexDetected ? 'Codex installation or data directory detected' : 'Codex Desktop or CLI was not detected');

  const codexConfigInfo = await lstat(path.join(baseEnv.codexDir, 'config.toml'));
  if (!codexConfigInfo) {
    add(checks, 'Codex config', STATUS.WARN, 'config.toml is not present');
  } else if (!validRegularFile(codexConfigInfo)) {
    add(checks, 'Codex config', STATUS.BLOCKED, 'config.toml is not a regular file');
  } else {
    add(checks, 'Codex config', mode(codexConfigInfo) & 0o077 ? STATUS.WARN : STATUS.PASS,
      mode(codexConfigInfo) & 0o077 ? 'config.toml is accessible beyond its owner' : 'config.toml is owner-only');
  }

  let providerPack = null;
  try {
    providerPack = resolveProviderPack(providerId);
    add(checks, 'Provider pack', STATUS.PASS, `${providerPack.displayName} is reviewed and built in`);
  } catch {
    add(checks, 'Provider pack', STATUS.BLOCKED, 'provider is not a reviewed built-in pack');
  }
  const modelMatches = providerPack && (!options.model
    || String(options.model).trim().toLowerCase() === providerPack.model.toLowerCase());
  add(checks, 'Model', modelMatches ? STATUS.PASS : STATUS.BLOCKED,
    modelMatches ? `${providerPack.model} matches the provider pack` : 'model does not match the selected provider pack');

  if (!installState.info) {
    add(checks, 'Installation state', STATUS.WARN, 'provider worker is not installed');
  } else if (installState.error) {
    add(checks, 'Installation state', STATUS.BLOCKED, installState.error);
  } else if (mode(installState.info) !== 0o600) {
    add(checks, 'Installation state', STATUS.BLOCKED, 'install manifest must use mode 0600');
  } else if (options.provider && installedProvider !== providerId) {
    add(checks, 'Installation state', STATUS.BLOCKED, 'installed provider differs from the selected provider');
  } else {
    add(checks, 'Installation state', STATUS.PASS, 'provider worker manifest is installed');
  }

  const lunaInfo = await lstat(path.join(baseEnv.codexDir, 'agents', 'luna_worker.toml'));
  add(checks, 'OpenAI fallback', validRegularFile(lunaInfo) ? STATUS.PASS : STATUS.WARN,
    validRegularFile(lunaInfo)
      ? 'luna_worker definition detected'
      : 'luna_worker was not detected; confirm Spark or Luna availability before install');

  if (providerPack && platform === 'darwin') {
    try {
      const present = await (options.keychainReadyImpl ?? keychainReady)({
        account: baseEnv.keychainAccount,
        service: providerPack.keychainService,
        platform,
        env: options.env ?? process.env,
        execFileImpl: options.execFileImpl,
      });
      add(checks, 'Keychain credential', present ? STATUS.PASS : STATUS.BLOCKED,
        `provider credential is ${present ? 'present' : 'missing'}`);
    } catch {
      add(checks, 'Keychain credential', STATUS.BLOCKED, 'provider credential is missing');
    }
  } else {
    add(checks, 'Keychain credential', STATUS.WARN, 'credential check is unavailable');
  }

  if (installState.installed && providerPack && installedProvider === providerId) {
    try {
      const result = await (options.verifyImpl ?? verify)({
        provider: providerId,
        checkKeychain: false,
        env: options.env ?? process.env,
        platform,
        homeDir,
      });
      add(checks, 'Verify prerequisites', result.configured ? STATUS.PASS : STATUS.BLOCKED,
        result.configured ? 'local configuration checks are clean' : `${result.issues.length} local configuration issue(s) found`);
    } catch {
      add(checks, 'Verify prerequisites', STATUS.BLOCKED, 'local configuration checks could not complete');
    }
  } else {
    add(checks, 'Verify prerequisites', STATUS.WARN, 'install the selected worker before running full verify');
  }

  const summary = Object.fromEntries(Object.values(STATUS).map((status) => [
    status,
    checks.filter((check) => check.status === status).length,
  ]));
  return {
    status: maximumStatus(checks),
    summary,
    provider: providerPack?.id ?? 'unsupported',
    model: providerPack?.model ?? null,
    installed: installState.installed,
    checks,
  };
}

export function formatDoctorSummary(report) {
  const outcome = report.summary.BLOCKED
    ? `${report.summary.BLOCKED} blocker(s) must be resolved before installation`
    : 'Ready for dry-run';
  return [
    ...report.checks.map((check) => `${check.status}  ${check.name}: ${check.detail}`),
    '',
    `Summary: ${outcome}`,
    `Checks: PASS=${report.summary.PASS}, WARN=${report.summary.WARN}, BLOCKED=${report.summary.BLOCKED}`,
  ].join('\n');
}

export function doctorHelp() {
  return 'Usage: npm run doctor -- [--provider <deepseek|minimax|qwen>] [--model <model>]\n';
}

export async function doctorCli(argv = process.argv.slice(2)) {
  try {
    const parsed = parseDoctorArgs(argv);
    if (parsed.help) return process.stdout.write(doctorHelp());
    const report = await runDoctor(parsed);
    process.stdout.write(`${formatDoctorSummary(report)}\n`);
    if (report.summary.BLOCKED) process.exitCode = 1;
  } catch {
    process.stderr.write('Doctor failed: invalid options or unreadable local state\n');
    process.exitCode = 1;
  }
}

export const { PASS, WARN, BLOCKED } = STATUS;

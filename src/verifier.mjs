import path from 'node:path';
import { catalogIsSafe } from './catalog.mjs';
import { discoverEnvironment } from './environment.mjs';
import { fs, lstatIfExists, sha256File } from './fs-utils.mjs';
import { keychainReady } from './keychain.mjs';
import { extractAgentsBlock } from './templates.mjs';
import { resolveProviderPack, DEFAULT_PROVIDER_ID as PACK_DEFAULT } from './provider-packs.mjs';

const RUNTIME_FILES = [
  'bridge.mjs',
  'bridge-cli.mjs',
  'catalog.mjs',
  'environment.mjs',
  'fs-utils.mjs',
  'keychain.mjs',
  'preflight-runtime.mjs',
  'provider-packs.mjs',
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

async function readManifest(env) {
  const info = await lstatIfExists(env.manifestPath);
  if (!info) return null;
  if (info.isSymbolicLink() || !info.isFile() || (info.mode & 0o777) !== 0o600) {
    throw new Error('install manifest must be a regular owner-only file');
  }
  const manifest = JSON.parse(await fs.readFile(env.manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.environment?.homeDir !== env.homeDir) {
    throw new Error('install manifest is incompatible with this home directory');
  }
  return manifest;
}

export async function verify(options = {}) {
  const env = discoverEnvironment({ provider: options.provider ?? PACK_DEFAULT, ...options, env: options.env ?? process.env });
  const issues = [];
  const warnings = [];
  let manifest;
  try {
    manifest = await readManifest(env);
  } catch (error) {
    return { configured: false, runtimeVerified: false, issues: [error.message], warnings, environment: env };
  }

  if (!manifest) {
    return {
      configured: false,
      runtimeVerified: false,
      issues: ['install manifest is missing'],
      warnings,
      environment: env,
    };
  }

  const providerId = manifest.options?.providerId ?? env.providerPack?.id ?? PACK_DEFAULT;
  let providerPack;
  try {
    providerPack = resolveProviderPack(providerId);
  } catch {
    issues.push(`unknown provider pack in manifest: ${providerId}`);
  }

  const allowed = allowedPaths(env);
  const recorded = new Set();
  for (const record of manifest.managedFiles ?? []) {
    if (!allowed.has(record.path)) {
      issues.push(`manifest contains an unmanaged path: ${record.path}`);
      continue;
    }
    if (recorded.has(record.path)) {
      issues.push(`manifest contains a duplicate managed path: ${record.path}`);
      continue;
    }
    recorded.add(record.path);
    const info = await lstatIfExists(record.path);
    if (!info || info.isSymbolicLink() || !info.isFile()) {
      issues.push(`managed file is missing or invalid: ${record.path}`);
      continue;
    }
    if ((info.mode & 0o777) !== record.mode) {
      issues.push(`managed file mode changed: ${record.path}`);
    }
    if (record.kind === 'agents-marker') {
      try {
        const source = await fs.readFile(record.path, 'utf8');
        if (extractAgentsBlock(source) !== manifest.agentsBlock) {
          issues.push('managed AGENTS.md block changed');
        }
      } catch (error) {
        issues.push(`could not validate AGENTS.md marker: ${error.message}`);
      }
    } else if (await sha256File(record.path) !== record.hash) {
      issues.push(`managed file content changed: ${record.path}`);
    }
  }
  for (const required of allowed) {
    if (!recorded.has(required)) issues.push(`manifest is missing a managed path: ${required}`);
  }

  try {
    const catalog = JSON.parse(await fs.readFile(env.catalogPath, 'utf8'));
    if (providerPack && !catalogIsSafe(catalog, providerPack.catalog)) {
      issues.push('runtime catalog is not safe for this provider pack');
    }
  } catch {
    issues.push('runtime catalog is missing or invalid');
  }

  try {
    const config = JSON.parse(await fs.readFile(env.configPath, 'utf8'));
    if (config.providerId !== providerId) issues.push('runtime config provider id is invalid');
    if (providerPack && config.model !== providerPack.model) issues.push('runtime config model is invalid');
    if (config.providerRole && config.providerRole !== providerPack?.role) issues.push('runtime config provider role is invalid');
  } catch {
    issues.push('worker config is missing or invalid');
  }

  let credentialReady = null;
  if (options.checkKeychain !== false) {
    try {
      const check = options.keychainReadyImpl ?? keychainReady;
      const keychainService = providerPack?.keychainService ?? (manifest.secretStorage?.service ?? null);
      if (!keychainService) {
        issues.push('cannot verify keychain service for this provider');
      } else {
        credentialReady = await check({
          account: env.keychainAccount,
          service: keychainService,
          platform: options.platform ?? process.platform,
          env: options.env ?? process.env,
          execFileImpl: options.execFileImpl,
        });
        if (!credentialReady) issues.push(`provider keychain credential for ${providerId} is unavailable`);
      }
    } catch {
      issues.push('provider keychain credential could not be checked');
    }
  } else {
    warnings.push('Keychain credential check was skipped');
  }
  warnings.push('No live Codex subagent task was run; runtime remains unverified');

  return {
    configured: issues.length === 0,
    runtimeVerified: false,
    credentialReady,
    issues,
    warnings,
    environment: env,
    manifest,
  };
}

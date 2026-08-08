import { DEFAULT_MAX_CATALOG_BYTES } from './catalog.mjs';

export const PACKAGE_NAME = 'codex-third-party-workers';
export const DEFAULT_PROVIDER_ID = 'deepseek';

export const PROVIDER_CAPABILITIES = Object.freeze({
  TEXT: 'text',
  CODE: 'code',
  RESEARCH: 'research-synthesis',
  VALIDATION: 'local-validation',
});

function toPredicate(pattern) {
  if (!pattern) return null;
  if (pattern instanceof RegExp) return (value) => pattern.test(value);
  if (typeof pattern === 'function') return pattern;
  if (typeof pattern === 'string') {
    const lower = pattern.toLowerCase();
    return (value) => String(value ?? '').toLowerCase().includes(lower);
  }
  return null;
}

function toSet(values) {
  return new Set((values ?? []).map((value) => String(value ?? '')));
}

export const DEEPSEEK_V4_FLASH_ID = 'deepseek-v4-flash';

const deepseekPack = {
  id: 'deepseek',
  displayName: 'DeepSeek',
  role: 'deepseek_worker',
  model: DEEPSEEK_V4_FLASH_ID,
  modelProvider: 'deepseek',
  modelProviderName: 'DeepSeek',
  apiBase: 'https://api.deepseek.com/',
  wireApi: 'responses',
  keychainService: 'codex-deepseek-api-key',
  catalogSourceHint: 'https://cdn.deepseek.com/api-docs/codex-deepseek-setup.sh',
  setupScriptHost: /(^|\.)deepseek\.com$/i,
  catalog: {
    file: DEEPSEEK_V4_FLASH_ID + '.json',
    modelId: DEEPSEEK_V4_FLASH_ID,
    rejectIf: toPredicate(/v4-pro/i),
    requiredModalities: toSet(['text']),
    extraMaxBytes: DEFAULT_MAX_CATALOG_BYTES,
  },
  capabilities: {
    supported: toSet([
      PROVIDER_CAPABILITIES.TEXT,
      PROVIDER_CAPABILITIES.CODE,
      PROVIDER_CAPABILITIES.RESEARCH,
      PROVIDER_CAPABILITIES.VALIDATION,
    ]),
    unsuitable: toSet([
      'images',
      'image',
      'audio',
      'video',
      'browser',
      'desktop',
      'mcp',
      'computer use',
    ]),
  },
  agentFile: 'deepseek_worker.toml',
  files: {
    preflightFile: 'subagent-preflight.mjs',
    bridgeFile: 'codex-third-party-worker-bridge.mjs',
    runtimeDir: 'codex-third-party-workers',
    configFile: 'codex-third-party-workers.json',
    manifestFile: 'codex-third-party-workers-install.json',
    backupDir: 'codex-third-party-workers-backups',
  },
  prompt: {
    roleLine: 'Fallback worker for bounded text, code, research synthesis, and local validation with DeepSeek.',
  },
  thresholds: {
    plus: 50,
    pro: 10,
  },
};

const BUILTIN_PACKS = Object.freeze([deepseekPack]);

export function listProviderPackIds() {
  return BUILTIN_PACKS.map((pack) => pack.id);
}

export function resolveProviderPack(value = DEFAULT_PROVIDER_ID) {
  const providerId = String(value ?? '').trim().toLowerCase();
  if (!providerId) throw new Error('provider is required');
  const found = BUILTIN_PACKS.find((pack) => pack.id === providerId);
  if (!found) throw new Error(`unsupported provider: ${providerId}`);
  return found;
}

export { deepseekPack as BUILTIN_PROVIDER_PACK, BUILTIN_PACKS };

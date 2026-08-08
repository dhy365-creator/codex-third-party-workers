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
export const MINIMAX_M3_ID = 'MiniMax-M3';
export const QWEN_3_7_MAX_ID = 'qwen3.7-max';

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
  catalogSourceHost: /(^|\.)deepseek\.com$/i,
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

const minimaxPack = {
  id: 'minimax',
  displayName: 'MiniMax',
  role: 'minimax_worker',
  model: MINIMAX_M3_ID,
  modelProvider: 'minimax',
  modelProviderName: 'MiniMax',
  modelContextWindow: 1000000,
  apiBase: 'https://api.minimaxi.com/v1',
  wireApi: 'responses',
  keychainService: 'codex-minimax-api-key',
  catalogSourceHint: 'https://platform.minimaxi.com/docs/token-plan/codex.md',
  catalogSourceHost: /(^|\.)minimaxi\.com$/i,
  catalog: {
    file: 'minimax-m3.json',
    modelId: MINIMAX_M3_ID,
    requiredModalities: toSet(['text']),
    outputModalities: toSet(['text']),
    sourceFormat: 'markdown-json',
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
  agentFile: 'minimax_worker.toml',
  files: {
    preflightFile: 'subagent-preflight.mjs',
    bridgeFile: 'codex-third-party-worker-bridge.mjs',
    runtimeDir: 'codex-third-party-workers',
    configFile: 'codex-third-party-workers.json',
    manifestFile: 'codex-third-party-workers-install.json',
    backupDir: 'codex-third-party-workers-backups',
  },
  prompt: {
    roleLine: 'Fallback worker for bounded text, code, research synthesis, and local validation with MiniMax.',
  },
  thresholds: {
    plus: 50,
    pro: 10,
  },
};

const qwenPack = {
  id: 'qwen',
  displayName: 'Qwen',
  role: 'qwen_worker',
  model: QWEN_3_7_MAX_ID,
  modelProvider: 'qwen',
  modelProviderName: 'Alibaba Cloud Model Studio',
  modelContextWindow: 1000000,
  apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  wireApi: 'responses',
  keychainService: 'codex-qwen-api-key',
  catalogSourceHint: 'https://help.aliyun.com/zh/model-studio/qwen3-7-max',
  catalogSourceHost: /(^|\.)aliyun\.com$/i,
  catalog: {
    file: 'qwen3.7-max.json',
    modelId: QWEN_3_7_MAX_ID,
    requiredModalities: toSet(['text']),
    outputModalities: toSet(['text']),
    sourceFormat: 'aliyun-qwen-model-doc',
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
  agentFile: 'qwen_worker.toml',
  files: {
    preflightFile: 'subagent-preflight.mjs',
    bridgeFile: 'codex-third-party-worker-bridge.mjs',
    runtimeDir: 'codex-third-party-workers',
    configFile: 'codex-third-party-workers.json',
    manifestFile: 'codex-third-party-workers-install.json',
    backupDir: 'codex-third-party-workers-backups',
  },
  prompt: {
    roleLine: 'Fallback worker for bounded text, code, research synthesis, and local validation with Qwen.',
  },
  thresholds: {
    plus: 50,
    pro: 10,
  },
};

const BUILTIN_PACKS = Object.freeze([deepseekPack, minimaxPack, qwenPack]);

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

export { deepseekPack as BUILTIN_PROVIDER_PACK, BUILTIN_PACKS, minimaxPack, qwenPack };

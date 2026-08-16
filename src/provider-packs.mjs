import { DEFAULT_MAX_CATALOG_BYTES } from './catalog.mjs';

export const PACKAGE_NAME = 'codex-third-party-subagents';
// Keep the beta.2 on-disk namespace stable so existing installs remain
// discoverable, verifiable, and safely uninstallable after the public rename.
export const RUNTIME_NAMESPACE = 'codex-third-party-workers';
export const DEFAULT_PROVIDER_ID = 'deepseek';

export const PROVIDER_CAPABILITIES = Object.freeze({
  TEXT: 'text',
  CODE: 'code',
  RESEARCH: 'research-synthesis',
  VALIDATION: 'local-validation',
});

function toSet(values) {
  return new Set((values ?? []).map((value) => String(value ?? '')));
}

export const DEEPSEEK_V4_FLASH_ID = 'deepseek-v4-flash';
export const DEEPSEEK_V4_PRO_ID = 'deepseek-v4-pro';
export const MINIMAX_M3_ID = 'MiniMax-M3';
export const QWEN_3_7_MAX_ID = 'qwen3.7-max';

const DEEPSEEK_PROFILE_FLASH = 'flash';
const DEEPSEEK_PROFILE_PRO = 'pro';

const SHARED_RUNTIME_FILES = Object.freeze({
  preflightFile: 'subagent-preflight.mjs',
  bridgeFile: 'codex-third-party-worker-bridge.mjs',
  runtimeDir: RUNTIME_NAMESPACE,
  configFile: `${RUNTIME_NAMESPACE}.json`,
  manifestFile: `${RUNTIME_NAMESPACE}-install.json`,
  backupDir: `${RUNTIME_NAMESPACE}-backups`,
});

const deepseekPack = {
  id: 'deepseek',
  displayName: 'DeepSeek',
  defaultProfile: DEEPSEEK_PROFILE_FLASH,
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
    requiredModalities: toSet(['text']),
    extraMaxBytes: DEFAULT_MAX_CATALOG_BYTES,
  },
  profiles: Object.freeze([
    Object.freeze({
      id: DEEPSEEK_PROFILE_FLASH,
      aliases: Object.freeze([DEEPSEEK_PROFILE_FLASH, DEEPSEEK_V4_FLASH_ID]),
      role: 'deepseek_worker',
      model: DEEPSEEK_V4_FLASH_ID,
      agentFile: 'deepseek_worker.toml',
      catalog: Object.freeze({
        file: DEEPSEEK_V4_FLASH_ID + '.json',
        modelId: DEEPSEEK_V4_FLASH_ID,
      }),
      prompt: Object.freeze({
        roleLine: 'Default DeepSeek fallback worker for bounded text, code, research synthesis, and local validation.',
      }),
    }),
    Object.freeze({
      id: DEEPSEEK_PROFILE_PRO,
      aliases: Object.freeze([DEEPSEEK_PROFILE_PRO, DEEPSEEK_V4_PRO_ID]),
      role: 'deepseek_pro_worker',
      model: DEEPSEEK_V4_PRO_ID,
      agentFile: 'deepseek_pro_worker.toml',
      catalog: Object.freeze({
        file: DEEPSEEK_V4_PRO_ID + '.json',
        modelId: DEEPSEEK_V4_PRO_ID,
      }),
      prompt: Object.freeze({
        roleLine: 'Explicit-only DeepSeek V4 Pro worker for bounded text, code, research synthesis, and local validation.',
      }),
    }),
  ]),
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
  files: SHARED_RUNTIME_FILES,
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
  files: SHARED_RUNTIME_FILES,
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
  files: SHARED_RUNTIME_FILES,
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

function profilesFor(pack) {
  if (Array.isArray(pack.profiles) && pack.profiles.length) return pack.profiles;
  return [{
    id: 'default',
    aliases: [pack.model],
    role: pack.role,
    model: pack.model,
    agentFile: pack.agentFile,
    catalog: pack.catalog,
    prompt: pack.prompt,
  }];
}

function resolveProfile(pack, model) {
  const profiles = profilesFor(pack);
  const selection = String(model ?? '').trim().toLowerCase();
  if (!selection) {
    const defaultId = String(pack.defaultProfile ?? profiles[0].id).toLowerCase();
    return profiles.find((profile) => String(profile.id).toLowerCase() === defaultId) ?? profiles[0];
  }
  const selected = profiles.find((profile) => [
    profile.id,
    profile.model,
    ...(profile.aliases ?? []),
  ].some((candidate) => String(candidate).toLowerCase() === selection));
  if (!selected) throw new Error(`unsupported model for ${pack.id}: ${model}`);
  return selected;
}

function withProfile(pack, profile) {
  return Object.freeze({
    ...pack,
    profile: profile.id,
    role: profile.role ?? pack.role,
    model: profile.model ?? pack.model,
    agentFile: profile.agentFile ?? pack.agentFile,
    catalog: { ...pack.catalog, ...profile.catalog },
    prompt: { ...pack.prompt, ...profile.prompt },
  });
}

export function resolveProviderPack(value = DEFAULT_PROVIDER_ID, model) {
  const providerId = String(value ?? '').trim().toLowerCase();
  if (!providerId) throw new Error('provider is required');
  const found = BUILTIN_PACKS.find((pack) => pack.id === providerId);
  if (!found) throw new Error(`unsupported provider: ${providerId}`);
  return withProfile(found, resolveProfile(found, model));
}

export function listProviderPackProfiles(value = DEFAULT_PROVIDER_ID) {
  const providerId = String(value ?? '').trim().toLowerCase();
  if (!providerId) throw new Error('provider is required');
  const found = BUILTIN_PACKS.find((pack) => pack.id === providerId);
  if (!found) throw new Error(`unsupported provider: ${providerId}`);
  return profilesFor(found).map((profile) => withProfile(found, profile));
}

export function resolveProviderPackByRole(value, role) {
  const targetRole = String(role ?? '').trim();
  if (!targetRole) throw new Error('provider role is required');
  const found = listProviderPackProfiles(value).find((profile) => profile.role === targetRole);
  if (!found) throw new Error(`unsupported provider role: ${targetRole}`);
  return found;
}

export { deepseekPack as BUILTIN_PROVIDER_PACK, BUILTIN_PACKS, minimaxPack, qwenPack };

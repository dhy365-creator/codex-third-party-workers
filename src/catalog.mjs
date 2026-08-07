import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SETUP_SCRIPT_URL } from './environment.mjs';

export const DEFAULT_MAX_CATALOG_BYTES = 2 * 1024 * 1024;
export const DEEPSEEK_FLASH_ID = 'deepseek-v4-flash';
const HEREDOC_MARKER = 'CODEX_MODELS_JSON';

function modelEntries(document) {
  if (!document || typeof document !== 'object') return [];
  if (Array.isArray(document)) return document;
  if (Array.isArray(document.models)) return document.models;
  if (document.models && typeof document.models === 'object') {
    return Object.values(document.models);
  }
  if (Array.isArray(document.model_catalog)) return document.model_catalog;
  if (document.catalog) return modelEntries(document.catalog);
  return [];
}

function modelId(model) {
  if (!model || typeof model !== 'object') return '';
  return String(model.slug ?? model.id ?? model.model ?? model.name ?? '').toLowerCase();
}

function parseDocument(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractOfficialHeredoc(text) {
  const startPattern = new RegExp(`<<['\"]?${HEREDOC_MARKER}['\"]?\\r?\\n`);
  const match = startPattern.exec(text);
  if (!match) return null;
  const payloadStart = match.index + match[0].length;
  const rest = text.slice(payloadStart);
  const lines = rest.split(/\r?\n/);
  const end = lines.findIndex((line) => line.trim() === HEREDOC_MARKER);
  if (end < 0) throw new Error('official catalog heredoc is not terminated');
  return lines.slice(0, end).join('\n');
}

export function findFlashModel(document) {
  const entries = modelEntries(document);
  const flash = entries.find((entry) => modelId(entry) === DEEPSEEK_FLASH_ID);
  if (!flash) {
    if (entries.some((entry) => modelId(entry).includes('v4-pro'))) {
      throw new Error('DeepSeek V4 Pro is not supported');
    }
    throw new Error('catalog does not contain deepseek-v4-flash');
  }
  const selected = { ...flash, slug: DEEPSEEK_FLASH_ID };
  if (selected.input_modalities) {
    const modalities = selected.input_modalities.map((value) => String(value).toLowerCase());
    if (!modalities.includes('text') || modalities.some((value) => value !== 'text')) {
      throw new Error('deepseek-v4-flash catalog must be text-only');
    }
  }
  return selected;
}

export function validateAndReduceCatalog(document) {
  const selected = findFlashModel(document);
  if (modelId(selected) !== DEEPSEEK_FLASH_ID) {
    throw new Error('catalog model identity changed unexpectedly');
  }
  const reduced = { models: [selected] };
  if (JSON.stringify(reduced).toLowerCase().includes('deepseek-v4-pro')) {
    throw new Error('reduced catalog unexpectedly contains DeepSeek V4 Pro');
  }
  return reduced;
}

export function extractCatalogFromScript(scriptText) {
  const text = typeof scriptText === 'string' ? scriptText : String(scriptText ?? '');
  if (Buffer.byteLength(text, 'utf8') > DEFAULT_MAX_CATALOG_BYTES) {
    throw new Error('DeepSeek setup script exceeds the catalog size limit');
  }
  const direct = parseDocument(text.trim());
  if (direct) return validateAndReduceCatalog(direct);
  const heredoc = extractOfficialHeredoc(text);
  if (!heredoc) {
    throw new Error('could not find the official CODEX_MODELS_JSON heredoc');
  }
  const embedded = parseDocument(heredoc.trim());
  if (!embedded) throw new Error('official embedded model catalog is invalid JSON');
  return validateAndReduceCatalog(embedded);
}

async function readSource(source, maxBytes) {
  const resolved = source.startsWith('file://') ? fileURLToPath(source) : path.resolve(source);
  const data = await fs.readFile(resolved);
  if (data.byteLength > maxBytes) throw new Error('catalog source exceeds the size limit');
  return { text: data.toString('utf8'), resolved };
}

function assertOfficialUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !/(^|\.)deepseek\.com$/i.test(url.hostname)) {
    throw new Error('setup script URL must use HTTPS on an official deepseek.com host');
  }
  return url.href;
}

async function fetchText(url, { fetchImpl, maxBytes }) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
  const response = await fetchImpl(url, { redirect: 'follow' });
  if (!response?.ok) {
    throw new Error(`DeepSeek setup script download failed (${response?.status ?? 'unknown'})`);
  }
  const length = Number(response.headers?.get?.('content-length') ?? 0);
  if (length > maxBytes) throw new Error('DeepSeek setup script exceeds the catalog size limit');
  const data = Buffer.from(await response.arrayBuffer());
  if (data.byteLength > maxBytes) throw new Error('DeepSeek setup script exceeds the catalog size limit');
  return data.toString('utf8');
}

export async function acquireCatalog({
  source = 'auto',
  setupScriptUrl = DEFAULT_SETUP_SCRIPT_URL,
  fetchImpl = globalThis.fetch,
  maxBytes = DEFAULT_MAX_CATALOG_BYTES,
} = {}) {
  if (source && source !== 'auto') {
    const local = await readSource(source, maxBytes);
    return {
      catalog: extractCatalogFromScript(local.text),
      source: local.resolved,
      fetched: false,
    };
  }
  const officialUrl = assertOfficialUrl(setupScriptUrl);
  const text = await fetchText(officialUrl, { fetchImpl, maxBytes });
  return {
    catalog: extractCatalogFromScript(text),
    source: officialUrl,
    fetched: true,
  };
}

export function catalogJson(catalog) {
  return `${JSON.stringify(validateAndReduceCatalog(catalog), null, 2)}\n`;
}

export function catalogIsSafe(catalog) {
  try {
    const reduced = validateAndReduceCatalog(catalog);
    return reduced.models.length === 1 && modelId(reduced.models[0]) === DEEPSEEK_FLASH_ID;
  } catch {
    return false;
  }
}

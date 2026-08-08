import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_MAX_CATALOG_BYTES = 2 * 1024 * 1024;
export const DEFAULT_MAX_CATALOG_REDIRECTS = 5;

function parseDocument(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

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

const HEREDOC_MARKER = 'CODEX_MODELS_JSON';

function extractOfficialHeredoc(text) {
  const pattern = new RegExp(`<<['\"]?${HEREDOC_MARKER}['\"]?\\r?\\n`);
  const match = pattern.exec(text);
  if (!match) return null;
  const payloadStart = match.index + match[0].length;
  const rest = text.slice(payloadStart);
  const lines = rest.split(/\r?\n/);
  const end = lines.findIndex((line) => line.trim() === HEREDOC_MARKER);
  if (end < 0) throw new Error('official catalog heredoc is not terminated');
  return lines.slice(0, end).join('\n');
}

function assertWithinSize(text, maxBytes) {
  if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
    throw new Error('catalog size limit must be positive');
  }
  if (Buffer.byteLength(text, 'utf8') > maxBytes) {
    throw new Error('setup script exceeds the catalog size limit');
  }
}

function assertTextOnlyModalities(model, required) {
  const modalities = (model?.input_modalities ?? []).map((value) => String(value).toLowerCase());
  if (!Array.isArray(modalities) || modalities.length === 0) {
    throw new Error('selected model must include input modalities');
  }
  const requiredSet = required instanceof Set
    ? required
    : new Set((required ?? ['text']).map((value) => String(value).toLowerCase()));
  if (requiredSet.size === 0) requiredSet.add('text');
  const hasAllowedRequired = requiredSet.has('text')
    ? modalities.includes('text')
    : modalities.some((value) => requiredSet.has(value));
  if (!hasAllowedRequired || modalities.some((value) => !requiredSet.has(value))) {
    throw new Error('selected model must be text-only');
  }
}

function rejectIfAny(entries, rejectIf) {
  if (!rejectIf) return false;
  if (typeof rejectIf === 'function') {
    return entries.some((entry) => rejectIf(modelId(entry)));
  }
  if (rejectIf instanceof RegExp) {
    return entries.some((entry) => rejectIf.test(modelId(entry)));
  }
  return false;
}

export function reduceCatalogForProvider(document, options = {}) {
  const entries = modelEntries(document);
  const targetModel = String(options.modelId ?? '').toLowerCase();
  if (!targetModel) throw new Error('catalog policy must include modelId');
  const selected = entries.find((entry) => modelId(entry) === targetModel);
  if (!selected) {
    if (rejectIfAny(entries, options.rejectIf)) {
      throw new Error('unsupported provider model variant is present');
    }
    throw new Error(`catalog does not contain ${targetModel}`);
  }
  assertTextOnlyModalities(selected, options.requiredModalities);
  const reduced = { models: [{ ...selected, slug: targetModel }] };
  return reduced;
}

export function extractCatalogFromScript(scriptText) {
  const text = typeof scriptText === 'string' ? scriptText : String(scriptText ?? '');
  assertWithinSize(text, DEFAULT_MAX_CATALOG_BYTES);
  const direct = parseDocument(text.trim());
  if (direct) return direct;
  const heredoc = extractOfficialHeredoc(text);
  if (!heredoc) throw new Error('could not find the official CODEX_MODELS_JSON heredoc');
  const embedded = parseDocument(heredoc.trim());
  if (!embedded) throw new Error('official embedded model catalog is invalid JSON');
  return embedded;
}

export async function acquireCatalog({
  source = 'auto',
  setupScriptUrl,
  fetchImpl = globalThis.fetch,
  maxBytes = DEFAULT_MAX_CATALOG_BYTES,
  validateHost,
  reduce,
} = {}) {
  if (typeof reduce !== 'function') {
    throw new Error('catalog reducer is required');
  }

  if (source && source !== 'auto') {
    const resolved = source.startsWith('file://') ? fileURLToPath(source) : path.resolve(source);
    const data = await fs.readFile(resolved);
    if (data.byteLength > maxBytes) throw new Error('catalog source exceeds the size limit');
    return {
      catalog: reduce(extractCatalogFromScript(data.toString('utf8'))),
      source: resolved,
      fetched: false,
    };
  }

  if (typeof setupScriptUrl !== 'string' || !setupScriptUrl.trim()) {
    throw new Error('setup script URL is required');
  }
  if (typeof validateHost !== 'function') {
    throw new Error('catalog host validator is required');
  }

  let currentUrl = new URL(validateHost(setupScriptUrl));
  let response;
  for (let redirects = 0; redirects <= DEFAULT_MAX_CATALOG_REDIRECTS; redirects++) {
    response = await fetchImpl(currentUrl.href, { redirect: 'manual' });
    const status = Number(response?.status ?? 0);
    const location = response?.headers?.get?.('location') ?? null;
    if (status >= 300 && status < 400) {
      if (!location) {
        throw new Error('catalog redirect is missing Location header');
      }
      if (redirects >= DEFAULT_MAX_CATALOG_REDIRECTS) {
        throw new Error('catalog redirect count exceeded');
      }
      currentUrl = new URL(validateHost(new URL(location, currentUrl.href).href));
      continue;
    }
    break;
  }

  const responseUrl = typeof response?.url === 'string' && response.url ? response.url : currentUrl.href;
  currentUrl = new URL(validateHost(responseUrl));

  if (!response || !response.ok) {
    throw new Error(`catalog download failed (${response?.status ?? 'unknown'})`);
  }
  const length = Number(response.headers?.get?.('content-length') ?? 0);
  if (length > maxBytes) throw new Error('catalog source exceeds the size limit');
  const data = Buffer.from(await response.arrayBuffer());
  if (data.byteLength > maxBytes) throw new Error('catalog source exceeds the size limit');
  return {
    catalog: reduce(extractCatalogFromScript(data.toString('utf8'))),
    source: currentUrl.href,
    fetched: true,
  };
}

export function catalogJson(catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

export function catalogIsSafe(catalog, options) {
  try {
    const reduced = reduceCatalogForProvider(catalog, options);
    return reduced.models.length === 1 && modelId(reduced.models[0]) === String(options?.modelId ?? '').toLowerCase();
  } catch {
    return false;
  }
}

export { parseDocument, modelEntries, modelId };

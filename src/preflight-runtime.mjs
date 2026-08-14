import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { catalogIsSafe } from './catalog.mjs';
import {
  BridgeBusyError,
  bridgeBusy,
  createBridgeTask,
  hasArchivedBridgeTask,
} from './bridge.mjs';
import { keychainReady } from './keychain.mjs';
import { resolveProviderPack, DEFAULT_PROVIDER_ID } from './provider-packs.mjs';
import { chooseRoute, ROLES, validatePreflightInput } from './routing.mjs';

const FALLBACK_AGENT = 'codex-third-party-workers';

function codexBinary(env = process.env) {
  const candidates = [
    env.CODEX_CLI_PATH,
    '/Applications/ChatGPT.app/Contents/Resources/codex',
    '/opt/homebrew/bin/codex',
    '/usr/local/bin/codex',
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? 'codex';
}

export function readRateLimitsFromAppServer({ env = process.env, timeoutMs = 7000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(codexBinary(env), ['app-server', '--stdio'], {
      stdio: ['pipe', 'pipe', 'ignore'],
      env,
    });
    let buffer = '';
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill();
      if (error) reject(error);
      else resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('rate-limit query timed out')), timeoutMs);
    child.on('error', (error) => finish(error));
    child.on('close', () => {
      if (!settled) finish(new Error('app-server exited before rate limits arrived'));
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line);
          if (message.id !== 2) continue;
          if (message.error) finish(new Error('rate-limit query failed'));
          else finish(null, message.result);
          return;
        } catch {
          // Ignore malformed lines.
        }
      }
    });
    child.stdin.write(`${JSON.stringify({
      method: 'initialize',
      id: 1,
      params: { clientInfo: { name: FALLBACK_AGENT, version: '0.4.0-beta.2' } },
    })}\n`);
    child.stdin.write(`${JSON.stringify({ method: 'account/rateLimits/read', id: 2 })}\n`);
  });
}

function remainingPercent(bucket) {
  if (!bucket || typeof bucket !== 'object') return null;
  const used = [bucket.primary, bucket.secondary]
    .map((window) => window?.usedPercent)
    .filter((value) => Number.isFinite(value));
  if (!used.length) return null;
  return Math.max(0, Math.min(100, 100 - Math.max(...used)));
}

export function quotaSnapshot(result) {
  const byId = result?.rateLimitsByLimitId ?? {};
  const buckets = Object.values(byId);
  const generalBucket = byId.codex ?? result?.rateLimits ?? null;
  const sparkBucket = buckets.find((bucket) => {
    const identity = `${bucket?.limitId ?? ''} ${bucket?.limitName ?? ''}`;
    return /spark|bengalfox/i.test(identity);
  });
  return {
    sparkRemaining: remainingPercent(sparkBucket),
    generalRemaining: remainingPercent(generalBucket),
  };
}

async function installedProviderReady(config, deps = {}) {
  const providerPack = resolveProviderPack(config.providerId ?? DEFAULT_PROVIDER_ID);
  const filesExist = deps.existsSync ?? existsSync;
  if (![config.agentPath, config.catalogPath, config.configPath].every((file) => filesExist(file))) {
    return false;
  }
  try {
    const catalog = JSON.parse(await fs.readFile(config.catalogPath, 'utf8'));
    if (!catalogIsSafe(catalog, providerPack.catalog)) return false;
  } catch {
    return false;
  }
  const check = deps.keychainReadyImpl ?? keychainReady;
  return check({
    account: config.keychainAccount,
    service: providerPack.keychainService,
    platform: config.platform ?? process.platform,
    env: deps.env ?? process.env,
    execFileImpl: deps.execFileImpl,
  });
}

async function routingState(config, deps = {}) {
  let quota = { sparkRemaining: null, generalRemaining: null };
  try {
    const read = deps.readRateLimits ?? readRateLimitsFromAppServer;
    quota = quotaSnapshot(await read({ env: deps.env ?? process.env }));
  } catch {
    // Unknown quota must keep an OpenAI role.
  }
  let providerReady = false;
  try {
    providerReady = await installedProviderReady(config, deps);
  } catch {
    // Provider readiness check failure means unavailable fallback provider.
  }
  let busy = true;
  try {
    busy = await (deps.bridgeBusyImpl ?? bridgeBusy)({ root: config.bridgePath });
  } catch {
    // Invalid bridge state fails closed.
  }
  return { ...quota, providerReady, bridgeBusy: busy };
}

function outputFor(input, route, state, bridgePrepared = false) {
  if (route.decision === 'deny') {
    return { version: 1, decision: 'deny', action: 'deny', reason: route.reason };
  }
  return {
    version: 1,
    decision: 'allow',
    action: route.action,
    agentType: route.chosenAgent,
    target: route.action === 'followup' ? input.target : null,
    taskName: route.action === 'spawn' ? input.taskName : null,
    forkTurns: route.action === 'spawn' && route.chosenAgent !== ROLES.SPARK ? 'none' : null,
    bridgePrepared,
    quota: {
      sparkRemaining: state.sparkRemaining,
      generalRemaining: state.generalRemaining,
    },
    reason: route.reason,
  };
}

export async function runPreflight(input, config, deps = {}) {
  validatePreflightInput(input);
  const state = await routingState(config, deps);
  const providerReady = await installedProviderReady(config, deps);
  const providerPack = resolveProviderPack(config.providerId ?? DEFAULT_PROVIDER_ID);
  const routeInput = {
    operation: input.operation,
    requestedAgent: input.requestedAgent,
    existingAgentType: input.existingAgentType,
    providerSuitable: input.providerSuitable ?? input.deepseekSuitable,
    providerRole: providerPack.role,
    threshold: config.threshold,
    sparkAvailable: config.sparkAvailable,
    sparkRemaining: state.sparkRemaining,
    generalRemaining: state.generalRemaining,
    lunaAvailable: config.lunaAvailable,
    providerReady,
    bridgeBusy: state.bridgeBusy,
  };
  let route = chooseRoute(routeInput);
  if (route.chosenAgent !== providerPack.role) return outputFor(input, route, state);

  let taskName = input.taskName;
  if (route.action === 'followup') {
    const archived = await (deps.hasArchivedImpl ?? hasArchivedBridgeTask)(
      input.target,
      { root: config.bridgePath },
    );
    if (archived) {
      taskName = input.target;
    } else {
      route = { ...route, action: 'spawn', reason: `${route.reason}; existing target is not bridge-compatible` };
    }
  }

  try {
    await (deps.createBridgeImpl ?? createBridgeTask)({
      root: config.bridgePath,
      taskName,
      cwd: input.cwd,
      message: input.message,
    });
    return outputFor(input, route, state, true);
  } catch (error) {
    const busy = error instanceof BridgeBusyError || error?.code === 'BRIDGE_BUSY';
    route = chooseRoute({
      ...routeInput,
      providerReady: false,
      bridgeBusy: true,
    });
    route = {
      ...route,
      reason: busy
        ? 'provider bridge is busy; safe OpenAI fallback'
        : 'provider bridge preparation failed; safe OpenAI fallback',
    };
    return outputFor(input, route, state);
  }
}

async function readStdin() {
  let body = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) body += chunk;
  return body;
}

export async function preflightMain(configPath = process.argv[2]) {
  try {
    if (!configPath) throw new Error('worker config path is required');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const input = JSON.parse(await readStdin());
    process.stdout.write(`${JSON.stringify(await runPreflight(input, config))}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({
      version: 1,
      decision: 'deny',
      action: 'deny',
      reason: error?.message ?? 'preflight failed',
    })}\n`);
  }
}

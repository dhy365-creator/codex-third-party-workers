export const ROLES = Object.freeze({
  SPARK: 'spark-worker',
  LUNA: 'luna_worker',
  DEEPSEEK: 'deepseek_worker',
});

const KNOWN_ROLES = new Set(Object.values(ROLES));

function finite(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function roleOf(child) {
  if (!child) return null;
  if (typeof child === 'string') return child;
  return child.agentType ?? child.role ?? child.requestedAgent ?? child.name ?? null;
}

function actionFor(operation, chosenAgent, existingChild) {
  if (!chosenAgent) return 'deny';
  if (operation !== 'followup') return 'spawn';
  return roleOf(existingChild) === chosenAgent ? 'followup' : 'spawn';
}

function ready(value) {
  if (value && typeof value === 'object') {
    return value.credential === true && value.config === true;
  }
  return value === true;
}

function availableOpenAi({ requestedAgent, sparkUsable, lunaAvailable }) {
  if (requestedAgent === ROLES.SPARK && sparkUsable) return ROLES.SPARK;
  if (requestedAgent === ROLES.LUNA && lunaAvailable) return ROLES.LUNA;
  if (lunaAvailable) return ROLES.LUNA;
  if (sparkUsable) return ROLES.SPARK;
  return null;
}

function result(base, chosenAgent, reason) {
  return {
    ...base,
    decision: chosenAgent ? 'allow' : 'deny',
    chosenAgent,
    agentType: chosenAgent,
    action: actionFor(base.operation, chosenAgent, base.existingChild),
    reason,
  };
}

/**
 * Pure routing policy. `sparkAvailable` means the account is entitled to use
 * Spark; `sparkRemaining` is the live quota reading. They are deliberately
 * separate so plan names never masquerade as live availability.
 */
export function chooseRoute({
  operation = 'spawn',
  kind,
  requestedAgent = ROLES.SPARK,
  existingChild,
  existingAgentType,
  suitable = false,
  deepseekSuitable,
  threshold = 20,
  sparkAvailable = false,
  sparkRemaining,
  generalRemaining,
  quotaRemaining,
  lunaAvailable = true,
  deepseekReady = false,
  bridgeBusy = false,
} = {}) {
  const resolvedOperation = kind ?? operation;
  const general = generalRemaining ?? quotaRemaining;
  const base = {
    operation: resolvedOperation,
    requestedAgent,
    existingChild: existingChild ?? existingAgentType,
    threshold: Number(threshold),
    sparkRemaining: finite(sparkRemaining) ? Number(sparkRemaining) : null,
    generalRemaining: finite(general) ? Number(general) : null,
    suitable: deepseekSuitable ?? suitable,
    bridgeBusy: bridgeBusy === true,
  };
  if (!['spawn', 'followup'].includes(resolvedOperation)) {
    throw new Error('operation must be spawn or followup');
  }
  if (!KNOWN_ROLES.has(requestedAgent)) throw new Error('unknown requested agent');
  if (!Number.isInteger(base.threshold) || base.threshold < 0 || base.threshold > 100) {
    throw new Error('threshold must be an integer from 0 to 100');
  }

  const deepseekUsable = base.suitable === true && ready(deepseekReady) && !base.bridgeBusy;
  const sparkQuotaKnown = finite(sparkRemaining);
  const sparkUsable = sparkAvailable === true && sparkQuotaKnown && Number(sparkRemaining) > 0;

  if (requestedAgent === ROLES.DEEPSEEK) {
    if (deepseekUsable) return result(base, ROLES.DEEPSEEK, 'explicit-deepseek-ready');
    return result(
      base,
      availableOpenAi({ requestedAgent: ROLES.LUNA, sparkUsable, lunaAvailable }),
      base.bridgeBusy ? 'deepseek-bridge-busy-safe-openai-fallback' : 'deepseek-not-ready-safe-openai-fallback',
    );
  }

  if (requestedAgent === ROLES.SPARK && sparkAvailable === true) {
    if (!sparkQuotaKnown) {
      return result(base, ROLES.SPARK, 'spark-quota-unknown-kept-requested-openai-agent');
    }
    if (sparkUsable) return result(base, ROLES.SPARK, 'spark-available-first');
  }

  if (!finite(general)) {
    const fallback = availableOpenAi({ requestedAgent, sparkUsable, lunaAvailable });
    return result(base, fallback, 'general-quota-unknown-kept-openai-agent');
  }

  if (Number(general) >= base.threshold) {
    const fallback = lunaAvailable
      ? ROLES.LUNA
      : availableOpenAi({ requestedAgent, sparkUsable, lunaAvailable });
    const reason = Number(general) === base.threshold
      ? 'quota-at-threshold-uses-luna'
      : 'quota-above-threshold-uses-openai';
    return result(base, fallback, fallback ? reason : 'no-openai-fallback-available');
  }

  if (deepseekUsable) {
    return result(base, ROLES.DEEPSEEK, 'quota-below-threshold-deepseek-ready');
  }
  const fallback = availableOpenAi({ requestedAgent: ROLES.LUNA, sparkUsable, lunaAvailable });
  return result(
    base,
    fallback,
    base.bridgeBusy ? 'deepseek-bridge-busy-safe-openai-fallback' : 'deepseek-unsuitable-or-unavailable',
  );
}

export function validatePreflightInput(input) {
  if (!input || input.version !== 1) throw new Error('unsupported preflight version');
  if (!['spawn', 'followup'].includes(input.operation)) {
    throw new Error('operation must be spawn or followup');
  }
  if (!KNOWN_ROLES.has(input.requestedAgent)) throw new Error('unknown requested agent');
  if (typeof input.taskName !== 'string' || !input.taskName.trim()) {
    throw new Error('taskName is required');
  }
  if (typeof input.message !== 'string' || !input.message.trim()) {
    throw new Error('message is required');
  }
  if (typeof input.cwd !== 'string' || !input.cwd.trim()) throw new Error('cwd is required');
  if (typeof input.deepseekSuitable !== 'boolean') {
    throw new Error('deepseekSuitable must be boolean');
  }
  if (input.operation === 'followup') {
    if (!KNOWN_ROLES.has(input.existingAgentType)) {
      throw new Error('existingAgentType is required for followup');
    }
    if (typeof input.target !== 'string' || !input.target.trim()) {
      throw new Error('target is required for followup');
    }
  }
  return input;
}

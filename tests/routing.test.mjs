import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseRoute, ROLES } from '../src/routing.mjs';

const providerRole = 'deepseek_worker';

const base = {
  operation: 'spawn',
  requestedAgent: ROLES.SPARK,
  threshold: 10,
  sparkAvailable: true,
  lunaAvailable: true,
  providerReady: true,
  providerSuitable: true,
  bridgeBusy: false,
  providerRole,
};

test('live Spark quota has first priority even when general quota is low', () => {
  const route = chooseRoute({ ...base, sparkRemaining: 1, generalRemaining: 1 });
  assert.equal(route.chosenAgent, ROLES.SPARK);
  assert.equal(route.reason, 'spark-available-first');
});

test('Spark exhaustion falls back to Luna at the threshold', () => {
  const route = chooseRoute({ ...base, sparkRemaining: 0, generalRemaining: 10 });
  assert.equal(route.chosenAgent, ROLES.LUNA);
});

test('below threshold selects provider fallback only when suitable and ready', () => {
  assert.equal(
    chooseRoute({ ...base, requestedAgent: providerRole, sparkRemaining: 0, generalRemaining: 9 }).chosenAgent,
    providerRole,
  );
  assert.equal(
    chooseRoute({ ...base, requestedAgent: providerRole, sparkRemaining: 0, generalRemaining: 9, providerSuitable: false }).chosenAgent,
    ROLES.LUNA,
  );
  assert.equal(
    chooseRoute({ ...base, requestedAgent: providerRole, sparkRemaining: 0, generalRemaining: 9, bridgeBusy: true }).chosenAgent,
    ROLES.LUNA,
  );
});

test('unknown live quota stays on an OpenAI role', () => {
  assert.equal(chooseRoute({ ...base }).chosenAgent, ROLES.SPARK);
  assert.equal(
    chooseRoute({ ...base, sparkAvailable: false }).chosenAgent,
    ROLES.LUNA,
  );
});

test('followup is reused only when the chosen role matches', () => {
  const followup = chooseRoute({
    ...base,
    operation: 'followup',
    requestedAgent: providerRole,
    existingAgentType: providerRole,
    sparkRemaining: 0,
    generalRemaining: 1,
  });
  assert.equal(followup.action, 'followup');
  const changedRole = chooseRoute({
    ...base,
    operation: 'followup',
    requestedAgent: providerRole,
    existingAgentType: ROLES.LUNA,
    sparkRemaining: 0,
    generalRemaining: 1,
  });
  assert.equal(changedRole.action, 'spawn');
  assert.equal(changedRole.chosenAgent, providerRole);
});

test('registered Pro is explicit-only and never becomes the automatic fallback', () => {
  const profiles = ['deepseek_worker', 'deepseek_pro_worker'];
  const explicit = chooseRoute({
    ...base,
    requestedAgent: 'deepseek_pro_worker',
    providerRoles: profiles,
    defaultProviderRole: 'deepseek_worker',
    sparkRemaining: 100,
    generalRemaining: 100,
  });
  assert.equal(explicit.chosenAgent, 'deepseek_pro_worker');
  assert.equal(explicit.reason, 'explicit-provider-ready');

  const automatic = chooseRoute({
    ...base,
    providerRoles: profiles,
    defaultProviderRole: 'deepseek_worker',
    sparkRemaining: 0,
    generalRemaining: 1,
  });
  assert.equal(automatic.chosenAgent, 'deepseek_worker');
});

test('unregistered Pro worker is rejected by the routing allowlist', () => {
  assert.throws(
    () => chooseRoute({ ...base, requestedAgent: 'deepseek_pro_worker' }),
    /unknown requested agent/,
  );
});

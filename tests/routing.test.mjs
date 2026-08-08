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

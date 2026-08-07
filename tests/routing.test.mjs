import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseRoute, ROLES } from '../src/routing.mjs';

const base = {
  operation: 'spawn',
  requestedAgent: ROLES.SPARK,
  threshold: 10,
  sparkAvailable: true,
  lunaAvailable: true,
  deepseekReady: true,
  deepseekSuitable: true,
  bridgeBusy: false,
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

test('below threshold selects DeepSeek only when suitable and ready', () => {
  assert.equal(
    chooseRoute({ ...base, sparkRemaining: 0, generalRemaining: 9 }).chosenAgent,
    ROLES.DEEPSEEK,
  );
  assert.equal(
    chooseRoute({ ...base, sparkRemaining: 0, generalRemaining: 9, deepseekSuitable: false }).chosenAgent,
    ROLES.LUNA,
  );
  assert.equal(
    chooseRoute({ ...base, sparkRemaining: 0, generalRemaining: 9, bridgeBusy: true }).chosenAgent,
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
    existingAgentType: ROLES.DEEPSEEK,
    sparkRemaining: 0,
    generalRemaining: 1,
  });
  assert.equal(followup.action, 'followup');
  const changedRole = chooseRoute({
    ...base,
    operation: 'followup',
    existingAgentType: ROLES.LUNA,
    sparkRemaining: 0,
    generalRemaining: 1,
  });
  assert.equal(changedRole.action, 'spawn');
});

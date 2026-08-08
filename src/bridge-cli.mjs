import { bridgeBusy, completeBridgeTask, failBridgeTask } from './bridge.mjs';

export async function bridgeMain(argv = process.argv.slice(2), env = process.env) {
  const command = argv[0] ?? 'status';
  const expectedTaskBasename = argv[1];
  const bridgeRoot = env.CODEX_THIRD_PARTY_WORKER_BRIDGE_ROOT ?? env.DEEPSEEK_WORKER_BRIDGE_ROOT;
  const options = bridgeRoot
    ? { root: bridgeRoot }
    : {};
  try {
    if (command === 'status') {
      const busy = await bridgeBusy(options);
      process.stdout.write(`${JSON.stringify({ busy })}\n`);
      return;
    }
    if (!expectedTaskBasename) {
      throw new Error('expected task basename is required');
    }
    const result = command === 'complete'
      ? await completeBridgeTask(expectedTaskBasename, options)
      : command === 'fail'
        ? await failBridgeTask(expectedTaskBasename, options)
        : null;
    if (!result) throw new Error('usage: bridge <status|complete|fail> [task-basename]');
    process.stdout.write(`${JSON.stringify({
      ok: true,
      status: result.status,
      archivePath: result.archivePath,
    })}\n`);
  } catch (error) {
    process.stderr.write(`bridge helper: ${error?.message ?? 'failed'}\n`);
    process.exitCode = 1;
  }
}

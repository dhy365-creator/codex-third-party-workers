# MiniMax-M3 Runtime Demo

## What this demo shows

MiniMax-M3 supports bounded provider execution and has been verified for a real
Codex Desktop subagent smoke run.

## Evidence source

- [Merged PR #3](https://github.com/dhy365-creator/codex-third-party-workers/pull/3),
  which records live Responses, SSE, a two-turn Function Calling round trip,
  CLI, Desktop worker, and bridge-release checks.
- [Current state](../current-state.md) and the
  [compatibility matrix](../provider-compatibility.md).
- No reusable MiniMax terminal image is published in this repository; this
  page does not fabricate one.

## Evidence status

- **Runtime evidence: verified for the recorded run.**
- The evidence covers live API, streaming, Function Calling, Codex CLI, a real
  `minimax_worker` Desktop task, bridge completion, and slot release.
- Public-installer apply/verify remains a separate acceptance layer.

## Flow (single run)

1. Codex main dispatched a bounded smoke task to `minimax_worker`.
2. The worker returned the expected recorded result.
3. The bridge archive reached `completed` and the active slot was released.
4. Codex reviewed the worker result.

## Boundary note

This page does not infer automatic preflight selection from the recorded worker
run and does not claim that public-installer acceptance is complete.

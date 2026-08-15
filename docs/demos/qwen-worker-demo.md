# Qwen3.7-Max Runtime Demo

## What this demo shows

The recorded Qwen3.7-Max smoke test shows an explicitly dispatched bounded
provider worker returning a result through the bridge for Codex review.

## Evidence source

- [Merged PR #4](https://github.com/dhy365-creator/codex-third-party-workers/pull/4),
  which records the API, SSE, automatic Function Calling, CLI, Desktop worker,
  and bridge-release checks.
- [Current state](../current-state.md) and the
  [compatibility matrix](../provider-compatibility.md).
- The existing sanitized Qwen Desktop image below. It contains no API key or
  private task text.

![Sanitized Qwen Desktop worker evidence](../../assets/terminal-demo.png)

## Evidence status

- **Runtime evidence: verified for the recorded 2026-08-08 run.**
- The evidence covers direct Responses, SSE, automatic Function Calling, Codex
  CLI, a real `qwen_worker` Desktop task, bridge completion, and slot release.
- Public-installer apply/verify state remains a separate acceptance layer; this
  page does not infer it from the Desktop smoke test.

## Flow (single run)

1. Codex main dispatched a bounded smoke task to `qwen_worker`.
2. The worker used the text-only `qwen3.7-max` pack and returned the expected
   result.
3. The bridge archive reached `completed` and the active slot was released.
4. Codex reviewed the result before acceptance.

## Boundary note

This page intentionally does **not** treat explicit worker dispatch as proof
that preflight automatically selects Qwen in every user session. It also does
not expand the current text-only model boundary.

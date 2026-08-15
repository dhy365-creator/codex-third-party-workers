# DeepSeek Demo — Pending Live Runtime Verification

## Status

DeepSeek V4 Flash is a built-in provider pack and passes isolated tests.

- **Live runtime evidence: pending.**
- `runtimeVerified=false` remains the honest public-installer status.
- `configured` can become `true` after local files, permissions, hashes,
  catalog bounds, markers, and Keychain presence pass; that state is not live
  runtime verification.

## Evidence source

- `README.md` / `README.zh-CN.md` provider status section
- `docs/provider-compatibility.md` and `docs/provider-compatibility.zh-CN.md`
- `docs/current-state.md` pending items list

## Why still pending

Public-installer live runtime has not been completed in a real user environment
for this repository line. No sanitized live DeepSeek transcript is published,
so this page contains no simulated terminal output.

## Evidence still required

1. Review the public installer dry-run and apply it in an authorized real user
   environment.
2. Restart Codex Desktop and run one non-sensitive bounded text/code task.
3. Confirm the worker result, completed/failed bridge archive, and active-slot
   release.
4. Have Codex review the result and keep user acceptance as a separate state.

## What to avoid in this state

- Do not treat DeepSeek as runtime-confirmed for public-installer use.
- Do not use this demo as proof of broader routing stability.
- Do not claim this as complete readiness for all tasks or environments.

## Boundary note

`runtimeVerified=false` is expected here and is tracked explicitly for runtime evidence
governance.

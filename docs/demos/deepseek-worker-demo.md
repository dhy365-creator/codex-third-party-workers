# DeepSeek Demo — Controlled Maintainer E2E

## Status

DeepSeek V4 Flash is a built-in provider pack and passes isolated tests. Flash
and the explicit-only V4 Pro profile each completed a controlled maintainer
coding-fixture E2E on 2026-08-16.

- **Classification: Level 3 for one bounded maintainer path.** An explicit
  `deepseek_worker` performed a non-sensitive fixture diagnostic; the bridge
  completed and released; the main thread reviewed the result.
- **V4 Pro classification: Level 3 for its explicit-only bounded path.** A fresh
  Host session ran `deepseek_pro_worker` with the expected provider/model,
  reproduced the fixture failure, used tools, completed/released the bridge, and
  passed main-thread review.
- `runtimeVerified=false` remains the verifier output. It does not automatically
  promote a single controlled observation into a general runtime claim.
- `configured=true` only covers local files, permissions, hashes, catalog
  bounds, markers, and Keychain presence; it is not user acceptance.

## Evidence source

- `README.md` / `README.zh-CN.md` provider status section
- `docs/provider-compatibility.md` and `docs/provider-compatibility.zh-CN.md`
- [Sanitized controlled runtime E2E record](../validation/deepseek-runtime-e2e-2026-08-16.md)
- [Sanitized Custom Subagents runtime record](../validation/deepseek-custom-subagents-runtime-e2e-2026-08-16.md)
- [V4 Pro direct Codex subagent audit](../validation/deepseek-v4-pro-probe-2026-08-16.md#direct-codex-subagent-audit)
- `docs/current-state.md` state and limitations

## What this demonstrates

The run used explicit `--apply` authorization, a reversible snapshot, an
isolated intentionally failing fixture, and an existing Flash worker. The worker
gave the expected diagnostic without changing the fixture. A bridge-root default
bug found during the first attempt was fixed and covered by a regression test
before the final default-root run completed.

No API key, private task text, private path, raw worker transcript, or provider
response body is published here.

## Evidence still required

1. Independent real-user acceptance of the documented install path.
2. Broader reliability evidence across sessions and appropriate text/code tasks.
3. Public-installer acceptance in an unrelated environment, kept separate from
   these maintainer-controlled runs.

## What to avoid in this state

- Do not treat this one run as generic public-installer success.
- Do not use this demo as proof of broader routing stability.
- Do not turn the explicit-only V4 Pro E2E into an automatic model-selection,
  broad task-reliability, provider-dashboard, or complete-readiness claim.

## Boundary note

`runtimeVerified=false` is intentionally retained for runtime-evidence
governance even after this recorded maintainer E2E.

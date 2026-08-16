# DeepSeek Custom Subagents Runtime E2E — 2026-08-16

## Scope

This is a sanitized maintainer validation of the official Codex Custom Agent
path on macOS with Codex CLI `0.147.0`. It covers the default
`deepseek_worker -> deepseek-v4-flash` identity and the explicit-only
`deepseek_pro_worker -> deepseek-v4-pro` identity. It is not broad public
installer or independent user-acceptance evidence.

## Controlled fixture

Both agents received the same read-only, non-sensitive three-file JavaScript
fixture. Its `sum` implementation intentionally subtracted two values while two
tests expected addition. The agents were asked to inspect the fixture, run the
tests, identify the smallest exact fix, and avoid changing files.

The main thread independently established the `0/2` failing baseline, checked
that the fixture remained unchanged, reran the tests after each child, and
confirmed the diagnosis.

## Evidence

| Check | Flash | Pro |
| --- | --- | --- |
| Official TOML identity | `deepseek_worker` | `deepseek_pro_worker` |
| Session provider | `deepseek` | `deepseek` |
| Session model | `deepseek-v4-flash` | `deepseek-v4-pro` |
| Tool use | Five local command calls | Five local command calls |
| Failing tests reproduced | `0/2` pass | `0/2` pass |
| Exact diagnosis | Change subtraction to addition | Change subtraction to addition |
| Fixture modified | No | No |
| Bridge result | Completed and active slot released | Completed and active slot released |
| Main-thread review | PASS | PASS |

The active bridge directory and task file used owner-only modes `0700` and
`0600`. Completed archives contained redacted task text and working-directory
values. No API key, credential value, private task content, or personal path is
included here.

## Host and reload observations

- Codex reported `multi_agent` as stable and enabled. Custom Agent identity came
  from the TOML `name` field, not from the routing request.
- The already-open Desktop task had not reloaded the newly added Pro identity and
  rejected that role as unknown. A fresh ephemeral Codex session discovered and
  ran `deepseek_pro_worker`. New or changed agent TOML files therefore require a
  fresh Host session.
- Codex emitted a model-metadata warning for the unrecognized V4 Pro identifier
  and used fallback metadata. The actual child session still recorded the
  expected `deepseek` provider and `deepseek-v4-pro` model and completed the
  bounded task. The metadata warning remains a compatibility WARN.

## Classification and limits

These runs establish controlled maintainer **Level 3** evidence for the named
Custom Subagent paths: explicit dispatch, model-attributable Host session,
provider response, tool use, bridge completion/release, and main-thread review.

They do not establish:

- automatic Flash/Pro routing (Pro remains explicit-only);
- reliable behavior for arbitrary tasks or all provider features;
- public-installer success in an unrelated user environment;
- independent real-user acceptance;
- provider-dashboard attribution or usage-delta evidence;
- `runtimeVerified: true` in the local verifier.

The verifier remains deliberately conservative because it does not ingest or
independently accept external runtime records. It continues to report
`configured: true` / `runtimeVerified: false` where its local checks pass.

Earlier evidence remains useful for provenance but not as the current result:

- [DeepSeek controlled runtime E2E](deepseek-runtime-e2e-2026-08-16.md)
- [DeepSeek V4 Pro compatibility probe](deepseek-v4-pro-probe-2026-08-16.md)
- [Custom Agents architecture migration](../migration/custom-agents.md)

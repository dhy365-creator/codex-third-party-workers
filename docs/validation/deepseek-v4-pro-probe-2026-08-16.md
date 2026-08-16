# DeepSeek V4 Pro Compatibility Probe — 2026-08-16

## Scope and conclusion

This record evaluates whether `deepseek-v4-pro` fits the repository's existing
native Responses transport. This V4 Pro probe does **not** add a pack, change
routing, or claim V4 Pro Codex Desktop runtime verification. A separate
Flash-plus-Pro runtime E2E record is available at
[the controlled runtime record](deepseek-runtime-e2e-2026-08-16.md).

**Decision: API-verified candidate.** The model is a native Responses API
candidate for a later, explicitly reviewed model-selection design. It is not a
built-in or runtime-verified supported model.

## Repository baseline

- Source baseline: `main` at `f1ba2e933d69343442e3ee0a58b1efe935421e56`.
- Built-in DeepSeek model: `deepseek-v4-flash`.
- Current transport: `wire_api = "responses"` at `https://api.deepseek.com/`.
- Current V4 Pro exclusion: the DeepSeek pack is deliberately Flash-only; its
  catalog policy targets `deepseek-v4-flash` and retains a V4 Pro reject guard.
- `runtimeVerified` is intentionally conservative. The verifier does not
  promote API success or a single controlled run automatically.

## Official findings

Checked on 2026-08-16, using only DeepSeek documentation:

| Topic | Official current evidence |
| --- | --- |
| Model ID | `deepseek-v4-pro` |
| Native protocol | `POST /responses` at `https://api.deepseek.com` |
| Other protocols | OpenAI-format Chat Completions and Anthropic-format API |
| Streaming | Semantic Responses SSE ending in `response.completed`, `response.incomplete`, or `response.failed` |
| Tools | `function` is supported; the project continues to restrict worker scope to text/code/local validation |
| Reasoning | Responses `reasoning.effort` supports `none`, `low`, `high`, and `max` as documented |
| Context / output | 1M context and up to 384K output, subject to provider limits and current pricing |
| Modality boundary | Text-only for this project; the Responses compatibility guide says image/file input is not supported as a usable project capability |

Sources:

- [Models and pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [Using the Responses API](https://api-docs.deepseek.com/zh-cn/guides/responses_api/)
- [Thinking mode](https://api-docs.deepseek.com/guides/thinking_mode/)
- [List models](https://api-docs.deepseek.com/api/list-models)

## Inert catalog check

The official catalog source configured by the project was fetched as inert text
through an HTTPS DeepSeek-host allowlist; it was never executed. Its parsed
catalog contained both `deepseek-v4-flash` and `deepseek-v4-pro`, each declaring
text input and `low`, `high`, and `max` reasoning levels.

## Limited live API probe

The probe used a pre-existing macOS Keychain credential internally. No key,
account name, private path, request body, reasoning text, or model response
body was recorded.

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Model availability | PASS | Authenticated `GET /models` listed both V4 Flash and V4 Pro |
| Basic Responses | PASS | Native `/responses` request completed with parseable response structure |
| Streaming | PASS | HTTP success with semantic events including `response.output_text.delta` and `response.completed` |
| Function-call loop | PASS | Forced no-side-effect function call, static result return, and second completion all succeeded |
| Reasoning | PASS | `high` and `max` requests each completed; no reasoning text was retained |
| Failure handling | PASS | Invalid-model request returned a controlled HTTP 400 invalid-request error without secret output |

This probe proves direct API behavior only. It does not prove a public
installer, Codex Desktop dispatch, bridge completion/release, main-thread
review, or user acceptance.

## Flash versus Pro small-sample A/B

Both models were given the same three non-private tasks: a simple code analysis,
a bounded patch plan, and a static function-call round trip.

- With `reasoning=high` and a strict 192-token output cap, both models reached
  `response.incomplete` before returning scoreable structured results. That
  configuration is not a performance comparison.
- A retry used documented Responses structured output with `reasoning=none`.
  Both models completed the two constrained text tasks; the small rubric favored
  Pro on those two single samples, while the tool task completed the call/result
  loop for both but did not yield a comparable structured final result.
- No latency, cost, quality, or capability ranking follows from this sample.
  It is a bounded compatibility check, not a benchmark.

## Runtime E2E boundary

| Model | Built-in / configured | `runtimeVerified` | Bridge completion and release | Codex review |
| --- | --- | --- | --- | --- |
| V4 Flash | Built-in; separate controlled maintainer E2E recorded | `false` | Completed and released in the bounded Flash run | Main-thread reviewed |
| V4 Pro | Not a selectable pack or installed configuration | `false` | Two temporary noninteractive attempts did not consume a bridge task | Not run |

The next V4 Pro runtime evidence must use a user-visible interactive Codex
workflow to invoke the temporary named worker and verify an actual model request,
tool use, bridge completion/release, and main-thread review. Only then should a
separate design decide whether V4 Pro merits explicit selection or isolated
installation coverage. Automatic Flash/Pro routing is out of scope.

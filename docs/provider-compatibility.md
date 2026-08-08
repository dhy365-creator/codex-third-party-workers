# Chinese Provider Compatibility Matrix

**English** | [简体中文](provider-compatibility.zh-CN.md)

Last reviewed: 2026-08-08

This document evaluates whether a Chinese model or platform can become a
provider-pack subagent without replacing the primary Codex model and without
CC Switch or another local protocol translator.

## Acceptance gate

Documentation compatibility is not the same as repository support. A built-in
pack must pass all of the following:

1. An official OpenAI-compatible `POST /responses` endpoint.
2. Streaming and a complete Responses-style custom function-call loop.
3. Bearer credentials that can be retrieved by a macOS Keychain command.
4. A defined HTTPS base URL, model ID, and capability boundary.
5. Live API, Codex subagent, tool-call, bridge-release, and main-thread review.

Statuses:

- **Built-in pack**: implemented and isolated-tested; live user-environment status is tracked separately.
- **Runtime-verified pack**: a built-in pack that passed a real Codex subagent run and human review.
- **Tier A candidate**: official documentation meets the core protocol gate; live testing is pending.
- **Tier B gateway candidate**: a Responses compatibility gateway exists, but it may translate another protocol and impose limitations.
- **Not currently compatible**: official direct access is Chat Completions-only or requires an external translator.

## Initial results

| Provider / model | Access type | Current result | Next step |
| --- | --- | --- | --- |
| DeepSeek / `deepseek-v4-flash` | Official Responses | **Only built-in pack; public-installer runtime verification pending** | Keep regression coverage; V4 Pro remains excluded |
| MiniMax / `MiniMax-M3` | Official Responses and an official Codex Desktop guide | **Built-in; live API and Codex CLI verified, Desktop subagent pending restart** | Restart and review a real `minimax_worker` task |
| StepFun / `step-3.7-flash` | Official `/v1/responses` | **Tier A, priority 2** | Verify streaming tool loops and Codex subagent execution |
| Alibaba Model Studio / Qwen Responses models | Official Responses and current Codex configuration | **Tier A, priority 3** | Confirm billing plan, region, Workspace ID, and exact model ID |
| Volcano Ark / Doubao Responses models | Official `/api/v3/responses` | **Tier A, priority 4** | Use an account-enabled model or Endpoint ID |
| Baidu Qianfan Responses gateway | Official `/v2/responses` gateway | **Tier B gateway** | Select one listed model and verify the tool loop |
| Tencent Cloud TokenHub | Official `/v1/responses` compatibility gateway | **Tier B gateway** | GLM, Kimi, or DeepSeek can be tested subject to gateway limits |
| Direct Kimi K3 | Official Codex guide requires CC Switch to translate Chat Completions | **Not currently compatible** | Do not test a direct Kimi key; TokenHub is a separate gateway option |
| Direct Zhipu GLM | Current official OpenAI guide uses Chat Completions | **Not currently compatible** | Wait for direct Responses or test through Qianfan/TokenHub |
| Legacy Tencent Hunyuan endpoint | Current compatibility documentation is centered on Chat Completions | **Not currently compatible** | TokenHub is a separate gateway, not direct Hunyuan support |
| Direct SiliconFlow | Current official text endpoint is `/chat/completions` | **Not currently compatible** | Wait for official Responses documentation |

Tier A means “worth testing with an API key,” not “perfectly supported.” DeepSeek
V4 Flash and MiniMax-M3 are built-in packs, but the public installer still has a pending
live user-environment check. Under the strict gate above, no provider is currently
labeled “perfectly supported.”

## Recommended test order

1. **MiniMax-M3**: the vendor documents Codex Desktop, `wire_api = "responses"`,
   the base URL, and a Codex model catalog.
2. **step-3.7-flash**: fixed base URL with documented Responses, streaming, and functions.
3. **Qwen**: documented Codex path, but plan, region, and Workspace URL must be selected first.
4. **Volcano Ark**: the protocol fits, while model or Endpoint IDs depend on the account.
5. **Qianfan / TokenHub**: useful for wider model coverage, but these validate a gateway rather than direct vendor access.

Test one provider at a time. Never send an API key in chat, write it to the
configuration, or commit it to GitHub; store it under a provider-specific macOS
Keychain service. Tests must cover non-streaming text, streaming text, a custom
function-call round trip, a real Codex subagent, failure fallback, and bridge
release. Only after all checks pass should the repository add a provider pack,
offline tests, and installation documentation.

## Boundaries

- OpenAI-compatible does not automatically mean Responses-compatible.
- Returning text does not prove that the Codex tool-call loop works.
- A gateway offering a model does not prove that the model vendor's direct API works.
- External translators may work, but they are outside this project's native-provider scope.
- Model lists and API behavior change; every pack requires a fresh official-doc and live-runtime review.

## Official sources

- [OpenAI Codex configuration reference](https://developers.openai.com/codex/config-reference/)
- [DeepSeek Responses API](https://api-docs.deepseek.com/zh-cn/guides/responses_api/)
- [MiniMax: M3 in Codex](https://platform.minimaxi.com/docs/token-plan/codex)
- [MiniMax Responses API](https://platform.minimaxi.com/docs/api-reference/responses-create)
- [StepFun Responses API](https://platform.stepfun.com/docs/zh/api-reference/responses/responses-create)
- [Alibaba Model Studio: Codex](https://help.aliyun.com/zh/model-studio/codex)
- [Alibaba Model Studio Responses API](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-responses)
- [Volcano Ark Responses API tool calls](https://www.volcengine.com/docs/82379/1958524?lang=zh)
- [Baidu Qianfan Responses API](https://cloud.baidu.com/doc/qianfan-docs/s/4mi400l1m)
- [Tencent Cloud TokenHub Responses compatibility](https://cloud.tencent.com/document/product/1823/133813)
- [Kimi K3 in Codex CLI](https://platform.kimi.com/docs/guide/codex-kimi)
- [Zhipu OpenAI API compatibility](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction)
- [SiliconFlow OpenAI chat endpoint](https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions)

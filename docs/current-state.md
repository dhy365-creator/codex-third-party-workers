# 当前状态

最后更新：2026-08-16

## 已写入本地仓库

- 当前源码版本线为 `0.4.0-beta.2`，MIT，Node.js `>=20`，macOS-only；PR、CI、tag 与
  Release 的实时状态以 GitHub 公开控制面为准。
- 公开仓库：`https://github.com/dhy365-creator/codex-third-party-workers`。
- 仓库入口提供英文 `README.md` 与简体中文 `README.zh-CN.md`，顶部可相互切换。
- 中英文 README 首屏已按产品化顺序补充定位、Quick Start、真实运行记录、兼容性摘要、
  Mermaid 架构、验证与安全边界。
- 中英文 README 首屏进一步明确 Codex 主代理、有界委派、三组内置 Pack 的当前证据、
  只读 Doctor 与默认 dry-run 入口；DeepSeek V4 Flash 仅新增一条有边界的维护者 E2E 证据，
  没有扩大 V4 Pro、自动路由或通用用户运行时声明。
- 新增只读 `npm run doctor`：检查 macOS、Node.js、Codex 环境、Provider/Model、Keychain
  是否存在、fallback 提示、安装状态、权限与 verify 前置条件；不写配置、不读取或输出
  credential value、不输出私有路径、不联网且不调用付费 API。
- 新增 Bug、Provider 兼容性和 Feature 三组 GitHub Issue Forms，并关闭 blank issue；安全
  漏洞继续引导至 `SECURITY.md` 的私下报告流程。
- `assets/` 已提供四组可复现 SVG 与 PNG：Hero/Social Preview、脱敏真实终端记录、
  Provider 兼容性摘要、测试与 CI 信任证据。
- `docs/github-promotion.md` 已记录 OpenAI Codex Show and tell Discussion #38119 的真实
  发布状态；Awesome List 候选仍未提交。
- GitHub 推广资产通过 PR #5 合并到 `main`，CI 通过；仓库 Description 与 Topics 已按
  当前真实定位更新。Homepage 保持为空，因为尚无独立官方站点。
- 已发布中英文国产模型 Provider 兼容性矩阵；矩阵中的候选状态仅代表官方文档筛选，
  不等于本仓库已经支持。
- 已完成 DeepSeek V4 Pro 的官方资料核对与受控直接 Responses API 探测：模型目录、普通
  请求、SSE、函数调用闭环、`high` / `max` 推理请求与受控失败处理均有脱敏证据。
- 本分支新增 DeepSeek 多 profile：既有 `deepseek_worker` 继续绑定
  `deepseek-v4-flash` 并作为默认 fallback；`deepseek_pro_worker` 绑定
  `deepseek-v4-pro`，只能通过 `--model pro` 和显式 worker 请求选择。安装器、Doctor、
  verifier、预检、bridge metadata 与卸载均按 profile 区分；不会自动在 Flash/Pro 之间切换。
- 已在真实 macOS profile 对 Pro 配置完成 dry-run、授权 apply、Doctor、verify 与 rollback。
  本地预检认可完整的 Pro role/model tuple 并创建脱敏 bridge task，但当前 Codex Desktop
  host registry 在派发前拒绝 `deepseek_pro_worker`。因此没有 Pro provider request、工具调用、
  worker result、completed bridge 或主线程结果复核；分类仍为 **API 已验证候选**，
  `runtimeVerified` 仍为 `false`。见
  [脱敏 worker-registration E2E 记录](validation/deepseek-v4-pro-worker-registration-2026-08-16.md)。
- 已完成 DeepSeek V4 Flash 的受控维护者 E2E：在已授权的真实 macOS Codex profile 对既有
  Pack 先 dry-run 再 `--apply`，显式派发 `deepseek_worker` 处理一个非敏感、故意失败的代码
  fixture，得到预期诊断；桥接归档完成、active slot 已释放，并由主线程复核。该路径为
  **Level 3** 证据，`verify` 仍输出 `configured: true` / `runtimeVerified: false`，不自动升级为
  通用公开安装器成功、自动路由或用户验收。
- E2E 首次运行发现 bridge CLI 在未显式传入 platform 时会错用临时目录；已将
  `getBridgeRoot` 默认 platform 固定为 `process.platform`，并增加回归测试。最终 E2E 在默认
  bridge root 下完成。
- 新增中英文 FAQ（`docs/faq.md`、`docs/faq.zh-CN.md`）用于首次用户问题边界说明。
- 新增 `docs/demos/` 证据索引与三页展示：Qwen、MiniMax，以及明确标记 Level 3 维护者 E2E
  与通用用户验收待完成的 DeepSeek 页面。
- 新增 `ROADMAP.md`，并记录 v0.4.x 当前边界、v0.5 规划评估项、Later 探索项。
- README 与 CONTRIBUTING 增加 Documentation/community 的入口导航与链接。
- 架构为通用 provider-pack 形态；DeepSeek 默认 Flash profile、显式 Pro profile、MiniMax-M3
  与 Qwen3.7-Max 均有隔离配置与测试边界。
- 安装器、预检、桥接、验证器和卸载器全部支持 provider pack 的路径、文件名和
  配置。
- 默认通道：Spark -> Luna -> provider fallback；provider 仅在额度低于阈值且任务
  适配时被选中。
- Keychain 使用独立服务名读取，不接收明文 `--api-key`。
- 主线程 `config.toml`、model、provider、auth 不在写入范围内。
- 安装/验证时使用 owner-only 目录与文件（`0700` / `0600`），并保持配置哈希。
- `verify` 仅在配置、托管文件与 Keychain 检查全部通过时输出
  `POST_INSTALL_STATUS: "SUCCESS"`；可复制的 Codex 安装提示词随后只允许询问一次
  可选 Star，绝不由 installer 自动执行，也不影响安装或使用状态。

## 已在隔离环境验证

- `npm test`：2026-08-14 本地通过 `50/50` 项测试；2026-08-16 当前分支通过 `65/65` 项测试，
  覆盖 Flash/Pro mapping、显式 Pro registration、catalog fail-closed、默认路由不选 Pro、
  安装/verify/Doctor/bridge metadata、rollback、已有父目录权限保护和卸载输出隐私边界。
- fake home 的 dry-run、apply、重复安装、verify、dry-run uninstall、正式 uninstall 与
  冲突停止通过。
- 官方 catalog 文本提取、本地约束（V4 限制、文本模型）及逐跳 host 校验通过。
- single-slot bridge 权限与归档、follow-up 识别通过。
- MiniMax-M3 已通过真实 Responses API 普通文本、SSE 流式、Function Calling 两轮闭环，
  并通过 Codex CLI + command-backed Keychain 运行；未记录或输出 API key。
- MiniMax-M3 已在 Codex Desktop 以 `minimax_worker` 完成真实子代理冒烟任务，返回预期
  结果，任务桥状态为 `completed`，`active/` 已释放。
- Qwen3.7-Max 已通过按量计费 Responses 普通文本、SSE 流式、自动 Function Calling、
  Codex CLI 与 Codex Desktop `qwen_worker` 冒烟任务；桥状态为 `completed`，`active/`
  已释放。思考模式不支持 `tool_choice = "required"`，但 `auto` 已验证可用。测试后本机
  Qwen Keychain 凭据已按用户要求删除；本次 Desktop 验证是显式调用，不代表旧版全局
  DeepSeek 专用预检已经自动路由到 Qwen。
- DeepSeek V4 Pro 的直接 API 探测使用 Keychain 凭据且未记录或输出 credential value。此次
  worker-registration 验证也未记录 credential value；失败 bridge archive 已脱敏并释放 active
  slot。当前阻塞来自 Codex host agent-type registry，而不是 Flash/Pro catalog、Keychain、
  本地 allowlist 或 bridge 文件状态。

## 尚未完成或未声称

- 已完成一次受控维护者 Flash E2E，但尚未取得独立真实用户验收；验证器仍不会自动把一次任务
  写成 `runtimeVerified: true`。
- DeepSeek V4 Pro 现在可以显式生成和本地验证 profile，但当前 Codex host 仍不能派发
  `deepseek_pro_worker`。必须先由 host 注册该 agent type，或采用用户可见的受支持交互路径，
  再取得同一 worker/model 的实际请求、工具、结果、completed bridge、释放和主线程复核；
  在此之前不能称为运行时支持或公开安装器运行时成功。
- 本轮 installer hardening 保留既有父目录权限，并在无内容时清理由安装新建的 runtime directory；
  已有目录、文件和 AGENTS marker 的 rollback 由隔离测试覆盖。主线程 `config.toml` 仍不在
  写入范围内。
- GitHub Social Preview 图片已准备，但仍需在 GitHub Settings 手工上传并目视确认。
- 尚未提交 Awesome List 外部 PR 或任何新增第三方评论。
- 未由用户进行人工验收。
- 尚未在真实用户环境安装或发布 npm package；本项目仅通过 GitHub 源码分发。
- StepFun、火山方舟、百度千帆和腾讯云 TokenHub 尚未加入内置 Pack。

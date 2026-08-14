# 当前状态

最后更新：2026-08-14

## 已写入本地仓库

- 当前源码版本线为 `0.4.0-beta.2`，MIT，Node.js `>=20`，macOS-only；PR、CI、tag 与
  Release 的实时状态以 GitHub 公开控制面为准。
- 公开仓库：`https://github.com/dhy365-creator/codex-third-party-workers`。
- 仓库入口提供英文 `README.md` 与简体中文 `README.zh-CN.md`，顶部可相互切换。
- 中英文 README 首屏已按产品化顺序补充定位、Quick Start、真实运行记录、兼容性摘要、
  Mermaid 架构、验证与安全边界。
- 中英文 README 首屏进一步明确 Codex 主代理、有界委派、三组内置 Pack 的当前证据、
  只读 Doctor 与默认 dry-run 入口；没有新增 Provider 运行时声明。
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
- 架构为通用 provider-pack 形态，当前内置 Pack 为 DeepSeek V4 Flash、MiniMax-M3
  与 Qwen3.7-Max。
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

- `npm test`：2026-08-14 本地通过 `50/50` 项测试；Doctor 覆盖平台、凭据、安装态、
  Provider/Model、只读性和私有路径保护，Issue Forms 覆盖必需证据字段和安全入口。
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

## 尚未完成或未声称

- 尚未用本版本公开安装器在真实用户 `~/.codex` 执行 `--apply`/`verify`；验证器仍不会自动
  把一次任务写成 `runtimeVerified: true`。
- GitHub Social Preview 图片已准备，但仍需在 GitHub Settings 手工上传并目视确认。
- 尚未提交 Awesome List 外部 PR 或任何新增第三方评论。
- 未由用户进行人工验收。
- 尚未在真实用户环境安装或发布 npm package；本项目仅通过 GitHub 源码分发。
- StepFun、火山方舟、百度千帆和腾讯云 TokenHub 尚未加入内置 Pack。

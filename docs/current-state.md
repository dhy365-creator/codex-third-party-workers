# 当前状态

最后更新：2026-08-11

## 已写入本地仓库

- 版本：`0.4.0-beta.1`，MIT，Node.js `>=20`，macOS-only。
- 公开仓库：`https://github.com/dhy365-creator/codex-third-party-workers`。
- 仓库入口提供英文 `README.md` 与简体中文 `README.zh-CN.md`，顶部可相互切换。
- 中英文 README 首屏已按产品化顺序补充定位、Quick Start、真实运行记录、兼容性摘要、
  Mermaid 架构、验证与安全边界。
- `assets/` 已提供四组可复现 SVG 与 PNG：Hero/Social Preview、脱敏真实终端记录、
  Provider 兼容性摘要、测试与 CI 信任证据。
- `docs/github-promotion.md` 与 `docs/promotion/` 已准备 owned-repo 推广状态、OpenAI
  Codex Show and tell 草稿、Awesome List 候选包和 beta release notes；所有第三方发布
  仍需用户单独确认，当前未发布。
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

## 已在隔离环境验证

- `npm test`：2026-08-11 本地通过 `37/37` 项测试。
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
- 尚未创建 OpenAI Codex Discussion、Awesome List 外部 PR 或任何第三方评论。
- 未由用户进行人工验收。
- 尚未在真实用户环境安装或发布 npm package；本项目仅通过 GitHub 源码分发。
- StepFun、火山方舟、百度千帆和腾讯云 TokenHub 尚未加入内置 Pack。

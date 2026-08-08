# 当前状态

最后更新：2026-08-08

## 已写入本地仓库

- 版本：`0.3.0-beta.1`，MIT，Node.js `>=20`，macOS-only。
- 公开仓库：`https://github.com/dhy365-creator/codex-third-party-workers`。
- 仓库入口提供英文 `README.md` 与简体中文 `README.zh-CN.md`，顶部可相互切换。
- 已发布中英文国产模型 Provider 兼容性矩阵；矩阵中的候选状态仅代表官方文档筛选，
  不等于本仓库已经支持。
- 架构为通用 provider-pack 形态，当前内置 Pack 为 DeepSeek V4 Flash 与 MiniMax-M3。
- 安装器、预检、桥接、验证器和卸载器全部支持 provider pack 的路径、文件名和
  配置。
- 默认通道：Spark -> Luna -> provider fallback；provider 仅在额度低于阈值且任务
  适配时被选中。
- Keychain 使用独立服务名读取，不接收明文 `--api-key`。
- 主线程 `config.toml`、model、provider、auth 不在写入范围内。
- 安装/验证时使用 owner-only 目录与文件（`0700` / `0600`），并保持配置哈希。

## 已在隔离环境验证

- `npm test`：通过全部测试（更新后待复核）。
- fake home 的 dry-run、apply、重复安装、verify、dry-run uninstall、正式 uninstall 与
  冲突停止通过。
- 官方 catalog 文本提取、本地约束（V4 限制、文本模型）及逐跳 host 校验通过。
- single-slot bridge 权限与归档、follow-up 识别通过。
- MiniMax-M3 已通过真实 Responses API 普通文本、SSE 流式、Function Calling 两轮闭环，
  并通过 Codex CLI + command-backed Keychain 运行；未记录或输出 API key。
- MiniMax-M3 已在 Codex Desktop 以 `minimax_worker` 完成真实子代理冒烟任务，返回预期
  结果，任务桥状态为 `completed`，`active/` 已释放。

## 尚未完成或未声称

- 未在真实用户 `~/.codex` 上安装。
- 尚未用公开安装器在真实用户 `~/.codex` 执行 `--apply`/`verify`；验证器仍不会自动
  把一次任务写成 `runtimeVerified: true`。
- 未由用户进行人工验收。
- 尚未在真实用户环境安装或发布 npm package；本项目仅通过 GitHub 源码分发。
- StepFun、阿里云百炼、火山方舟、百度千帆和腾讯云 TokenHub 尚未加入内置 Pack。

# 任务清单

## 已完成（local / verified）

- [x] `0.4.0-beta.2` 候选新增只读 Doctor，并覆盖环境、Provider/Model、Keychain 存在性、
  fallback、安装态、权限、verify 前置条件、无 mutation 与无私有路径输出测试。
- [x] 新增 Bug、Provider 兼容性、Feature 三组 GitHub Issue Forms 与安全问题私下入口。
- [x] 收紧中英文 README 首屏定位和 Quick Start，并加入 Doctor 入口与当前 Provider 证据。
- [x] 2026-08-14 本地 `npm test` 通过 `50/50`，Issue Form YAML 解析通过。
- [x] README、SECURITY、CHANGELOG、AGENTS、`.github` 流程与文档更新。
- [x] macOS Keychain-only 凭据边界，拒绝 CLI 明文 API key。
- [x] 官方 setup 脚本文本解析、size/host/结构校验和 provider-pack 约束。
- [x] Spark -> Luna -> provider fallback 的实时额度路由（含未知额度回退）。
- [x] spawn/follow-up、桥接忙回退、owner/mode/symlink 校验和脱敏归档。
- [x] dry-run 默认、显式 `--apply`、owner-only backup、幂等 AGENTS 标记块与 manifest。
- [x] verify 与冲突时全停的安全 uninstall。
- [x] fake home 离线测试、敏感信息扫描、官方 catalog 抓取兼容。
- [x] 提供可直接发送给 Codex 的中文安装提示词。
- [x] 安装与完整本地验证成功后提供一次性、可选、需明确同意的 GitHub Star 提示；
  installer 不执行 GitHub 写操作，拒绝、未认证或 Star 失败均不影响使用。

## 公开仓库

- [x] 通用 provider-pack 核心与首个 DeepSeek V4 Flash pack。
- [x] GitHub Actions 只读测试流程与 MIT 开源文件。
- [x] 远程 catalog 逐跳 host 校验及无网络回归测试。
- [x] GitHub 仓库入口提供中英文双语说明与完整下载、配置、验证步骤。
- [x] 基于官方资料发布中英文国产模型 Provider 兼容性矩阵，区分直连、网关、候选与
  运行时验证状态。
- [x] 新增 MiniMax-M3 Pack，并完成真实 API、流式、Function Calling、Codex CLI 与
  Keychain 验证。
- [x] 新增 Qwen3.7-Max Pack，并完成真实 API、流式、自动 Function Calling、Codex
  CLI、Desktop 子代理、桥接释放和 Keychain 删除验证。
- [x] 产品化中英文 README 第一屏，并准备 Hero、真实终端记录、兼容性摘要和测试/CI
  四组可复现 SVG/PNG 推广素材。
- [x] 准备并发布 OpenAI Codex Show and tell Discussion #38119；Awesome Agent Harness
  候选条目和 beta release notes 仍为本地准备材料。
- [ ] 在 GitHub Settings 手工上传 `assets/hero-social-preview.png` 并目视确认。
- [ ] 用户单独确认后，再决定是否提交 Awesome List PR。

## `0.4.0-beta.2` 发布候选

- [ ] push 功能分支并创建维护 PR。
- [ ] 等待 PR CI；通过后再决定 merge。
- [ ] merge 后复核 `package.json`、tag 与 Release notes，再决定是否创建
  `v0.4.0-beta.2` 预发布。

## Provider 扩展待办

- [x] 重启 Codex Desktop，运行真实 `minimax_worker` 子任务并验证桥接完成与释放。
- [ ] 按 StepFun -> 火山方舟顺序逐一进行真实 API 与 Codex 子代理验证。
- [ ] 对通过验证的 Provider 单独新增 Pack、Keychain service、目录策略、离线测试和文档。
- [ ] 对千帆与 TokenHub 保持“网关候选”标识，不把网关通过写成模型厂商直连通过。
- [ ] 官方新增 Responses 支持后，重新核对 Kimi、智谱、混元传统接口和 SiliconFlow。

## 用户环境待办

- [ ] 在真实用户环境执行 dry-run 后，由用户确认再 `--apply`。
- [ ] 重启 Codex Desktop，执行一个不敏感文本/代码子任务。
- [ ] 完成用户人工验收与运行时状态更新。

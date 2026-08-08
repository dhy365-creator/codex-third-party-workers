# 任务清单

## 已完成（local / verified）

- [x] README、SECURITY、CHANGELOG、AGENTS、`.github` 流程与文档更新。
- [x] macOS Keychain-only 凭据边界，拒绝 CLI 明文 API key。
- [x] 官方 setup 脚本文本解析、size/host/结构校验和 provider-pack 约束。
- [x] Spark -> Luna -> provider fallback 的实时额度路由（含未知额度回退）。
- [x] spawn/follow-up、桥接忙回退、owner/mode/symlink 校验和脱敏归档。
- [x] dry-run 默认、显式 `--apply`、owner-only backup、幂等 AGENTS 标记块与 manifest。
- [x] verify 与冲突时全停的安全 uninstall。
- [x] fake home 离线测试、敏感信息扫描、官方 catalog 抓取兼容。
- [x] 提供可直接发送给 Codex 的中文安装提示词。

## 公开仓库

- [x] 通用 provider-pack 核心与首个 DeepSeek V4 Flash pack。
- [x] GitHub Actions 只读测试流程与 MIT 开源文件。
- [x] 远程 catalog 逐跳 host 校验及无网络回归测试。
- [x] GitHub 仓库入口提供中英文双语说明与完整下载、配置、验证步骤。

## 用户环境待办

- [ ] 在真实用户环境执行 dry-run 后，由用户确认再 `--apply`。
- [ ] 重启 Codex Desktop，执行一个不敏感文本/代码子任务。
- [ ] 完成用户人工验收与运行时状态更新。

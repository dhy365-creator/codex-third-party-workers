# 任务清单

## 已完成（local / verified）

- [x] MIT、README、SECURITY、CONTRIBUTING、CHANGELOG 与项目 AGENTS。
- [x] macOS Keychain-only 凭据边界，拒绝 CLI 明文 API key。
- [x] 官方 setup script 惰性解析、size/host/结构校验和 Flash-only 缩减。
- [x] Spark -> Luna -> DeepSeek 的实时额度路由与未知额度安全回退。
- [x] spawn/follow-up、桥接忙回退、owner/mode/symlink 校验和脱敏归档。
- [x] dry-run 默认、显式 `--apply`、owner-only backup、幂等标记块和 manifest。
- [x] verify 与冲突时全停的安全 uninstall。
- [x] fake home 离线测试、敏感信息扫描、真实官方目录抓取和 TOML 解析。
- [x] 可直接发送给 Codex 的中文安装提示词，先确认套餐、阈值与外发授权。

## 发布前待办

- [x] 初始化本地 Git，并审查首个提交。
- [ ] 用户指定 GitHub 账号或组织、仓库可见性与最终项目说明。
- [ ] 获得明确上传授权后创建 remote、push，并观察 GitHub Actions。
- [ ] 创建 `v0.1.0-beta.1` pre-release；不要把本地通过写成 CI 已通过。

## 安装与运行时验收（独立授权）

- [ ] 在真实用户环境先 dry-run，再由用户明确决定是否 `--apply`。
- [ ] 重启 Codex Desktop，运行一个不敏感的文本/代码子任务。
- [ ] 核对主线程仍为 OpenAI 5.6、实际路由角色、bridge 释放与结果质量。
- [ ] 用户人工验收后再把 runtime/user accepted 写入状态。

# 当前状态

最后更新：2026-08-07

## 已写入本地仓库

- 版本：`0.1.0-beta.1`，MIT，Node.js `>=20`，macOS-only。
- 完整实现：dry-run/apply 安装器、Flash-only 官方目录提取、实时额度路由、
  owner-only 单槽 bridge、配置验证器和 hash 安全卸载器。
- Plus 默认：无 Spark、Luna、DeepSeek 阈值 50%。
- Pro 默认：Spark 优先、Luna、DeepSeek 阈值 10%。
- 主线程 `config.toml`、model、provider 和 auth 不在写入范围内。
- API key 只使用 macOS Keychain；CLI 拒绝 `--api-key`。

## 已在隔离环境验证

- `npm test`：24 项测试通过。
- fake home 的 dry-run、apply、重复安装、verify、dry-run uninstall、正式
  uninstall 和冲突停止均通过。
- fake `config.toml` 的主模型/provider 哨兵在安装和卸载后保持不变。
- bridge 权限为 `0700/0600`，单槽忙检测、task 校验、原子归档、message/cwd
  脱敏和 follow-up 归档识别通过。
- 真实抓取 DeepSeek 官方 setup script 成功，缩减结果仅含一个
  `deepseek-v4-flash` 文本模型；脚本未执行。
- 生成的 `deepseek_worker.toml` 已通过 TOML 解析；安装文件权限符合设计。
- 敏感扫描未发现个人绝对路径、固定 UID、API key 值或明文 bearer token。
- 本地 Git 已初始化为 `main`，首个提交用于保存本轮已验证的 beta 基线。

## 尚未完成或未声称

- 未把本项目安装进用户真实 `~/.codex`，没有改变当前正在使用的配置。
- 未在真实 Codex Desktop 中运行本项目安装后的 DeepSeek 子任务；
  `runtimeVerified` 仍为 false。
- 未由用户人工验收。
- 尚无 GitHub remote、push、CI 运行、公开 release 或正式发布。
- V4 Pro 当前不受支持；图片、音视频、浏览器、桌面、MCP 和 computer use
  不属于 DeepSeek worker 范围。

# 发送给 Codex 的安装提示词

把下面整段内容发送到打开本仓库的 Codex Desktop 任务中。不要把 API key 粘贴到
对话里。

---

请为我配置本仓库的 `codex-third-party-workers`。严格执行以下流程：

1. 先完整阅读仓库 `AGENTS.md`、`README.md`、
   `docs/configuration-zh.md` 和 `docs/current-state.md`，并检查当前 worktree。
2. 在修改任何配置前，先向我确认：
   - 我要安装 `deepseek`、`minimax` 还是 `qwen` Provider Pack；只允许选择仓库
     README 标为内置的 Pack，不要把兼容性矩阵中的候选或暂不兼容模型当成已支持；
   - 我的套餐是 Plus 还是 Pro；
   - 是否真实具备 Spark worker；
   - 是否已经有可调用的 `luna_worker`；
   - 我希望通用额度低于多少百分比时才允许 fallback provider 接班；
   - 我是否确认主线程 model/provider/auth 必须保持不变；
   - 我是否同意把适合委派的任务正文发送到 provider API。
3. 不要让我在聊天窗口提供 API key。只指导我在 macOS 终端使用 Keychain 的
   无回显提示命令，并在我完成后只验证 Keychain 项是否存在。
4. 根据我的回答先运行安装器 dry-run，不得先加 `--apply`。向我报告：
   - 计划写入的文件；
   - 会备份的既有文件；
   - 阈值、Spark/Luna 状态；
   - 不会修改的 `~/.codex/config.toml` 和主线程模型边界。
5. 只有我明确同意 dry-run 结果后，才使用相同参数追加 `--apply`。不得执行
   provider 官方 shell 脚本；只允许安装器把它当作惰性文本解析。
6. 完成后运行 `node scripts/verify.mjs`，分别报告：
   本地已写入、配置已验证、Keychain 已连接、App 已重启、真实运行时已验证、
   用户已验收。不能把前一层写成后一层。
7. 在我重启 Codex Desktop 之前，不得宣称新 worker 已加载。重启后只用一个
   不敏感的文本/代码子任务验证路由；图片、音视频、浏览器、桌面、MCP 或凭据
   任务不得发给 fallback provider。
8. 遇到冲突、未知额度、bridge busy 或任何校验失败时停止外发，保留 OpenAI
   worker，并说明具体阻塞。不要用真实 Spark 试运行任务探测额度。

默认建议仅供我确认，不能代替我的回答：

- Plus 为 Spark=false、Luna=true、阈值 50%；
- 含 Spark 的 Pro 为 Spark=true、Luna=true、阈值 10%。

---

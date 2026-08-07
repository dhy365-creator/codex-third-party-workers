# 故障排查

## `DeepSeek API key is not provisioned`

不要把 key 发到聊天窗口，也不要使用命令行 `--api-key`。在系统终端执行：

```sh
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-deepseek-api-key -U -w
```

然后重新运行安装。`-w` 位于末尾时由 macOS 安全提示输入。

## 官方模型目录下载失败

先核对网络和 DeepSeek 官方 Codex 接入文档。也可保存官方脚本或模型目录后，
使用：

```sh
node scripts/install.mjs ... --catalog-source /absolute/local/path
```

本项目不会执行下载的脚本。官方 heredoc 标记或模型结构发生变化时会失败关闭，
而不是猜测内容。

## 一直选择 Spark

预检在 Spark 额度无法读取时必须保留请求的 OpenAI worker，不能把未知状态当成
额度耗尽。如果已明确看到 Spark 的额度错误，但控制面查询仍失败，应先修复网络
或 Codex 登录状态，不要发送“试运行任务”探测额度。

## 没有 Spark 的 Plus 用户

安装时选择 `--spark-available false`，并确认已有可调用的 `luna_worker`。建议把
DeepSeek 阈值设为 `50`。如果 Luna 实际不存在，请先配置 Luna 或关闭该回退链，
不要仅凭套餐名称宣称它可用。

## bridge busy

同一时间只允许一个 DeepSeek 子任务。先通过 Codex 的子代理状态确认任务是否仍
在运行。正常任务会把 `active/` 原子归档；不要手动覆盖 `active/task.json`，也不
要删除历史归档。

若子代理已经失联，由主线程在确认目标任务后调用安装的 bridge helper 将它归档
为 `failed`，再重新预检。归档前会把 message 和 cwd 脱敏。

## DeepSeek 收不到任务正文

这通常与 Codex Desktop collaboration v2 的加密 payload 兼容有关。不要让
DeepSeek 猜任务，也不要让它扫描聊天或归档目录。正确流程是主线程先运行预检，
由预检写入固定的 owner-only bridge；DeepSeek 只读 `active/task.json`。

## 为什么图片、浏览器或 MCP 没有效果

本项目只支持文本、代码、研究整理和本地验证。DeepSeek 当前 Responses API 对
图片/文件输入、computer use、MCP 等能力不提供本项目所需的完整支持，这些任务
必须留在 OpenAI 主线程或 OpenAI 子代理。

## `verify` 显示 `runtimeVerified: false`

这是正常且有意的。`verify` 只验证本地配置，不会为了验证而消耗额度或自动向
DeepSeek 发送任务。重启 Codex Desktop 后需要真实运行一次适合的子任务，并由
主线程复核，才能人工确认运行时可用。

## 卸载冲突

托管文件或 AGENTS 标记块被修改后，卸载会停止且不做部分删除。先查看冲突，保留
需要的用户改动，再恢复为安装清单中的内容或手动合并。不要直接覆盖用户文件。

Keychain 凭据和 bridge 历史归档不会被卸载器删除。

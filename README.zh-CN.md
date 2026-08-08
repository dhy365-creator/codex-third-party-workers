# codex-third-party-workers

[English](README.md) | **简体中文**

> 公开测试版 `0.3.0-beta.1`。这是非官方、仅支持 macOS 的项目，未经
> OpenAI、DeepSeek 或 MiniMax 官方背书。

本项目让 Codex Desktop 通过可配置的 Provider Pack 使用第三方模型子代理，
同时保持主线程的 OpenAI 模型、Provider 和认证不变。当前内置 Pack 为
**DeepSeek V4 Flash** 与 **MiniMax-M3**，DeepSeek 仍是默认选择。

## 使用前必读

- 第三方 Provider 的 API 费用独立于 Codex 会员订阅。
- 被委派的任务正文会发送给所选 Provider。不得委派凭据、隐私内容或无权外发的资料。
- 仅适合文本、代码、研究整理和本地验证。图片、音频、视频、浏览器控制、桌面控制、
  MCP 和 Computer Use 不在支持范围内。
- DeepSeek Pack 只支持 `deepseek-v4-flash` 并明确拒绝 V4 Pro；MiniMax Pack
  只支持 `MiniMax-M3`。
- 路由需要 Luna 时，用户必须已经配置好可用的 `luna_worker`；本仓库不会安装或修改 Luna。
- Codex Desktop 不保证原生拦截所有子代理调用。安装的预检脚本属于需要主代理主动执行的
  策略护栏，并不是系统级安全边界。

## 路由策略

套餐只提供默认阈值，实际路由以实时额度为准。

| 当前状态 | 选择的 Worker |
| --- | --- |
| Spark 仍有实时额度 | `spark-worker` |
| Spark 不可用，通用额度大于或等于阈值 | `luna_worker` |
| Spark 不可用，通用额度低于阈值，任务适合且桥接空闲 | Provider fallback，默认 `deepseek_worker` |
| 额度查询失败 | 保留可用的 OpenAI Worker，不外发给 Provider |
| Provider 不适合、不可用或桥接繁忙 | 有 Luna 时回退到 `luna_worker` |

建议默认值：

- Plus：无 Spark，优先 Luna，Provider 阈值 `50%`。
- 含 Spark 的 Pro：Spark 优先，其次 Luna，Provider 阈值 `10%`。

## 环境要求

- macOS，以及支持自定义子代理的 Codex Desktop。
- Node.js `>=20`。
- 已准备好的第三方 Provider API 凭据。
- 启用 Luna 回退时，需要可用的 `luna_worker`。

仅下载或克隆仓库并不能立即使用。还需要把 API key 存入 macOS Keychain、执行
dry-run、确认后应用配置、重启 Codex Desktop，并完成安装验证。

## 0. 下载仓库

```sh
git clone https://github.com/dhy365-creator/codex-third-party-workers.git
cd codex-third-party-workers
```

也可以在 GitHub 下载 ZIP，解压后进入该目录执行后续命令。

## 1. 安全保存 API key

在 macOS Terminal 中执行。请保留命令末尾的 `-w`，系统会提示输入 API key，
避免把 key 写入普通命令参数或 shell 历史：

按准备安装的 Pack 选择 Keychain service：

```sh
# DeepSeek
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-deepseek-api-key -U -w

# MiniMax
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-minimax-api-key -U -w
```

安装器只检查该 Keychain 项是否存在，不接受 `--api-key` 参数，也不会把密钥写入文件。

## 2. 先执行 dry-run

dry-run 是默认行为。它会把官方 Provider 目录来源作为普通文本读取，提取并校验
受支持的目录格式，然后只保留 Provider Pack 允许的文本能力目录；不会执行下载内容。

Plus 示例：

```sh
node scripts/install.mjs \
  --provider deepseek \
  --plan plus \
  --spark-available false \
  --luna-available true \
  --threshold 50 \
  --confirm-main-preserved \
  --consent-data
```

Pro 示例：

```sh
node scripts/install.mjs \
  --provider deepseek \
  --plan pro \
  --spark-available true \
  --luna-available true \
  --threshold 10 \
  --confirm-main-preserved \
  --consent-data
```

MiniMax 使用相同路由参数，只需把命令中的 Provider 改成 `--provider minimax`。
安装器一次管理一个当前路由的 Provider fallback；切换 Pack 不会改变主线程 OpenAI
模型、Provider 或认证。

离线安装可以追加：

```sh
--catalog-source /absolute/path/to/catalog-or-setup-script
```

## 3. 应用配置并验证

检查 dry-run 输出无误后，在原命令末尾追加 `--apply`，然后重启 Codex Desktop 并运行：

```sh
node scripts/verify.mjs
```

验证结果分为两个层级：

- `configured: true`：文件、权限、hash、模型目录、AGENTS 标记和 Keychain 检查通过。
- `runtimeVerified: false`：在真实运行一次 Codex 子代理任务并由主线程复核前，这是正常状态。

## 卸载

先预览，再正式执行：

```sh
node scripts/uninstall.mjs
node scripts/uninstall.mjs --apply
```

卸载器只删除 hash 未变化的托管文件和精确匹配的 AGENTS 标记块。发现冲突时会停止，
不会部分卸载或覆盖用户修改。Keychain 凭据和桥接历史归档会被保留。

## 安装内容

- `~/.codex/agents/<provider>_worker.toml`
- `~/.codex/model-catalogs/<provider-model>.json`
- `~/.codex/bin/subagent-preflight.mjs`
- `~/.codex/bin/codex-third-party-worker-bridge.mjs`
- `~/.codex/lib/codex-third-party-workers/`
- `~/.codex/codex-third-party-workers.json`
- `~/.codex/codex-third-party-workers-install.json`
- `~/.codex/codex-third-party-workers-backups/`
- `~/.codex/AGENTS.md` 中一段有明确边界标记的规则

官方模型目录和提示词会在安装时获取，不会直接收录在本仓库中。

## 开发与扩展 Provider Pack

```sh
npm test
```

测试使用临时 fake home 和注入的 Keychain、额度及网络实现，不访问真实 API key、
Keychain、Codex 额度、`~/.codex` 或外部网络。

本项目提供的是可扩展 Provider Pack 核心，并不代表所有第三方模型已经可以直接使用。
DeepSeek V4 Flash 与 MiniMax-M3 均已内置并通过隔离测试；MiniMax-M3 还通过了真实
Codex Desktop 子代理冒烟测试，公开安装器的 apply/verify 状态单独记录。
新增 Provider 需要以经过代码审查的方式修改
`src/provider-packs.mjs` 并补充测试；安装器不会加载任意远程 Pack manifest。

候选 Provider 至少需要满足：兼容 Codex 使用的 Responses API、支持命令读取凭据、
固定 HTTPS 元数据来源、明确模型和目录校验规则、限定文本/代码能力，并提供确定性的
离线测试。

更多资料：

- [中文配置指南](docs/configuration-zh.md)
- [架构说明](docs/architecture.md)
- [故障排查](docs/troubleshooting.md)
- [国产模型 Provider 兼容性矩阵](docs/provider-compatibility.zh-CN.md)
- [可直接发送给 Codex 的安装提示词](docs/CODEX_INSTALL_PROMPT.zh-CN.md)
- [安全策略](SECURITY.md)

## 官方参考资料

- [OpenAI：Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [OpenAI：Codex 配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)
- [DeepSeek：Codex 接入](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/codex/)
- [DeepSeek：Responses API 兼容说明](https://api-docs.deepseek.com/zh-cn/guides/responses_api/)
- [MiniMax：在 Codex 中使用 M3](https://platform.minimaxi.com/docs/token-plan/codex)
- [MiniMax：Responses API](https://platform.minimaxi.com/docs/api-reference/responses-create)

## 开源协议

MIT，详见 [LICENSE](LICENSE)。

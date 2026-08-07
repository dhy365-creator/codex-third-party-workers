# 配置指南

`codex-deepseek-worker` 把 DeepSeek V4 Flash 配置为 Codex Desktop 的有界
子代理，不替换主线程 OpenAI 模型。本版本为非官方、macOS-only、未发布 beta。

## 安装前确认

安装器会要求确认以下信息：

1. 套餐是 Plus 还是 Pro。
2. 账号是否真实具备 Spark，以及是否已经有可调用的 `luna_worker`。
3. DeepSeek 从剩余多少百分比开始接班。
4. 主线程的 model、provider、auth 保持不变。
5. 同意把适合委派的任务正文发送到 DeepSeek API。

建议默认值：

| 套餐 | Spark | Luna | DeepSeek 阈值 |
| --- | --- | --- | --- |
| Plus | 否 | 是 | 50% |
| Pro（含 Spark） | 是 | 是 | 10% |

套餐只用于生成默认值。每次路由仍读取实际额度；不能仅凭“Pro”推断 Spark
仍有剩余额度。

## 1. 将 API key 写入 macOS Keychain

在系统终端执行：

```sh
/usr/bin/security add-generic-password -a "$(id -un)" -s codex-deepseek-api-key -U -w
```

`-w` 放在命令末尾时，由 macOS 安全提示输入内容，不会把 key 放进普通命令
参数或 shell 历史。安装器没有 `--api-key` 参数，只检查这个 Keychain 项是否
存在。

## 2. 先做 dry-run

以下命令只读取和计算，不修改 `~/.codex`：

```sh
node scripts/install.mjs \
  --plan plus \
  --spark-available false \
  --luna-available true \
  --threshold 50 \
  --confirm-main-preserved \
  --consent-data
```

Pro 用户把 `plan` 改为 `pro`、Spark 收为 `true`、阈值改为 `10`。不传完整
参数并在交互式终端运行时，安装器会逐项询问。

dry-run 会从 DeepSeek 官方地址下载安装脚本的文本，但绝不执行它；只提取
`CODEX_MODELS_JSON`，验证后保留 `deepseek-v4-flash`。离线时可追加：

```sh
--catalog-source /absolute/path/to/local-catalog-or-setup-script
```

仓库不附带官方完整目录或系统提示词。

## 3. 正式写入

检查 dry-run 输出无误后，在相同命令末尾添加：

```sh
--apply
```

写入范围仅包括：

- DeepSeek 自定义子代理文件。
- Flash-only 的运行时模型目录。
- 实时额度预检与单槽任务桥模块。
- `~/.codex/AGENTS.md` 内的一段带起止标记的规则。
- owner-only 的安装清单和必要备份。

不会修改 `~/.codex/config.toml`、主模型、主 provider、主 auth 或数据库。

## 4. 重启并核验

重启 Codex Desktop 后执行：

```sh
node scripts/verify.mjs
```

`configured: true` 只表示本地文件、权限、hash、Keychain 和 Flash-only 目录
正确。`runtimeVerified` 仍会是 `false`，直到你真正运行一次适合的文本/代码
子任务并由主线程复核结果。

## 路由规则

1. Spark 真实有额度时优先 Spark。
2. Spark 不可用后，通用额度高于或等于阈值时用 Luna。
3. 只有低于阈值、任务适合、Keychain/配置正常且桥为空闲时才用 DeepSeek。
4. 额度查询失败时保留 OpenAI worker，不自动外发给 DeepSeek。
5. 图片、音视频、浏览器、桌面和多模态任务不得交给 DeepSeek。

Codex Desktop 目前不保证原生拦截所有协作调用，因此预检属于需要主代理主动
执行的策略护栏，不是系统级安全边界。

## 卸载

```sh
node scripts/uninstall.mjs
node scripts/uninstall.mjs --apply
```

默认仍是 dry-run。正式卸载只删除 hash 未变化的托管文件，并只移除精确匹配
的 AGENTS 标记块；发现用户修改后会停止，不做部分卸载。Keychain 凭据和历史
桥接归档不会自动删除。

# Codex

Synthetic official-document-shaped fixture for parser tests.

```json
{
  "models": [
    {
      "slug": "MiniMax-M3",
      "display_name": "MiniMax-M3",
      "description": "MiniMax fixture",
      "default_reasoning_level": "high",
      "supported_reasoning_levels": [
        { "effort": "none", "description": "Think-Off" },
        { "effort": "high", "description": "Deep" }
      ],
      "shell_type": "shell_command",
      "visibility": "list",
      "supported_in_api": true,
      "supports_reasoning_summaries": true,
      "default_reasoning_summary": "none",
      "support_verbosity": false,
      "truncation_policy": { "mode": "bytes", "limit": 10000 },
      "supports_parallel_tool_calls": true,
      "experimental_supported_tools": [],
      "input_modalities": ["text", "image"]
    }
  ]
}
```

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function realPathOrResolved(value) {
  const resolved = path.resolve(value);
  try {
    return await fs.realpath(resolved);
  } catch (error) {
    if (error?.code === 'ENOENT') return resolved;
    throw error;
  }
}

function projectLayers(cwd, homeDir) {
  const layers = [];
  let current = path.resolve(cwd);
  while (true) {
    if (current !== homeDir) layers.unshift(current);
    const parent = path.dirname(current);
    if (parent === current) return layers;
    current = parent;
  }
}

export async function inspectProjectCustomAgentLayers({
  cwd = process.cwd(),
  homeDir = os.homedir(),
} = {}) {
  const definitions = [];
  const issues = [];
  try {
    const [resolvedCwd, resolvedHome] = await Promise.all([
      realPathOrResolved(cwd),
      realPathOrResolved(homeDir),
    ]);
    for (const layer of projectLayers(resolvedCwd, resolvedHome)) {
      const directory = path.join(layer, '.codex', 'agents');
      let info;
      try {
        info = await fs.lstat(directory);
      } catch (error) {
        if (error?.code === 'ENOENT') continue;
        issues.push('project custom-agent directory could not be inspected');
        continue;
      }
      if (!info.isDirectory() || info.isSymbolicLink()) {
        issues.push('project custom-agent directory is not a regular directory');
        continue;
      }
      try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.endsWith('.toml')) definitions.push(path.join(directory, entry.name));
        }
      } catch {
        issues.push('project custom-agent directory could not be read');
      }
    }
  } catch {
    issues.push('project custom-agent layers could not be inspected');
  }
  return {
    safe: definitions.length === 0 && issues.length === 0,
    definitions,
    issues,
  };
}

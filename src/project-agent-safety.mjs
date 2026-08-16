import fs from 'node:fs/promises';
import path from 'node:path';

async function projectRootFor(cwd) {
  let current = path.resolve(cwd);
  while (true) {
    try {
      await fs.lstat(path.join(current, '.git'));
      return current;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(cwd);
    current = parent;
  }
}

function projectLayers(root, cwd) {
  const layers = [];
  let current = path.resolve(cwd);
  while (true) {
    layers.unshift(current);
    if (current === root) return layers;
    const parent = path.dirname(current);
    if (parent === current) return [path.resolve(cwd)];
    current = parent;
  }
}

export async function inspectProjectCustomAgentLayers({ cwd = process.cwd() } = {}) {
  const definitions = [];
  const issues = [];
  try {
    const requestedCwd = path.resolve(cwd);
    let resolvedCwd = requestedCwd;
    try {
      resolvedCwd = await fs.realpath(requestedCwd);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    const root = await projectRootFor(resolvedCwd);
    for (const layer of projectLayers(root, resolvedCwd)) {
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

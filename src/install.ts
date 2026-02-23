import { existsSync, readdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { loadPackageJson } from './package';

const HOME = homedir();
const APPS = [
  { name: 'VS Code', path: join(HOME, '.vscode') },
  { name: 'Cursor', path: join(HOME, '.cursor') },
  { name: 'Antigravity', path: join(HOME, '.antigravity') },
];

const { name, version } = loadPackageJson();
const THEME_PATH = `extensions/${name}-${version}`;

const EXCLUDE_PATTERNS = [
  '.*', // Hidden files
  'node_modules', // Dependencies
  '.tsc', // Build output
  '*.vsix', // VSCode extension package
];

// Convert patterns to rsync exclude arguments
const RSYNC_EXCLUDE = EXCLUDE_PATTERNS.map(
  (pattern) => `--exclude="${pattern}"`,
).join(' ');

// Clean up existing theme installations
function cleanupExistingTheme(extensionsPath: string) {
  // TODO: Perhaps it's not a very good idea, because VS Code might not
  // know that a theme has been removed (?)

  if (!existsSync(extensionsPath)) return;

  const extensionsDir = join(extensionsPath, 'extensions');
  if (!existsSync(extensionsDir)) return;

  const entries = readdirSync(extensionsDir);
  for (const entry of entries) {
    if (entry.startsWith(name)) {
      const fullPath = join(extensionsDir, entry);
      console.log(`Removing existing theme: ${fullPath}`);
      rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

try {
  for (const app of APPS) {
    if (existsSync(app.path)) {
      console.log(`Installing for ${app.name}...`);
      cleanupExistingTheme(app.path);
      execSync(`rsync -av ${RSYNC_EXCLUDE} . "${join(app.path, THEME_PATH)}"`);
      console.log(`${app.name} installation complete`);
    }
  }
} catch (error) {
  console.error('Installation failed:', error);
  process.exit(1);
}

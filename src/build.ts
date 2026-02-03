import { readdirSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";

import type { Theme, ThemeDefinition, UiTheme } from "./types";
import { loadPackageJson, savePackageJson, ThemeContribution } from "./package";
import { createTheme, registerTheme, resolveTheme } from "./theme";

const DEFS_DIR = join(__dirname, "defs");
const THEMES_DIR = join(__dirname, "../themes");

// Convert theme name to filename: "Lyth Dark Warm" -> "lyth-dark-warm"
function nameToFilename(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Scan defs directory and load all theme definitions
function loadAllThemeDefinitions(): ThemeDefinition[] {
  const files = readdirSync(DEFS_DIR).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
  const definitions: ThemeDefinition[] = [];

  for (const file of files) {
    const { name } = parse(file);
    try {
      const definition: ThemeDefinition = require(`./defs/${name}`).default;
      definitions.push(definition);
    } catch (error) {
      console.error(`Failed to load theme definition from ${file}:`, error);
    }
  }

  return definitions;
}

// Sort definitions so base themes come before derived themes, and validate
function sortByDependency(definitions: ThemeDefinition[]): ThemeDefinition[] {
  const byName = new Map(definitions.map(d => [d.name, d]));
  const sorted: ThemeDefinition[] = [];
  const visited = new Set<string>();

  function visit(def: ThemeDefinition) {
    if (visited.has(def.name)) return;

    // Visit parent first if it exists
    if (def.extends && byName.has(def.extends)) {
      visit(byName.get(def.extends)!);
    }

    // Validate: base themes must have uiTheme
    if (!def.extends && !def.uiTheme) {
      throw new Error(`Base theme "${def.name}" must specify uiTheme`);
    }

    visited.add(def.name);
    sorted.push(def);
  }

  for (const def of definitions) {
    visit(def);
  }

  return sorted;
}

// Resolve uiTheme by walking up the inheritance chain
function resolveUiTheme(def: ThemeDefinition, byName: Map<string, ThemeDefinition>): UiTheme {
  if (def.uiTheme) return def.uiTheme;
  if (def.extends) {
    const parent = byName.get(def.extends);
    if (parent) return resolveUiTheme(parent, byName);
  }
  // Should never reach here if validation passed
  throw new Error(`Cannot resolve uiTheme for "${def.name}"`);
}

// Generate contributes.themes entry for a theme definition
function toContribution(def: ThemeDefinition, byName: Map<string, ThemeDefinition>): ThemeContribution {
  const filename = nameToFilename(def.name);
  return {
    label: def.name,
    uiTheme: resolveUiTheme(def, byName),
    path: `./themes/${filename}.json`,
  };
}

// Saves theme as a JSON file inside themes/ directory
function saveTheme(theme: Theme, filename: string) {
  if (!filename.endsWith(".json")) {
    filename += ".json";
  }

  const outputPath = join(THEMES_DIR, filename);
  const data = JSON.stringify(theme, null, 2);
  writeFileSync(outputPath, data);
  console.log(`Theme generated: ${outputPath}`);
}

// Main build process
function buildThemes() {
  // Load all theme definitions from defs/
  const definitions = loadAllThemeDefinitions();

  if (definitions.length === 0) {
    console.error("No theme definitions found in src/defs/");
    process.exit(1);
  }

  // Build lookup map
  const byName = new Map(definitions.map(d => [d.name, d]));

  // Sort so base themes are registered before derived ones (also validates)
  const sorted = sortByDependency(definitions);

  // Register all themes
  for (const def of sorted) {
    registerTheme(def);
  }

  // Update package.json contributes section
  const packageJson = loadPackageJson();
  packageJson.contributes.themes = sorted.map(def => toContribution(def, byName));
  savePackageJson(packageJson);

  // Build all theme files
  for (const def of sorted) {
    const palette = resolveTheme(def.name);
    const filename = nameToFilename(def.name);
    saveTheme(createTheme(def.name, palette), filename);
  }

  console.log(`\nBuilt ${sorted.length} theme(s)`);
}

// Execute the build
buildThemes();
